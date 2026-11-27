begin;

alter table public.srijan_submissions
    add column if not exists storage_path text,
    add column if not exists tally_submission_id text unique,
    add column if not exists tally_receipt_at timestamptz;

create table if not exists public.srijan_editors (
    user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.srijan_editors enable row level security;
revoke all on public.srijan_editors from anon, authenticated;
grant select on public.srijan_editors to service_role;

create or replace function public.srijan_is_editor()
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.srijan_editors where user_id = auth.uid()); $$;
revoke all on function public.srijan_is_editor() from public;
grant execute on function public.srijan_is_editor() to authenticated;

alter table public.srijan_submissions enable row level security;
create policy "Tally submissions are visible only to editors"
on public.srijan_submissions as restrictive for select to anon, authenticated
using (case when tally_submission_id is null then true
            when (select auth.uid()) is null then false
            else (select public.srijan_is_editor()) end);

create policy "Prevent client inserts with a Tally ID"
on public.srijan_submissions as restrictive for insert to anon, authenticated
with check (tally_submission_id is null and tally_receipt_at is null and storage_path is null);

create policy "Prevent client writes to Tally records"
on public.srijan_submissions as restrictive for update to anon, authenticated
using (tally_submission_id is null)
with check (tally_submission_id is null and tally_receipt_at is null and storage_path is null);

create policy "Prevent client deletes of Tally records"
on public.srijan_submissions as restrictive for delete to anon, authenticated
using (tally_submission_id is null);

grant select, insert, update on public.srijan_submissions to service_role;
commit;
