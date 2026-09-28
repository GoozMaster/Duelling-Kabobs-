-- What's in Stock (/stock) shows the pantry to every visitor, view-only.
--
-- This adds a public SELECT policy alongside the existing admin FOR ALL
-- policy. Permissive policies OR together, so:
--   - SELECT: anyone (anon or signed in) sees every row.
--   - INSERT / UPDATE / DELETE: still only the admin. No other policy grants
--     them, and with RLS on, an unmatched write is refused.
--
-- The rows are item names, categories and timestamps — nothing personal —
-- but this does make the pantry readable straight from PostgREST with the
-- publishable key, not only through the page. That is the intent.

create policy "pantry items are publicly readable"
  on public.pantry_items for select
  to anon, authenticated
  using (true);
