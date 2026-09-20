-- Chef App — Row Level Security.
--
-- WHY THIS IS IN THE DATABASE AND NOT JUST IN SERVER ACTIONS:
-- this app ships only the publishable (anon) key. That key reaches PostgREST
-- directly at https://<ref>.supabase.co/rest/v1/* from any browser on the
-- internet, completely bypassing Next.js. Checks written in a Server Action
-- would protect nothing. These policies are the only real boundary.
--
-- !! KEEP IN SYNC !! The email literal in is_admin() below must match the
-- ADMIN_EMAIL environment variable that the /login route checks (Section 1).
-- Changing the admin means editing this function AND that env var.

-- Single source of truth for "is the caller the admin?". Every policy calls it,
-- so rotating the admin identity is one CREATE OR REPLACE rather than a dozen
-- policy rewrites.
--
-- `stable` lets the planner inline it, so there is no per-row cost.
-- `set search_path = ''` pre-empts Supabase's "function_search_path_mutable"
-- security advisory; auth.jwt() is already schema-qualified, so nothing breaks.
create or replace function public.is_admin()
  returns boolean
  language sql
  stable
  security invoker
  set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'neshrati1@gmail.com'
$$;

comment on function public.is_admin() is
  'True when the caller''s JWT email matches the single admin account. Keep in sync with ADMIN_EMAIL.';

alter table public.cuisines     enable row level security;
alter table public.recipes      enable row level security;
alter table public.ingredients  enable row level security;
alter table public.pantry_items enable row level security;

-- Public showcase tables: anyone may read, only the admin may write.
--
-- Permissive policies OR together, so the admin's FOR ALL policy sits alongside
-- the public SELECT policy without either one suppressing the other.

create policy "cuisines are publicly readable"
  on public.cuisines for select
  to anon, authenticated
  using (true);

create policy "cuisines are writable by the admin"
  on public.cuisines for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "recipes are publicly readable"
  on public.recipes for select
  to anon, authenticated
  using (true);

create policy "recipes are writable by the admin"
  on public.recipes for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "ingredients are publicly readable"
  on public.ingredients for select
  to anon, authenticated
  using (true);

create policy "ingredients are writable by the admin"
  on public.ingredients for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- The pantry is private. Note the deliberate absence of any policy granting
-- `anon` access: with RLS on and no matching policy, anonymous reads return
-- zero rows rather than an error. That is the intended behaviour.
create policy "pantry items are admin-only"
  on public.pantry_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
