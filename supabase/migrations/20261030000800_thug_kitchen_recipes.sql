-- Chef App — two vegan recipes from Thug Kitchen Party Grub, filed under American.
--
-- Method is a condensed summary in our own words, in clean language. 'Nooch' is
-- the book's word for nutritional yeast and is written both ways so the
-- What can I make? matcher can find it.
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
  {"title": "Cobb Salad", "cuisine": "American",
   "instructions": "Make the dressing: in a small glass, mix the mustard, maple syrup and garlic. Whisk in both vinegars, then slowly stir in the oil until combined. Refrigerate until needed.\nMake the smoky onions: heat the oil in a medium skillet over medium-high heat and saute the onions until browned and caramelized, 8 to 10 minutes. Meanwhile, mix the soy sauce or tamari, water and liquid smoke. Pour it over the onions and cook about 1 minute more, until the liquid has evaporated. Scrape onto a plate and set aside.\nMake the chickpeas: mix the broth, miso and soy sauce or tamari in a small glass. Heat the oil in the same skillet over medium-high heat, add the chickpeas and cook about 2 minutes, until warm and golden in spots. Add the miso mixture and cook 3 to 4 minutes more, until the liquid has evaporated. Off the heat, stir in the nooch and garlic powder until the chickpeas are coated.\nAssemble: cover a large platter with the chopped lettuces, drizzle with some of the dressing, season with salt and pepper and toss gently. Arrange the avocado, tomatoes, chives, smoky onions and chickpeas on top in neat rows. Serve right away.\nNote: Makes enough for 4 to 6 people.",
   "ingredients": [
    {"group_label": "Dressing", "name": "1 teaspoon yellow mustard", "required": true},
    {"group_label": "Dressing", "name": "1 teaspoon maple syrup or agave syrup", "required": true},
    {"group_label": "Dressing", "name": "1 or 2 cloves garlic, minced", "required": true},
    {"group_label": "Dressing", "name": "1/3 cup red wine vinegar", "required": true},
    {"group_label": "Dressing", "name": "1 tablespoon rice vinegar", "required": true},
    {"group_label": "Dressing", "name": "1/3 cup olive oil", "required": true},
    {"group_label": "Smoky onions", "name": "1 teaspoon olive oil", "required": true},
    {"group_label": "Smoky onions", "name": "1/2 large yellow onion, sliced", "required": true},
    {"group_label": "Smoky onions", "name": "1 teaspoon soy sauce or tamari", "required": true},
    {"group_label": "Smoky onions", "name": "1 teaspoon water", "required": true},
    {"group_label": "Smoky onions", "name": "1 teaspoon liquid smoke", "required": true},
    {"group_label": "Miso-glazed chickpeas", "name": "2 tablespoons vegetable broth or water", "required": true},
    {"group_label": "Miso-glazed chickpeas", "name": "2 teaspoons red miso paste", "required": true},
    {"group_label": "Miso-glazed chickpeas", "name": "1/2 teaspoon soy sauce or tamari", "required": true},
    {"group_label": "Miso-glazed chickpeas", "name": "2 teaspoons olive oil", "required": true},
    {"group_label": "Miso-glazed chickpeas", "name": "1 1/2 cups cooked chickpeas", "required": true},
    {"group_label": "Miso-glazed chickpeas", "name": "2 teaspoons nooch (nutritional yeast)", "required": true},
    {"group_label": "Miso-glazed chickpeas", "name": "1/4 teaspoon garlic powder", "required": true},
    {"group_label": "Salad", "name": "1 romaine heart, chopped", "required": true},
    {"group_label": "Salad", "name": "1 head of red leaf lettuce, chopped", "required": true},
    {"group_label": "Salad", "name": "Salt and black pepper", "required": true},
    {"group_label": "Salad", "name": "1 avocado, chopped", "required": true},
    {"group_label": "Salad", "name": "2 fist-size tomatoes, chopped", "required": true},
    {"group_label": "Salad", "name": "1/2 cup chopped chives", "required": true}
   ]},
  {"title": "Deviled Chickpea Bites", "cuisine": "American",
   "instructions": "Make the filling: blend the chickpeas, vinegar, shallot, oil, water, nooch, mustard and salt in a blender or food processor until creamy. If it needs help getting going, add another tablespoon of water.\nAssemble: smear a little filling on each bread slice so the cucumber sticks, then lay 2 cucumber slices on top so the bread is mostly covered. Spoon about 1 1/2 tablespoons of filling onto the cucumber, or pipe it on with a pastry bag for a fancier look.\nSprinkle with chives and dust with paprika. Serve within a couple of hours so the bread and cucumbers do not turn soggy.\nNote: One 15-ounce can of chickpeas, drained and rinsed, works in place of the cooked chickpeas.\nNote: You can leave the skin on the cucumber if it is not too waxy.\nNote: Makes about 18 bites, enough for 4 to 6 people.",
   "ingredients": [
    {"group_label": null, "name": "1 1/2 cups cooked chickpeas", "required": true},
    {"group_label": null, "name": "4 teaspoons white wine vinegar", "required": true},
    {"group_label": null, "name": "2 tablespoons minced shallot or yellow onion", "required": true},
    {"group_label": null, "name": "2 tablespoons olive oil", "required": true},
    {"group_label": null, "name": "1 tablespoon water", "required": true},
    {"group_label": null, "name": "1 tablespoon nooch (nutritional yeast)", "required": true},
    {"group_label": null, "name": "1 1/4 teaspoons Dijon mustard", "required": true},
    {"group_label": null, "name": "1/4 teaspoon salt", "required": true},
    {"group_label": null, "name": "1/2 baguette, cut into slices no thicker than 1/2 inch", "required": true},
    {"group_label": null, "name": "1 large cucumber, thinly sliced", "required": true},
    {"group_label": null, "name": "1 bunch of chives, minced", "required": true},
    {"group_label": null, "name": "Paprika", "required": true}
   ]}
]
$recipes$::jsonb)
  loop
    continue when exists (select 1 from public.recipes where title = r ->> 'title');

    insert into public.recipes (title, instructions, cuisine, source_url)
    values (r ->> 'title', r ->> 'instructions', r ->> 'cuisine', 'Thug Kitchen Party Grub')
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
