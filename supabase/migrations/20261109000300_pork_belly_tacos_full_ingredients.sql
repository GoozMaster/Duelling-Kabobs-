-- Chef App — Pork Belly Tacos: spell out the rub and the salsa.
--
-- The taco recipe pointed at the Spice Rub and Mango Arbol Salsa recipes with a
-- single "(see recipe)" line each. It now lists their ingredients in full, under
-- their own group labels, so everything needed is on one page. This repeats the
-- two component recipes on purpose, and keeps the salsa at 3 arbol chiles.
--
-- Only runs while the placeholder "(see recipe)" lines are still there, so a
-- rerun, or a recipe since edited through the admin form, is left alone.

do $do$
declare
  v_id uuid;
begin
  select r.id into v_id
    from public.recipes r
    join public.ingredients i on i.recipe_id = r.id
   where r.title = 'Pork Belly Tacos'
     and i.name = 'Spice Rub for Roast Chicken and Pork Belly (see recipe)';

  if v_id is null then
    return;
  end if;

  delete from public.ingredients where recipe_id = v_id;

  insert into public.ingredients (recipe_id, group_label, sort_order, name, required)
  select v_id,
         item ->> 'group_label',
         (ordinality - 1)::int,
         item ->> 'name',
         (item ->> 'required')::boolean
  from jsonb_array_elements($ing$
[
  {"group_label": "Pork belly", "name": "3 to 5 pounds skinless pork belly", "required": true},
  {"group_label": "Pork belly", "name": "1 cup Coca-Cola", "required": true},
  {"group_label": "Pork belly", "name": "1/2 cup milk", "required": true},
  {"group_label": "Pork belly", "name": "1/2 cup orange juice", "required": true},
  {"group_label": "Spice rub", "name": "1 cup salt", "required": true},
  {"group_label": "Spice rub", "name": "2 tablespoons sugar", "required": true},
  {"group_label": "Spice rub", "name": "1 tablespoon ground allspice", "required": true},
  {"group_label": "Spice rub", "name": "1 tablespoon ground canela (Mexican cinnamon)", "required": true},
  {"group_label": "Spice rub", "name": "2 tablespoons chipotle powder", "required": true},
  {"group_label": "Spice rub", "name": "2 tablespoons guajillo powder", "required": true},
  {"group_label": "Spice rub", "name": "1 tablespoon black pepper", "required": true},
  {"group_label": "Spice rub", "name": "1 teaspoon ground cumin", "required": true},
  {"group_label": "Spice rub", "name": "2 teaspoons granulated garlic", "required": true},
  {"group_label": "Spice rub", "name": "1 teaspoon ground coriander", "required": true},
  {"group_label": "Mango arbol salsa", "name": "3 toasted arbol chiles", "required": true},
  {"group_label": "Mango arbol salsa", "name": "1 cup peeled and finely diced mango", "required": true},
  {"group_label": "Mango arbol salsa", "name": "1 cup finely diced onion", "required": true},
  {"group_label": "Mango arbol salsa", "name": "1/4 cup chopped cilantro", "required": true},
  {"group_label": "Mango arbol salsa", "name": "2 tablespoons lime juice", "required": true},
  {"group_label": "Mango arbol salsa", "name": "1 teaspoon salt", "required": true},
  {"group_label": "To serve", "name": "4-inch corn tortillas", "required": true},
  {"group_label": "To serve", "name": "Vegetable oil, for brushing the tortillas", "required": true},
  {"group_label": "To serve", "name": "Chopped mango, for garnish", "required": false},
  {"group_label": "To serve", "name": "Chopped cilantro, for garnish", "required": false},
  {"group_label": "To serve", "name": "Banana leaf, toasted, for serving", "required": false},
  {"group_label": "Equipment", "name": "Wire rack and baking sheet, for broiling", "required": false}
]
$ing$::jsonb) with ordinality as t(item, ordinality);
end
$do$;
