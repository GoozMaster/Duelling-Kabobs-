-- Chef App — two tidy-ups to the ice cream subheading.
--
-- French Vanilla Custard is the frozen custard from its source (the URL is
-- allrecipes' 'frozen-vanilla-custard'), so it joins 'Ice Cream & Sorbets'.
--
-- 'Watermelon and Chocolate Chip Sorbet' (from veggiefunkitchen.com) is removed
-- in favour of 'Watermelon Sorbetto' from The Perfect Scoop, added in
-- 20261030000500. Its ingredient rows go with it (ingredients.recipe_id is
-- ON DELETE CASCADE). Both statements match by title and are no-ops if the
-- recipe is already gone.

update public.recipes
   set subcategory = 'Ice Cream & Sorbets'
 where title = 'French Vanilla Custard'
   and cuisine = 'Desserts';

delete from public.recipes
 where title = 'Watermelon and Chocolate Chip Sorbet'
   and source_url = 'https://veggiefunkitchen.com/easy-watermelon-sorbet-in-the-ice-cream-maker/';
