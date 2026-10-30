-- Chef App — Barbari bread belongs with the breads.
--
-- 20261030000100_persian_recipes.sql filed it under Persian; it moves to the
-- existing Breads cuisine. Matched by title, the same key that migration's
-- rerun guard uses, so this is a no-op if the recipe was renamed or removed.

update public.recipes
   set cuisine = 'Breads'
 where title = 'Barbari Bread (Nan-e Barbari)'
   and source_url = 'The Food of Life by Najmieh Batmanglij';
