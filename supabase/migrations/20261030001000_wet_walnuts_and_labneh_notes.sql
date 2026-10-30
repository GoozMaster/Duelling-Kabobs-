-- Chef App — the two Perfect Scoop pages that were missing.
--
-- 1. Wet Walnuts, the maple-glazed nut mix-in that Maple Walnut Ice Cream calls
--    for. Filed under Desserts, and under the Ice Cream & Sorbets subheading so
--    it sits beside the ice cream that uses it.
-- 2. The continuation page of Labneh Ice Cream with Pistachio-Sesame Brittle:
--    how to make labneh, a flavoring variation and a honey pairing. Appended to
--    the recipe's method, which previously ended at the freezing step.
-- 3. Maple Walnut's ingredient no longer says "a separate recipe in the book",
--    since the recipe is now here.
--
-- As with the other recipes from this book, the method is a condensed summary in
-- our own words. Every statement is idempotent.

insert into public.recipes (title, instructions, cuisine, subcategory, source_url)
select 'Wet Walnuts',
       $w$Heat the maple syrup in a small skillet or saucepan until it just begins to come to a full boil. Stir in the walnuts and cook until it returns to a full boil, then stir for 10 seconds and remove from the heat.
Sprinkle with the salt and let cool completely. The nuts will still be wet and sticky when cool.
Tip: To mix into ice cream, chop the nuts coarsely and add them to 1 quart (1 liter) of ice cream during the last minute of churning.
Note: Best made shortly before using. Store airtight at room temperature for up to 1 day; the nuts lose some crispness overnight.
Variation: For Wet Pecans, use toasted pecans instead of walnuts.
Note: Makes 1 1/2 cups (290g).$w$,
       'Desserts', 'Ice Cream & Sorbets', 'The Perfect Scoop by David Lebovitz'
where not exists (select 1 from public.recipes where title = 'Wet Walnuts');

insert into public.ingredients (recipe_id, group_label, sort_order, name, required)
select r.id, null, v.ord, v.name, true
from public.recipes r,
     (values (0, '1/2 cup plus 1 tablespoon (140ml) dark amber maple syrup'),
             (1, '1 1/2 cups (150g) walnuts, toasted and very coarsely chopped'),
             (2, 'Big pinch of kosher or sea salt')) as v(ord, name)
where r.title = 'Wet Walnuts'
  and not exists (select 1 from public.ingredients i where i.recipe_id = r.id);

update public.recipes
   set instructions = instructions || chr(10) || $l$Note: To make your own labneh, strain 1 quart (1 liter) of plain whole-milk yogurt in a cheesecloth-lined mesh strainer set over a deep bowl in the refrigerator for 4 hours, no longer. It can be made up to 2 days ahead.
Variation: Stir a few drops of orange flower water or rose water into the labneh mixture just before freezing, or sprinkle a few drops on top. You can also keep back some of the chopped brittle to sprinkle over the ice cream when serving.
Perfect pairing: Drizzle scoops with chamomile-infused honey. Warm 1/2 cup (125ml) honey with 2 teaspoons crushed dried chamomile flowers, remove from the heat and steep for 15 minutes or to taste, then rewarm and strain out the chamomile. Chamomile is sold at natural food stores and Middle Eastern markets. Or use a small pinch of saffron threads instead; they need no straining and add a nice color contrast.$l$
 where title = 'Labneh Ice Cream with Pistachio-Sesame Brittle'
   and instructions not like '%To make your own labneh%';

update public.ingredients
   set name = '1 batch Wet Walnuts'
 where name = '1 batch Wet Walnuts (a separate recipe in the book)'
   and recipe_id = (select id from public.recipes where title = 'Maple Walnut Ice Cream with Wet Walnuts');
