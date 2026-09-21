-- Chef App — where each recipe came from.
--
-- The collection was imported from a Google Doc in which most recipes are a
-- heading linked to the site it came from, and the URL importer already has the
-- source URL in hand and throws it away. Both facts were losing attribution
-- that the recipes are not really ours to drop.
--
-- WHY THE FUNCTION IS DROPPED AND NOT REPLACED:
-- `create or replace function` matches on the argument list, so recreating
-- save_recipe with a seventh parameter would define an *overload* and leave the
-- six-argument version in place. PostgREST picks an overload by the set of
-- argument names the caller supplies, so every existing call — which passes
-- exactly the old six keys — would keep resolving to the old function and
-- silently never write source_url. Giving the new parameter a DEFAULT does not
-- help; it makes the six-key call ambiguous instead (PGRST203).
--
-- The old signature is spelled out in full rather than guessed at, so a typo
-- fails this migration instead of quietly leaving two functions behind.
-- Migrations run in a transaction, so there is no moment where the function is
-- missing from under a live caller.

alter table public.recipes add column source_url text;

comment on column public.recipes.source_url is
  'Where the recipe came from. Null when unknown — the Doc leaves many unlinked, and that is a real answer rather than a gap to fill.';

drop function public.save_recipe(uuid, text, text, text, boolean, jsonb);

-- Everything below is the previous function body with source_url threaded
-- through the two write branches. The original rationale still applies:
--
-- a recipe is one `recipes` row plus N `ingredients` rows, and PostgREST gives
-- the client no way to wrap several calls in one transaction. Saving an edit
-- from the client would therefore be three independent transactions:
--   update the recipe -> delete its ingredients -> insert the new ones
-- If that last insert fails, the first two have already committed and the
-- recipe is left with no ingredients at all. Nothing rolls back, because
-- nothing was holding them together.
--
-- A function body is a single statement from the client's point of view, so
-- Postgres wraps the whole thing in one transaction. Any failure inside undoes
-- all of it.
--
-- SECURITY INVOKER is deliberate and load-bearing. The function runs as the
-- caller, so the RLS policies on recipes and ingredients still evaluate against
-- the caller's JWT. SECURITY DEFINER — the reflex choice for anything that
-- feels "privileged" — would run it as the owner and bypass RLS entirely,
-- handing any authenticated user full write access through a side door.
create function public.save_recipe(
  p_id           uuid,
  p_title        text,
  p_instructions text,
  p_cuisine      text,
  p_needs_review boolean,
  p_ingredients  jsonb,
  p_source_url   text
)
  returns uuid
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_id uuid;
  -- The form posts an empty string for a cleared field. Storing '' rather than
  -- null would make `where source_url is null` — which the backfill relies on
  -- to avoid clobbering hand-entered values — quietly miss those rows.
  v_source text := nullif(btrim(coalesce(p_source_url, '')), '');
begin
  if coalesce(btrim(p_title), '') = '' then
    raise exception 'A recipe needs a title' using errcode = 'check_violation';
  end if;

  if p_ingredients is null or jsonb_array_length(p_ingredients) = 0 then
    raise exception 'A recipe needs at least one ingredient' using errcode = 'check_violation';
  end if;

  if p_id is null then
    insert into public.recipes (title, instructions, cuisine, needs_review, source_url)
    values (btrim(p_title), coalesce(p_instructions, ''), p_cuisine, coalesce(p_needs_review, false), v_source)
    returning id into v_id;
  else
    update public.recipes
       set title        = btrim(p_title),
           instructions = coalesce(p_instructions, ''),
           cuisine      = p_cuisine,
           needs_review = coalesce(p_needs_review, false),
           source_url   = v_source
     where id = p_id
    returning id into v_id;

    -- RLS filters before UPDATE, so a row the caller cannot see simply matches
    -- nothing and v_id stays null. Without this check that reads as success.
    if v_id is null then
      raise exception 'No recipe with id % that you can edit', p_id using errcode = 'no_data_found';
    end if;

    delete from public.ingredients where recipe_id = v_id;
  end if;

  -- Replace rather than diff: the row set is small, and rebuilding it makes
  -- sort_order contiguous by construction instead of something to maintain.
  insert into public.ingredients (recipe_id, group_label, sort_order, name, required, substitution)
  select
    v_id,
    nullif(btrim(coalesce(item ->> 'group_label', '')), ''),
    (ordinality - 1)::int,
    btrim(item ->> 'name'),
    coalesce((item ->> 'required')::boolean, true),
    nullif(btrim(coalesce(item ->> 'substitution', '')), '')
  from jsonb_array_elements(p_ingredients) with ordinality as t(item, ordinality)
  where btrim(coalesce(item ->> 'name', '')) <> '';

  return v_id;
end;
$$;

-- Dropping a function drops its comment with it, so this is re-issued rather
-- than inherited.
comment on function public.save_recipe is
  'Creates or replaces a recipe and its ingredients in one transaction. Runs as the caller, so RLS still applies.';
