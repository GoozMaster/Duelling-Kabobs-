-- Chef App — core schema.
--
-- Single-admin model: there is no per-user scoping and no multi-tenant column
-- anywhere. Every row belongs to the one admin; the public simply reads it.
-- Access control lives entirely in 20260920000200_rls_policies.sql.

-- Cuisine vocabulary. Small, shared, and referenced by recipes.
create table public.cuisines (
  name       text primary key,
  created_at timestamptz not null default now()
);

comment on table public.cuisines is
  'Shared cuisine vocabulary. The Add/Edit Recipe form inserts here when the admin picks "Other".';

-- Recipes are public the instant they are saved: there is deliberately no
-- `published` flag and no `featured` flag (the Home page samples at random).
create table public.recipes (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  instructions text not null,
  cuisine      text references public.cuisines(name) on update cascade on delete restrict,
  needs_review boolean not null default false,
  created_at   timestamptz not null default now()
);

comment on column public.recipes.cuisine is
  'Nullable: URL import may not resolve a cuisine, leaving it for the admin to pick.';
comment on column public.recipes.needs_review is
  'True only for CSV bulk imports awaiting manual required/optional tagging. Admin-visible only.';

-- One row per ingredient line. `group_label` is what makes multi-part recipes
-- (a dough, a filling, a glaze) render as labeled groups instead of one flat list.
create table public.ingredients (
  id           uuid primary key default gen_random_uuid(),
  recipe_id    uuid not null references public.recipes(id) on delete cascade,
  group_label  text,
  sort_order   integer not null default 0,
  name         text not null,
  required     boolean not null default true,
  substitution text
);

comment on column public.ingredients.group_label is
  'Sub-component label, e.g. "Dough" or "Glaze". Null means the ingredient is ungrouped.';
comment on column public.ingredients.required is
  'False marks an optional/garnish ingredient, which never disqualifies a pantry match.';
comment on column public.ingredients.substitution is
  'Free-text, admin-entered only. Never AI-generated — that is a project-wide constraint.';

-- The admin's own pantry. Private data, not part of the public showcase.
create table public.pantry_items (
  id         uuid primary key default gen_random_uuid(),
  section    text not null check (section in ('staple', 'standing_protein', 'fridge', 'freezer')),
  category   text,
  name       text not null,
  created_at timestamptz not null default now(),

  -- Only staples carry a category; the other three sections are flat lists.
  constraint pantry_items_category_only_on_staples
    check (section = 'staple' or category is null),

  -- Keeps the seed migration idempotent and stops the Section 2 "add item"
  -- form from creating duplicates.
  constraint pantry_items_section_name_key unique (section, name)
);

comment on column public.pantry_items.category is
  'Staple category, e.g. "Oils" or "Base". Null for standing_protein/fridge/freezer.';

-- Postgres does not index foreign keys automatically. This one backs both the
-- per-recipe ingredient load and the ON DELETE CASCADE.
create index ingredients_recipe_id_idx on public.ingredients (recipe_id);

-- Backs the alphabetical keyset pagination behind the Recipes page's infinite scroll.
create index recipes_title_id_idx on public.recipes (title, id);

-- Backs the cuisine filter on the Recipes page.
create index recipes_cuisine_idx on public.recipes (cuisine);
