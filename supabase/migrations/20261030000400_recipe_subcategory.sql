-- Chef App — a subheading inside a cuisine.
--
-- Desserts is now large enough that its frozen recipes want a heading of their
-- own, so a recipe can carry an optional subcategory within its cuisine. It is a
-- plain text column rather than a table: there is one value so far, nothing
-- else references it, and the recipes page builds its sub-filter from whatever
-- values exist (src/lib/recipe-browse.ts), so a new subheading needs no code.
--
-- save_recipe() is deliberately NOT touched, the same call 20261027000100 made
-- for the media columns. It writes only the columns it names, so editing a
-- recipe through the admin form leaves its subcategory as it was.
--
-- The two existing recipes that are plainly frozen are tagged here. Matched by
-- title, and each is a no-op if the recipe was since renamed or removed.

alter table public.recipes add column subcategory text;

comment on column public.recipes.subcategory is
  'Optional subheading within the recipe''s cuisine, e.g. ''Ice Cream & Sorbets'' under Desserts. Null for most recipes.';

update public.recipes
   set subcategory = 'Ice Cream & Sorbets'
 where cuisine = 'Desserts'
   and title in (
     'Saffron Ice Cream (Bastani-e Gol-o Bolbol)',
     'Watermelon and Chocolate Chip Sorbet'
   );
