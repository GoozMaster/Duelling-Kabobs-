-- Chef App — Pork Belly Tacos from The Elote Cafe (p. 188), plus the two
-- component recipes that page carries: the Mango Arbol Salsa and the Spice Rub
-- for Roast Chicken and Pork Belly. Each is its own recipe so the salsa and the
-- rub can be found and reused on their own.
--
-- Deliberate changes from the printed page, made at the owner's request:
--   * Mango Arbol Salsa uses 3 toasted arbol chiles, not the printed 6.
--   * The pork belly is called out as SKINLESS.
--   * The pork belly is broiled on a wire rack set over a baking sheet, so the
--     excess fat drips away instead of pooling around the meat.
-- Method text is condensed into our own words.
--
-- The taco recipe lists the salsa and the rub as ingredients by their recipe
-- titles, so a cook can follow them to the matching recipe.
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
  {"title": "Pork Belly Tacos", "cuisine": "Latin",
   "instructions": "Start with a 3- to 5-pound skinless pork belly. Ask the butcher to remove the skin if it still has it.\nRub the pork belly very liberally with the Spice Rub for Roast Chicken and Pork Belly, coating it all over. Let it sit for at least 2 hours.\nPut the pork belly in a pan as close to its size as possible. Add the Coca-Cola, milk and orange juice to the pan.\nBake at 275°F for 3 to 5 hours. It is a wide range because you just never know; cook it until it is tender enough to cut with a spoon.\nLet the pork cool in the pan for a few minutes, then refrigerate it until it is cool enough to handle. Lift it out of the liquid and fat and set it aside until completely cool.\nCut the pork into chunks about the size you want in a taco; about 2 inches is good.\nWarm the fat and cooking broth together and dip each piece into it, coating all sides. This keeps the chunks from drying out and adds flavor. You can refrigerate the chunks at this point until later.\nWhen ready to serve, set the chunks on a wire rack over a baking sheet so the excess fat drips away. Run them under a preheated broiler until heated through, brown and crispy but not burnt.\nToast the corn tortillas (see Toasted Corn Tortillas below) and make the Mango Arbol Salsa.\nServe the taco ingredients in separate bowls and let everyone top their warm tortillas with pork, salsa and garnish. Or top the pork with the salsa, garnish with chopped mango and cilantro (try it on a toasted banana leaf) and serve with a basket of warm tortillas.\nToasted Corn Tortillas: brush 4-inch corn tortillas with a small bit of vegetable oil and place them in a dry skillet over medium heat. Turn once to toast to light golden on both sides and serve warm.\nTip: Skinless pork belly matters here. The skin would not soften the same way and would get in the way of the spoon-tender texture.\nTip: Broil on a wire rack, not a flat pan. The rack lets the rendered fat drip off so the chunks crisp rather than fry in their own grease.\nTip: Look for Manila (champagne) mangoes for the salsa; they are silkier and more tropical than regular mangoes. Dice them very fine.",
   "ingredients": [
    {"group_label": "Pork belly", "name": "3 to 5 pounds skinless pork belly", "required": true},
    {"group_label": "Pork belly", "name": "Spice Rub for Roast Chicken and Pork Belly (see recipe)", "required": true},
    {"group_label": "Pork belly", "name": "1 cup Coca-Cola", "required": true},
    {"group_label": "Pork belly", "name": "1/2 cup milk", "required": true},
    {"group_label": "Pork belly", "name": "1/2 cup orange juice", "required": true},
    {"group_label": "To serve", "name": "Mango Arbol Salsa (see recipe)", "required": true},
    {"group_label": "To serve", "name": "4-inch corn tortillas", "required": true},
    {"group_label": "To serve", "name": "Vegetable oil, for brushing the tortillas", "required": true},
    {"group_label": "To serve", "name": "Chopped mango, for garnish", "required": false},
    {"group_label": "To serve", "name": "Chopped cilantro, for garnish", "required": false},
    {"group_label": "To serve", "name": "Banana leaf, toasted, for serving", "required": false},
    {"group_label": "Equipment", "name": "Wire rack and baking sheet, for broiling", "required": false}
   ]},

  {"title": "Mango Arbol Salsa", "cuisine": "Latin",
   "instructions": "Put the toasted arbol chiles in a blender and pulse to chop them, or chop them in a coffee grinder.\nCombine the chopped chiles with the mango, onion, cilantro, lime juice and salt and stir.\nLet the salsa rest for about 5 minutes and it is ready.\nTip: This uses 3 chiles; the original recipe calls for 6, which makes a much hotter salsa. Add more if you want more heat.\nTip: Manila (champagne) mangoes are best if you can find them. Make sure the dice is very fine; it changes the final texture of the salsa and the tacos.\nNote: Good with the Pork Belly Tacos, and a batch will find other uses at the table too.",
   "ingredients": [
    {"group_label": null, "name": "3 toasted arbol chiles", "required": true},
    {"group_label": null, "name": "1 cup peeled and finely diced mango", "required": true},
    {"group_label": null, "name": "1 cup finely diced onion", "required": true},
    {"group_label": null, "name": "1/4 cup chopped cilantro", "required": true},
    {"group_label": null, "name": "2 tablespoons lime juice", "required": true},
    {"group_label": null, "name": "1 teaspoon salt", "required": true}
   ]},

  {"title": "Spice Rub for Roast Chicken and Pork Belly", "cuisine": "Latin",
   "instructions": "Combine all the spices in a glass jar and shake to mix.\nKeeps well for several weeks in a cool, dry place, tightly lidded.\nNote: Used on the Pork Belly Tacos, where it is rubbed very liberally all over the meat. Also good on roast chicken.\nNote: The author's older all-purpose rub, The Cure: mix 1 cup each kosher salt and brown sugar, 1 tablespoon each ground cumin, allspice, freshly ground pepper and granulated garlic, plus 2 tablespoons ground ancho chile.",
   "ingredients": [
    {"group_label": null, "name": "1 cup salt", "required": true},
    {"group_label": null, "name": "2 tablespoons sugar", "required": true},
    {"group_label": null, "name": "1 tablespoon ground allspice", "required": true},
    {"group_label": null, "name": "1 tablespoon ground canela (Mexican cinnamon)", "required": true},
    {"group_label": null, "name": "2 tablespoons chipotle powder", "required": true},
    {"group_label": null, "name": "2 tablespoons guajillo powder", "required": true},
    {"group_label": null, "name": "1 tablespoon black pepper", "required": true},
    {"group_label": null, "name": "1 teaspoon ground cumin", "required": true},
    {"group_label": null, "name": "2 teaspoons granulated garlic", "required": true},
    {"group_label": null, "name": "1 teaspoon ground coriander", "required": true}
   ]}
]
$recipes$::jsonb)
  loop
    continue when exists (select 1 from public.recipes where title = r ->> 'title');

    insert into public.recipes (title, instructions, cuisine, source_url)
    values (r ->> 'title', r ->> 'instructions', r ->> 'cuisine', 'The Elote Cafe cookbook, p. 188')
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
