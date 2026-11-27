import { createClient } from "npm:@supabase/supabase-js@2";
import { timingSafeEqual } from "node:crypto";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const bucket = db.storage.from("srijan-manuscripts");
const formId = "8NxPkk";
const maxBytes = 25 * 1024 * 1024;
const inputIds = {
  author: "78579021-4a1c-4086-be8e-ef574f730cb1",
  email: "80f5f7c5-9720-4107-945a-ffd2481c9924",
  institution: "aeed59d1-7578-4eed-884a-05551ee9afe1",
  title: "0082ff24-5d2a-4b1f-8b0d-a09a64d009ad",
  domain: "237ccd74-2fee-4f06-a996-5a68c2114291",
  type: "0929f11b-40fb-41ca-8a8f-657135167a9e",
  abstract: "292b071c-a407-4c7d-9964-85c9af47af0d",
  file: "0759d327-1b80-4b4d-a762-0bd4c8eb7b5a",
};
type Field = { key: string; label: string; type: string; value: unknown; options?: {id: string; text: string}[] };
const contentTypes: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  tex: "application/x-tex",
};

async function signed(body: Uint8Array, signature: string, secret: string) {
  if (!/^[A-Za-z0-9+/]{43}=$/.test(signature)) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, Uint8Array.from(body)));
  return timingSafeEqual(expected, Uint8Array.from(atob(signature), (character) => character.charCodeAt(0)));
}

function match(fields: Field[], id: string, type: string, label: RegExp) {
  return fields.find((field) => field.type === type && field.key?.endsWith("_" + id)) ??
    fields.find((field) => field.type === type && label.test(field.label));
}
function text(field?: Field) {
  return typeof field?.value === "string" ? field.value.trim() : "";
}
function choice(field?: Field) {
  if (!Array.isArray(field?.value)) return text(field);
  return field.value.map((id) => field.options?.find((option) => option.id === id)?.text).filter(Boolean).join(", ");
}

async function copyDraft(id: string, draft: { name: string; url: string; size?: number }) {
  const extension = /\.([a-z0-9]{1,10})$/i.exec(draft.name.trim())?.[1].toLowerCase() ?? "";
  if (!Object.hasOwn(contentTypes, extension) || Number(draft.size) > maxBytes) {
    console.warn("Tally draft remains in Tally", {
      reason: !Object.hasOwn(contentTypes, extension) ? "unsupported extension" : "size limit",
      extension, size: Number(draft.size) || null,
    });
    return null;
  }
  const url = new URL(draft.url);
  const tallyAsset = url.origin === "https://storage.tally.so" ||
    (url.origin === "https://storage.googleapis.com" && /^\/tally-response-assets(?:-[a-z]+)?\//.test(url.pathname));
  if (!tallyAsset || url.username || url.password) {
    throw new Error("Unexpected draft URL");
  }
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(25000) });
  if (!response.ok || !response.body || Number(response.headers.get("content-length")) > maxBytes) {
    throw new Error("Draft download failed");
  }
  let size = 0;
  const bounded = response.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      size += chunk.byteLength;
      if (size > maxBytes) throw new Error("Draft exceeds 25 MB");
      controller.enqueue(chunk);
    },
  }));
  const bytes = await new Response(bounded).arrayBuffer();
  if (!bytes.byteLength) throw new Error("Empty manuscript");
  const path = "tally/" + id + "/manuscript." + extension;
  const { error } = await bucket.upload(path, bytes, { contentType: contentTypes[extension], upsert: true });
  if (error) throw new Error("Storage upload failed: " + error.name);
  return path;
}

