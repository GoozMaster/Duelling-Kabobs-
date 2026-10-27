-- Chef App — a video or a photo for each recipe.
--
-- A recipe can carry a YouTube link (rendered as an embedded player) or, when
-- it has none, a link to a photo of the finished dish. Both are optional and
-- both are plain text columns: nothing is uploaded or stored by this app, so
-- there is no storage bucket, policy or quota to manage.
--
-- save_recipe() is deliberately NOT touched. It writes only the columns it
-- names, so these two are left alone by every edit made through the recipe
-- form. They are set by a separate admin-only update from the recipe page,
-- which RLS already restricts to the admin account (recipes UPDATE policy).
--
-- The CHECKs are the database half of a guard the app applies too: only
-- http(s) URLs may be stored, so a `javascript:` or `data:` value can never
-- reach the page even if written by hand in the SQL editor. NULL means "none".

alter table public.recipes
  add column youtube_url text,
  add column image_url   text;

alter table public.recipes
  add constraint recipes_youtube_url_http check (youtube_url is null or youtube_url ~* '^https?://'),
  add constraint recipes_image_url_https  check (image_url   is null or image_url   ~* '^https://');

comment on column public.recipes.youtube_url is
  'A YouTube link (watch, youtu.be, shorts or embed form) shown as an embedded player on the recipe page. Null when there is none.';
comment on column public.recipes.image_url is
  'https URL of a photo of the finished dish. Shown only when the recipe has no youtube_url. Null when there is none.';
