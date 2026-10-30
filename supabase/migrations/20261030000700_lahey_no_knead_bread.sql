-- Chef App — the Lahey no-knead bread in a pot, filed under Breads.
--
-- The title, the author and the cuisine are our reading of the pages: the
-- photographs show the running footers 'My Bread' and 'The Lahey Method for
-- No-Knead Bread in a Pot' but not the recipe's own title or the author's name.
-- Method is a condensed summary in our own words.
--
-- IDEMPOTENT: a recipe whose title already exists is skipped, so a rerun adds
-- nothing and never overwrites edits made through the admin form.

do $do$
declare
  r    jsonb;
  v_id uuid;
begin
  for r in select * from jsonb_array_elements($recipes$
[
  {"title": "No-Knead Bread in a Pot (The Lahey Method)", "cuisine": "Breads",
   "instructions": "Stir the flour, salt and yeast together in a medium bowl. Add the water and mix for about 30 seconds into a wet, sticky dough; if it is not really sticky, mix in another tablespoon or two of water.\nCover the bowl and leave it at room temperature (about 72°F), out of direct sun, until the surface is dotted with bubbles and the dough has more than doubled. This takes at least 12 hours and ideally up to 18. The slow rise is where the flavor comes from.\nDust a work surface generously with flour and scrape the dough onto it in one piece. It will be loose and sticky and will cling in long strands; do not add more flour. With lightly floured hands or a scraper, fold the edges in toward the center and tuck them under to make a round.\nDust a cotton or linen tea towel (not terry cloth) with wheat bran, cornmeal or flour and lay the dough on it seam side down. Dust the top lightly, fold the towel loosely over it, and let it rise in a warm, draft-free spot for 1 to 2 hours, until almost doubled and a gentle poke leaves a dent that holds. If not, give it another 15 minutes.\nAbout 30 minutes before the rise ends, preheat the oven to 475°F with a rack in the lower third and a covered 4 1/2- to 5 1/2-quart heavy pot in the center of the rack.\nUsing pot holders, take the hot pot out and uncover it. Dust the dough lightly, then quickly and gently turn it into the pot, seam side up. Take care, the pot is very hot. Cover and bake for 30 minutes.\nRemove the lid and bake 15 to 30 minutes more, until the bread is a deep chestnut color but not burnt. Lift the loaf out with a heatproof spatula or pot holders and cool it on a rack for at least an hour before slicing.\nTip: Look for a bubbly surface and a darkened appearance on the first rise. About 18 hours is usually best; in very cold weather it can take up to 24.\nNote: Makes one 10-inch round loaf, about 1 1/4 pounds.",
   "ingredients": [
    {"group_label": null, "name": "3 cups (400g) bread flour", "required": true},
    {"group_label": null, "name": "1 1/4 teaspoons (8g) table salt", "required": true},
    {"group_label": null, "name": "1/4 teaspoon (1g) instant or other active dry yeast", "required": true},
    {"group_label": null, "name": "1 1/3 cups (300g) cool (55 to 65 degrees F) water", "required": true},
    {"group_label": null, "name": "Wheat bran, cornmeal, or additional flour for dusting", "required": true},
    {"group_label": null, "name": "A 4 1/2- to 5 1/2-quart heavy pot", "required": false}
   ]}
]
$recipes$::jsonb)
  loop
    continue when exists (select 1 from public.recipes where title = r ->> 'title');

    insert into public.recipes (title, instructions, cuisine, source_url)
    values (r ->> 'title', r ->> 'instructions', r ->> 'cuisine', 'My Bread by Jim Lahey')
    returning id into v_id;

    insert into public.ingredients (recipe_id, group_label, sort_order, name, required)
    select v_id,
           item ->> 'group_label',
           (ordinality - 1)::int,
           item ->> 'name',
           (item ->> 'required')::boolean
    from jsonb_array_elements(r -> 'ingredients') with ordinality as t(item, ordinality);
  end loop;
end
$do$;
