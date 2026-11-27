begin;
alter table public.srijan_submissions add column if not exists storage_path text;
create table if not exists public.srijan_editors (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.srijan_editors enable row level security;
revoke all on public.srijan_editors from anon, authenticated;
grant select on public.srijan_editors to service_role;
create or replace function public.srijan_is_editor() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.srijan_editors where user_id = auth.uid()); $$;
revoke all on function public.srijan_is_editor() from public;
grant execute on function public.srijan_is_editor() to authenticated;
drop policy if exists "Allow public insert to srijan_submissions" on public.srijan_submissions;
drop policy if exists "Allow public select from srijan_submissions" on public.srijan_submissions;
drop policy if exists "Allow public update to srijan_submissions" on public.srijan_submissions;
revoke all on public.srijan_submissions from anon, authenticated;
grant select on public.srijan_submissions to authenticated;
grant select, insert, update on public.srijan_submissions to service_role;
create policy "Journal editors read submissions" on public.srijan_submissions
for select to authenticated using ((select public.srijan_is_editor()));
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('srijan-manuscripts', 'srijan-manuscripts', false, 26214400,
    array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
commit;
