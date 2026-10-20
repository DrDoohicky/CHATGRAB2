-- Run in Supabase SQL Editor. Do not expose service-role keys to browsers.
create table if not exists public.conversation_libraries (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 thread_id text not null,
 content jsonb not null,
 updated_at timestamptz not null default now(),
 unique (owner_id, thread_id)
);
create index if not exists conversation_libraries_owner_idx on public.conversation_libraries(owner_id);
alter table public.conversation_libraries enable row level security;
revoke all on public.conversation_libraries from anon;
grant select, insert, update, delete on public.conversation_libraries to authenticated;
drop policy if exists "library_owner_select" on public.conversation_libraries;
create policy "library_owner_select" on public.conversation_libraries for select to authenticated using ((select auth.uid()) = owner_id);
drop policy if exists "library_owner_insert" on public.conversation_libraries;
create policy "library_owner_insert" on public.conversation_libraries for insert to authenticated with check ((select auth.uid()) = owner_id);
drop policy if exists "library_owner_update" on public.conversation_libraries;
create policy "library_owner_update" on public.conversation_libraries for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
drop policy if exists "library_owner_delete" on public.conversation_libraries;
create policy "library_owner_delete" on public.conversation_libraries for delete to authenticated using ((select auth.uid()) = owner_id);