async function receipt(row: { id: string; email: string; title: string }) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("STUDIO_NOTIFICATION_FROM");
  if (!apiKey || !from) throw new Error("Resend secrets are missing");
  const result = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
      "Idempotency-Key": "srijan-tally-receipt/" + row.id,
    },
    body: JSON.stringify({
      from: "SRIJAN Global Review <" + from + ">",
      to: [row.email],
      subject: "SRIJAN Global Review | Manuscript received | " + row.id,
      text: [
        "Dear Author,",
        "We received your manuscript for editorial screening.",
        "Manuscript: " + row.title + "\nTracking ID: " + row.id,
        "SRIJAN Global Review Editorial Team",
      ].join("\n\n"),
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!result.ok) throw new Error("Resend returned HTTP " + result.status);
  const { error } = await db.from("srijan_submissions").update({ tally_receipt_at: new Date().toISOString() }).eq("id", row.id);
  if (error) throw new Error("Could not record the receipt");
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const secret = Deno.env.get("TALLY_SIGNING_SECRET");
  const signature = request.headers.get("Tally-Signature");
  if (!secret || !signature) return new Response(null, { status: 401 });
  try {
    const raw = new Uint8Array(await request.arrayBuffer());
    if (raw.length > 256 * 1024 || !await signed(raw, signature, secret)) return new Response(null, { status: 401 });
    const event = JSON.parse(new TextDecoder().decode(raw));
    const data = event.data;
    if (event.eventType !== "FORM_RESPONSE" || data?.formId !== formId ||
      typeof data.submissionId !== "string" || !/^[A-Za-z0-9_-]{1,80}$/.test(data.submissionId) ||
      !Array.isArray(data.fields)) return new Response(null, { status: 422 });

    const id = "SRJ-TALLY-" + data.submissionId;
    const findRow = () => db.from("srijan_submissions")
      .select("id,title,email,tally_receipt_at,storage_path").eq("tally_submission_id", data.submissionId).maybeSingle();
    let { data: row, error } = await findRow();
    if (error) throw new Error("Submission lookup failed: " + error.code);
    const fields: Field[] = data.fields;
    const upload = match(fields, inputIds.file, "FILE_UPLOAD", /manuscript|upload/i)?.value;
    if (!Array.isArray(upload) || upload.length !== 1 ||
        typeof upload[0]?.name !== "string" || typeof upload[0]?.url !== "string") {
      return new Response(null, { status: 422 });
    }
    const draft = upload[0];
    if (!row) {
      const author = text(match(fields, inputIds.author, "INPUT_TEXT", /corresponding author name/i));
      const email = text(match(fields, inputIds.email, "INPUT_EMAIL", /institutional email/i));
      const title = text(match(fields, inputIds.title, "INPUT_TEXT", /manuscript title/i));
      if (!author || !title || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) {
        return new Response(null, { status: 422 });
      }
      const timestamp = new Date(data.createdAt);
      const date = Number.isNaN(timestamp.getTime()) ? new Date().toISOString() : timestamp.toISOString();
      const { error: insertError } = await db.from("srijan_submissions").upsert({
        id, title, author, email,
        institution: text(match(fields, inputIds.institution, "INPUT_TEXT", /institution|department/i)),
        domain: choice(match(fields, inputIds.domain, "DROPDOWN", /subject|discipline|domain/i)),
        type: choice(match(fields, inputIds.type, "DROPDOWN", /type|category/i)),
        abstract: text(match(fields, inputIds.abstract, "TEXTAREA", /abstract/i)),
        file: draft.name, date: date.slice(0, 10), created_at: date,
        status: "Screening", tally_submission_id: data.submissionId,
      }, { onConflict: "tally_submission_id", ignoreDuplicates: true });
      if (insertError) throw new Error("Submission insert failed: " + insertError.code);
      ({ data: row, error } = await findRow());
      if (error || !row) throw new Error("Could not confirm saved submission");
    }
    let storagePath = row.storage_path;
    if (!storagePath) {
      storagePath = await copyDraft(data.submissionId, draft);
      if (storagePath) {
        const { error } = await db.from("srijan_submissions").update({ storage_path: storagePath }).eq("id", id);
        if (error) throw new Error("Could not record the stored draft");
      }
    }
    if (!row.tally_receipt_at) await receipt(row);
    return Response.json({ id, fileSynced: Boolean(storagePath) });
  } catch (error) {
    console.error("Tally sync failed", error instanceof Error ? error.message : "Unexpected error");
    return new Response(null, { status: 503 });
  }
});
