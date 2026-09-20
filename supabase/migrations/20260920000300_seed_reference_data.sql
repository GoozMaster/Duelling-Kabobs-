-- Chef App — reference data seed.
--
-- Source: the private `chef` skill's references/pantry-inventory.md (staples)
-- and SKILL.md (standing proteins + base staples), transcribed into the
-- Appendix of MASTER-BUILD-PROMPT.md.
--
-- This lives in a migration rather than supabase/seed.sql on purpose:
-- seed.sql only runs during a local `supabase db reset`, and this project has
-- no local stack — it writes straight to the hosted database.
--
-- Every insert is ON CONFLICT DO NOTHING, so re-running is safe and will not
-- clobber edits made through the My Pantry page.
--
-- Migrations run as the table owner, which bypasses RLS. That is why this file
-- can populate pantry_items even though the policies are admin-only.

insert into public.cuisines (name)
select name from unnest(array[
  'Drinks', 'Asian', 'Italian', 'American', 'French', 'Latin',
  'Mediterranean', 'Indian', 'Breads', 'Desserts', 'Other'
]) as name
on conflict (name) do nothing;


-- ---------------------------------------------------------------------------
-- Staples, by category
-- ---------------------------------------------------------------------------

-- Base staples: assumed always on hand, and never reported as a missing
-- ingredient by the "What can I make?" matcher. The 'Base' category is what
-- makes that set identifiable by query.
insert into public.pantry_items (section, category, name)
select 'staple', 'Base', name from unnest(array[
  'Salt', 'Pepper', 'Butter', 'Milk', 'Eggs', 'Water', 'General cooking oil'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Grains & Rice', name from unnest(array[
  'Oatmeal', 'Rolled oats', 'Polenta', 'Quinoa', 'Black rice', 'Pearl barley',
  'Arborio rice', 'Pearl couscous', 'Bomba rice', 'Basmati rice',
  'Jasmine rice', 'Sushi rice'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Pasta & Noodles', name from unnest(array[
  'Pappardelle', 'Spaghetti', 'Angel hair', 'Fettuccine', 'Bucatini',
  'Rice noodle', 'Egg noodle', 'Rice paper', 'Mung bean noodle',
  'Dried vermicelli', 'Pasta shells', 'Instant mac and cheese', 'Ramen',
  'Elbow macaroni'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Flours & Baking Staples', name from unnest(array[
  'Pancake mix', 'Vanilla protein powder', 'All-purpose flour', 'Bread flour',
  'Whole wheat flour', 'Rice flour', 'Semolina flour', 'Cake flour',
  'Tapioca flour', 'Almond flour', 'Coconut flour', 'Cornstarch',
  'Potato starch', 'Xanthan gum', 'Baking powder', 'Baking soda',
  'Instant yeast', 'Gelatin', 'Pectin', 'Cream of tartar', 'Flaxseed meal'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Nuts & Seeds', name from unnest(array[
  'Walnuts', 'Sliced almonds', 'Slivered almonds', 'Hazelnuts',
  'Raw whole cashews', 'Pistachio pieces', 'Pistachios', 'Peanuts',
  'Chia seeds', 'White sesame seeds'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Legumes & Beans', name from unnest(array[
  'Yellow split peas', 'Chickpeas', 'Kidney beans', 'Black beans',
  'Green lentils'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Dried Herbs & Spices', name from unnest(array[
  'Dried dillweed', 'Dried rosebuds', 'Dried mint leaves', 'Sumac',
  'Persian dried limes', 'Green cardamom (pods)', 'Ground cardamom', 'Cumin',
  'Nutmeg', 'White pepper', 'Saffron', 'Advieh', 'Chili powder',
  'Cayenne pepper', 'Chili flakes', 'Allspice', 'Dried basil', 'Bay leaves',
  'Celery salt', 'Dried chipotle chili pepper', 'Cinnamon',
  'Ground coriander seed', 'Curry powder', 'Garam masala', 'Garlic powder',
  'Golpar', 'Ground mustard', 'Onion powder', 'Paprika', 'Oregano',
  'Italian seasoning', 'Dried parsley', 'Dried rosemary', 'Dried sage',
  'Dried thyme', 'Turmeric', 'Cobanero chili pepper', 'Black lime powder',
  'Szechuan peppercorn', 'Dried Japanese red pepper', 'Star anise', 'MSG',
  'Kosher salt', 'Gray salt', 'Red wine sea salt', 'Persian blue salt',
  'Raspberry salt', 'Pumpkin spice', 'Chinese five spice', 'Tomato powder',
  'Corn powder', 'Togarashi', 'Furikake', 'Nutritional yeast'
]) as name
on conflict (section, name) do nothing;

