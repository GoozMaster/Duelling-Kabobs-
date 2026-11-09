-- Chef App — Pork Belly Tacos: cook to an internal temperature.
--
-- The 3 to 5 hour bake is a wide range, so the method now says to go by
-- temperature: about 190-200°F inside for the best texture. Matched by title and
-- by the exact sentence being replaced, so it is a no-op if the recipe was
-- renamed or its method has since been edited through the admin form.

update public.recipes
   set instructions = replace(
         replace(
           instructions,
           'Bake at 275°F for 3 to 5 hours. It is a wide range because you just never know; cook it until it is tender enough to cut with a spoon.',
           'Bake at 275°F for 3 to 5 hours. It is a wide range because you just never know, so go by temperature: cook until the pork belly reaches an internal temperature of right around 190-200°F, at which point it should be tender enough to cut with a spoon.'
         ),
         E'Tip: Broil on a wire rack',
         E'Tip: Cook the pork belly to right around 190-200°F internal for the best texture. Check with an instant-read thermometer starting around the 3-hour mark.\nTip: Broil on a wire rack'
       )
 where title = 'Pork Belly Tacos'
   and instructions like '%Bake at 275°F for 3 to 5 hours. It is a wide range because you just never know; cook it until%';
