import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const bucket = db.storage.from("srijan-manuscripts");
const maxSize = 25 * 1024 * 1024;
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
};
const messages: Record<string, string> = {
  "Submission received": "We received your manuscript and saved the attached draft.",
  "Under Review": "Your manuscript has moved to review.",
  "Accepted": "Your manuscript has been accepted. The editorial team will follow up with next steps.",
  "Revision": "The editorial team has requested a revision. Please contact the journal for details.",
  "Rejected": "The editorial team has declined your manuscript for publication. Thank you for submitting your work.",
};

function json(data: object, status = 200) {
  return Response.json(data, { status, headers });
}

async function notify(row: {id: string; title: string; email: string}, event: string, key: string) {
  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("STUDIO_NOTIFICATION_FROM");
    if (!apiKey || !from) throw new Error("Email secrets are missing");
    const replyTo = Deno.env.get("SRIJAN_REPLY_TO");
    const result = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + apiKey, "Content-Type": "application/json", "Idempotency-Key": key },
      body: JSON.stringify({
        from: "SRIJAN Global Review <" + from + ">",
        to: [row.email],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: event + " | SRIJAN Global Review | " + row.id,
        text: ["Dear Author,", messages[event], "Manuscript: " + row.title + "\nTracking ID: " + row.id,
          "SRIJAN Global Review Editorial Team"].join("\n\n"),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!result.ok) throw new Error("Resend HTTP " + result.status);
    return true;
  } catch (error) {
    console.error("Email failed", row.id, event, error instanceof Error ? error.message : "");
    return false;
  }
}

async function submit(request: Request) {
  if (Number(request.headers.get("content-length")) > maxSize + 100000) {
    return json({ error: "The manuscript must be 25 MB or smaller." }, 413);
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !file.size || file.size > maxSize || file.name.length > 255) {
    return json({ error: "Choose a PDF or DOCX manuscript up to 25 MB." }, 400);
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  const pdf = extension === "pdf" && new TextDecoder().decode(signature) === "%PDF-";
  const docx = extension === "docx" && signature[0] === 80 && signature[1] === 75 &&
    signature[2] === 3 && signature[3] === 4;
  if (!pdf && !docx) return json({ error: "Choose a PDF or DOCX manuscript." }, 400);

  const fields = ["author", "email", "title", "institution", "domain", "type", "abstract"];
  const entry = Object.fromEntries(fields.map((field) => [field, String(form.get(field) ?? "").trim()]));
  if (!entry.author || !entry.title || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(entry.email) ||
      fields.some((field) => entry[field].length > (field === "abstract" ? 20000 : 500))) {
    return json({ error: "Check the author name, email, title, and field lengths." }, 400);
  }

  const uuid = crypto.randomUUID();
  const id = "SRJ-" + new Date().getUTCFullYear() + "-" + uuid.replaceAll("-", "").toUpperCase();
  const path = uuid + "/manuscript." + extension;
  const contentType = pdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  const { error: uploadError } = await bucket.upload(path, file, { contentType });
  if (uploadError) throw uploadError;
  const { error: insertError } = await db.from("srijan_submissions").insert({
    ...entry, id, file: file.name, storage_path: path, status: "Screening",
  });
  if (insertError) {
    const { data, error } = await db.from("srijan_submissions").select("id").eq("id", id).maybeSingle();
    if (error || !data) {
      if (!error && (await bucket.remove([path])).error) console.error("Upload cleanup failed", id);
      throw insertError;
    }
  }
  return json({ id, emailSent: await notify({ id, title: entry.title, email: entry.email }, "Submission received", id) }, 201);
}

async function edit(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return json({ error: "Sign in as a journal editor." }, 401);
  const { data: { user } } = await db.auth.getUser(token);
  if (!user) return json({ error: "Sign in as a journal editor." }, 401);
  const { data: editor, error: editorError } = await db.from("srijan_editors").select("user_id")
    .eq("user_id", user.id).maybeSingle();
  if (editorError) throw editorError;
  if (!editor) return json({ error: "This account is not registered as a journal editor." }, 403);

  const { action, id, status } = await request.json();
  if (typeof id !== "string") return json({ error: "A tracking ID is required." }, 400);
  const { data: row, error } = await db.from("srijan_submissions").select("id,title,email,status,storage_path,file")
    .eq("id", id).maybeSingle();
  if (error) throw error;
  if (!row) return json({ error: "Submission not found." }, 404);
  if (action === "download") {
    if (!row.storage_path) return json({ error: "This submission has no uploaded manuscript." }, 404);
    const { data, error } = await bucket.createSignedUrl(row.storage_path, 60, { download: row.file || true });
    if (error) throw error;
    return json({ url: data.signedUrl });
  }
  if (action !== "status" || !["Screening", "Under Review", "Accepted", "Revision", "Rejected"].includes(status)) {
    return json({ error: "Choose a valid editorial status." }, 400);
  }
  if (row.status === status) return json({ status, emailSent: null });
  const time = new Date().toISOString();
  const query = db.from("srijan_submissions").update({ status, updated_at: time }).eq("id", id);
  const { data: updated, error: updateError } = await (row.status === null
    ? query.is("status", null) : query.eq("status", row.status)).select("id").maybeSingle();
  if (updateError) throw updateError;
  if (!updated) return json({ error: "Another editor updated this submission. Refresh and try again." }, 409);
  const emailSent = row.storage_path && status !== "Screening" ? await notify(row, status, id + "/" + time) : null;
  return json({ status, emailSent });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    if (request.headers.get("content-type")?.startsWith("multipart/form-data")) {
      if (Deno.env.get("SRIJAN_DIRECT_UPLOAD_ENABLED") !== "true") {
        return json({ error: "Use the journal's Tally form to submit a manuscript." }, 403);
      }
      return await submit(request);
    }
    return await edit(request);
  } catch (error) {
    console.error("Manuscript request failed", error instanceof Error ? error.message : "");
    return json({ error: "The journal could not complete the request. Please try again." }, 500);
  }
});