-- Chicken bouillon powder and Beef bouillon cubes appear under this heading AND
-- under Broths in the source inventory. They are seeded once, under Broths,
-- alongside the stocks they stand in for.
insert into public.pantry_items (section, category, name)
select 'staple', 'Seasoning Blends, Rubs & Soup Bases', name from unnest(array[
  'Vedemy''s fried chicken seasoning', 'Ranch seasoning',
  'Vietnamese soup seasoning', 'Seasoned salt', 'Everything bagel seasoning',
  'White cheddar popcorn seasoning', 'Truffle salt', 'Cajun seasoning',
  'Fajita seasoning', 'Shawarma seasoning', 'Kebab seasoning',
  'Italian arrabbiata seasoning', 'Blackening seasoning',
  'Tunisian tabil seasoning', 'Old Bay', 'Poultry seasoning',
  'Mushroom seasoning blend', 'Vietnamese pho soup base', 'Golden nest soup',
  'Sahlap (sahlep)'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Oils', name from unnest(array[
  'Peanut oil', 'Olive oil', 'Cooking oil', 'Sunflower oil',
  'Toasted sesame oil', 'White truffle oil', 'Black truffle oil', 'Ghee'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Vinegars', name from unnest(array[
  'Apple cider vinegar', 'Balsamic vinegar', 'White balsamic vinegar',
  'Balsamic vinegar glaze', 'White wine vinegar', 'Red wine vinegar',
  'Rice vinegar', 'White vinegar'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Sauces, Pastes & Condiments', name from unnest(array[
  'Tomato paste', 'Tahini', 'Chinese sesame paste', 'Pistachio cream', 'Mirin',
  'Shaoxing cooking wine', 'Soy sauce', 'Dark soy sauce', 'Mushroom soy sauce',
  'Maggi seasoning', 'Fish sauce', 'Pomegranate molasses', 'Sekanjabin',
  'Worcestershire sauce', 'Capers', 'Oyster sauce', 'Vegan oyster sauce',
  'Hoisin sauce', 'Thai peanut sauce', 'Sweet chili sauce', 'Dumpling sauce',
  'Teriyaki sauce', 'Ketchup', 'Sriracha', 'Relish', 'Dijon mustard',
  'Yellow mustard', 'Chipotle peppers (in adobo)', 'Mayo', 'Sun-dried tomatoes',
  'Barbecue sauce', 'Liquid smoke', 'Salsa', 'Tamarind paste',
  'Yellow pepper paste', 'Shrimp paste', 'Fermented bean curd', 'Miso',
  'Tabasco', 'Crispy shallots', 'Peanut butter', 'Sri Lankan curry paste',
  'Thai curry paste'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Broths, Stocks & Bouillon', name from unnest(array[
  'Chicken stock', 'Beef stock', 'Veggie stock', 'Chicken bouillon powder',
  'Beef bouillon cubes'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Wine & Cooking Wine', name from unnest(array[
  'Red wine', 'White wine'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Canned & Jarred Goods', name from unnest(array[
  'Canned corn', 'Canned chili', 'Canned tomatoes', 'Passata', 'Heart of palm',
  'Spam', 'Panko', 'Tempura batter mix', 'Taco shells', 'Dried seaweed'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Dairy, Milk Alternatives & Creams', name from unnest(array[
  'Sweetened condensed milk', 'Coconut cream', 'Coconut milk',
  'Light coconut milk', 'Hazelnut milk', 'Almond milk'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Sweeteners & Baking Sweets', name from unnest(array[
  'Sugar', 'Brown sugar', 'Palm sugar', 'Honey', 'Maple syrup', 'Truffle honey',
  'Molasses', 'Hershey''s syrup', 'Strawberry jam',
  'Dutch-process unsweetened cocoa powder',
  'Semi-sweet chocolate baking chips', 'Vanilla extract', 'Vanilla paste',
  'French vanilla bean', 'Dates', 'Prunes'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Fresh Aromatics', name from unnest(array[
  'Onions', 'Red onions', 'Shallots', 'Garlic', 'Ginger'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Extracts & Flavored Waters', name from unnest(array[
  'Rose water', 'Mint water', 'Orange blossom water'
]) as name
on conflict (section, name) do nothing;

insert into public.pantry_items (section, category, name)
select 'staple', 'Specialty / International Pantry', name from unnest(array[
  'Pandan (leaves/extract)'
]) as name
on conflict (section, name) do nothing;


-- ---------------------------------------------------------------------------
-- Standing proteins — always assumed on hand, no category.
-- ---------------------------------------------------------------------------
insert into public.pantry_items (section, category, name)
select 'standing_protein', null, name from unnest(array[
  'Frozen salmon', 'Frozen chicken thighs', 'Frozen chicken breast',
  'Ground beef', 'Sliced steak', 'Frozen shrimp'
]) as name
on conflict (section, name) do nothing;

-- Fridge and freezer start empty: they are the admin's day-to-day lists,
-- not reference data.
