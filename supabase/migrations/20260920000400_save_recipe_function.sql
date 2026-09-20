-- Chef App — transactional recipe save.
--
-- WHY THIS EXISTS:
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

create or replace function public.save_recipe(
  p_id           uuid,
  p_title        text,
  p_instructions text,
  p_cuisine      text,
  p_needs_review boolean,
  p_ingredients  jsonb
)
  returns uuid
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_id uuid;
begin
  if coalesce(btrim(p_title), '') = '' then
    raise exception 'A recipe needs a title' using errcode = 'check_violation';
  end if;

  if p_ingredients is null or jsonb_array_length(p_ingredients) = 0 then
    raise exception 'A recipe needs at least one ingredient' using errcode = 'check_violation';
  end if;

  if p_id is null then
    insert into public.recipes (title, instructions, cuisine, needs_review)
    values (btrim(p_title), coalesce(p_instructions, ''), p_cuisine, coalesce(p_needs_review, false))
    returning id into v_id;
  else
    update public.recipes
       set title        = btrim(p_title),
           instructions = coalesce(p_instructions, ''),
           cuisine      = p_cuisine,
           needs_review = coalesce(p_needs_review, false)
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

comment on function public.save_recipe is
  'Creates or replaces a recipe and its ingredients in one transaction. Runs as the caller, so RLS still applies.';
