-- Chef App — four recipes from the pizza chapter of Bianco (Chris Bianco).
--
-- Pizza Dough, Crushed Tomato Sauce, Pizza Margherita and Pizza Rosa, all under
-- Italian. Ingredient quantities are as printed. The method is a condensed
-- summary in our own words rather than the book's text, and the page references
-- are replaced by the names of the recipes they point to. The book's long
-- shaping and proofing sections are not included (the shaping pages were not
-- all photographed).
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
  {"title": "Pizza Dough", "cuisine": "Italian",
   "instructions": "Stir the yeast into the warm water in a large bowl and let it stand for 5 minutes, until dissolved.\nStir in 3 cups of the flour until smooth, then work in 2 more cups gradually. Add the salt last. If needed, add up to 1/2 cup more flour, a tablespoon at a time, until the dough pulls away from the bowl but is still sticky.\nTurn the dough out onto a floured surface and knead for about 10 minutes, slapping, stretching and folding it, until it is smooth, stretchy, soft and still slightly tacky.\nShape into a ball and turn it in a lightly oiled large bowl to coat. Cover with plastic wrap and let rise in a warm place for 3 to 5 hours, until doubled and a pressed finger leaves a dent.\nCut the dough into 4 pieces, roll each into a ball, dust with flour, cover, and rest for about 1 more hour, until doubled.\nUse right away, or wrap the balls well and refrigerate for up to 8 hours or freeze for up to 3 weeks. Thaw in the refrigerator and bring to room temperature before shaping.\nTo shape, lay a ball on a lightly floured pizza peel or inverted baking sheet and press out the edges with your fingers. Jerk the peel to check the dough slides freely; if it sticks, lift it and dust underneath with flour. Tuck the edges into a round.\nTip: Taste your water first, use a high-protein bread flour, and use fine sea salt.\nTip: A longer first rise gives a more sour, fermented flavor and slower browning. 3 to 5 hours gives a milder dough that browns more quickly.\nNote: Makes enough for four 10-inch pizzas.",
   "ingredients": [
    {"group_label": null, "name": "1 envelope (2 1/4 teaspoons; 9 grams) active dry yeast", "required": true},
    {"group_label": null, "name": "2 cups warm water (105° to 110°F)", "required": true},
    {"group_label": null, "name": "5 to 5 1/2 cups bread or other high-protein flour, preferably organic and freshly milled, plus more for dusting", "required": true},
    {"group_label": null, "name": "2 teaspoons (12 grams) fine sea salt", "required": true},
    {"group_label": null, "name": "Extra virgin olive oil, for greasing the bowl", "required": true}
   ]},
  {"title": "Crushed Tomato Sauce", "cuisine": "Italian",
   "instructions": "Empty the can of tomatoes, with their juice, into a large bowl. Add the olive oil, the basil and the salt (if using).\nCrush the tomatoes by hand, discarding any bits of skin and any hard yellow cores. Aim for a textured but silky sauce with some pieces of tomato left; avoid a blender or food processor, which can bring out bitterness from the seeds.\nIf you have time, let the sauce sit for about an hour so the flavors can marry. It is still good without.\nTip: The sauce is uncooked. Canning partly cooks the tomatoes, and the oven finishes the job on the pizza.\nTip: Taste your canned tomatoes before using them. The sauce reduces in the oven and the saltiness intensifies, so start on the lighter side.\nTip: Not every canned tomato includes basil. If yours do, taste first; a few hand-bruised fresh leaves are still a good addition.\nNote: Makes enough for four 10-inch pizzas.",
   "ingredients": [
    {"group_label": null, "name": "One 28-ounce can whole tomatoes", "required": true},
    {"group_label": null, "name": "1 generous tablespoon extra virgin olive oil", "required": true},
    {"group_label": null, "name": "4 or 5 fresh basil leaves, torn and bruised (optional if the canned tomatoes include basil; see Note)", "required": false},
    {"group_label": null, "name": "Fine sea salt (optional)", "required": false}
   ]},
  {"title": "Pizza Margherita", "cuisine": "Italian",
   "instructions": "Put a rack in the lower third of the oven, with the rack above it removed, and set a pizza stone on it. Turn the oven to its maximum setting and preheat for a full hour.\nLightly flour a pizza peel. Shape the dough as in the Pizza Dough recipe and set it on the peel. Jerk the peel to check the dough slides freely; if it sticks, lift it and dust underneath with flour. Tuck the edges into a round.\nTaste the mozzarella and the tomato sauce for salt. Spoon the sauce over the dough and spread it from the center out with the back of the spoon, stopping about 3/4 inch from the edge.\nSprinkle on the Parmigiano, if using. Dot the mozzarella over the pizza, adding a little extra where the sauce is thinner. If the cheese and sauce were not salty enough, add a pinch of salt, then finish with a very light drizzle of olive oil.\nSlide the pizza onto the stone with a quick shake of the peel and bake for 10 to 15 minutes, until the crust is crisp and golden brown.\nRemove with the peel, lay the basil leaves over the top so the heat wilts them slightly, and serve immediately.\nTip: When you add or remove a topping, adjust for the change in moisture or flavor. For example, adding ricotta makes a pizza wetter, so use a little less sauce.\nTip: Basil is traditionally baked on the pizza. Adding it fresh after baking keeps its aroma and texture.\nNote: This is the master recipe for assembling and baking a pizza; the other pizza recipes build on it.\nNote: Makes one 10-inch pizza.",
   "ingredients": [
    {"group_label": null, "name": "One ball Pizza Dough, rested and ready to shape", "required": true},
    {"group_label": null, "name": "2 ounces fresh mozzarella, torn into cubes", "required": true},
    {"group_label": null, "name": "6 tablespoons Crushed Tomato Sauce, with an added glug of extra virgin olive oil", "required": true},
    {"group_label": null, "name": "A pinch or two of finely grated Parmigiano-Reggiano (optional)", "required": false},
    {"group_label": null, "name": "Fine sea salt (optional)", "required": false},
    {"group_label": null, "name": "Extra virgin olive oil, for drizzling", "required": true},
    {"group_label": null, "name": "5 fresh basil leaves", "required": true}
   ]},
  {"title": "Pizza Rosa", "cuisine": "Italian",
   "instructions": "Put a rack in the lower third of the oven, with the rack above it removed, and set a pizza stone on it. Turn the oven to its maximum setting and preheat for a full hour.\nLightly flour a pizza peel. Shape the dough as in the Pizza Dough recipe and set it on the peel. Jerk the peel to check the dough slides freely; if it sticks, lift it and dust underneath with flour. Tuck the edges into a round.\nScatter the Parmigiano over the dough, stopping about 3/4 inch from the edge. Scatter on the onions, then the rosemary, pinching it as you go to bruise it lightly and release its oils.\nSlide the pizza onto the stone with a quick shake of the peel. After about 5 minutes, quickly scatter the pistachios over the top. Bake 5 to 10 minutes longer, until the crust is crisp and golden brown.\nRemove with the peel, drizzle generously with olive oil, and serve immediately.\nTip: Roast the pistachios lightly and crush them coarsely. Adding them halfway through baking warms them enough to release their oils without scorching.\nNote: Makes one 10-inch pizza.",
   "ingredients": [
    {"group_label": null, "name": "One ball Pizza Dough, rested and ready to shape", "required": true},
    {"group_label": null, "name": "3 ounces Parmigiano-Reggiano, coarsely grated", "required": true},
    {"group_label": null, "name": "Scant 1/4 cup paper-thin slices red onion", "required": true},
    {"group_label": null, "name": "Leaves from 1/2 rosemary sprig", "required": true},
    {"group_label": null, "name": "A small handful of unsalted roasted pistachios, crushed", "required": true},
    {"group_label": null, "name": "Extra virgin olive oil, for drizzling", "required": true}
   ]}
]
$recipes$::jsonb)
  loop
    continue when exists (select 1 from public.recipes where title = r ->> 'title');

    insert into public.recipes (title, instructions, cuisine, source_url)
    values (r ->> 'title', r ->> 'instructions', r ->> 'cuisine', 'Bianco by Chris Bianco')
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
