-- Chef App — the Persian cuisine, and fifteen recipes from one cookbook.
--
-- Every recipe here is transcribed from photographs of "The Food of Life" by
-- Najmieh Batmanglij. A book has no URL, so source_url carries the citation as
-- plain text; sourceLink() in src/lib/recipes.ts already renders a non-URL value
-- as an unlinked label, and videoFromSource() ignores it.
--
-- WHERE THEY GO: drinks and desserts join the existing Drinks (2) and
-- Desserts (7) cuisines, as the rest of the collection does; everything else
-- (6, Barbari bread included) goes under the new Persian cuisine.
--
-- Method text is one step per line with the book's numbering dropped: the
-- recipe page renders every line as its own checkbox, so "1." would read twice.
-- The book's notes and variations follow the steps as "Note:" / "Variation —"
-- lines, since the schema has nowhere else to keep them. Garnishes, optional
-- items and equipment are required = false so they never cost a pantry match.
--
-- IDEMPOTENT: a recipe whose title already exists is skipped, so a rerun adds
-- nothing and never overwrites edits made through the admin form. Runs as the
-- table owner, so RLS does not apply.

insert into public.cuisines (name) values ('Persian') on conflict (name) do nothing;

do $do$
declare
  r    jsonb;
  v_id uuid;
begin
  for r in select * from jsonb_array_elements($recipes$
[
  {"title": "Vinegar and Mint Syrup (Sharbat-e Sekanjebin)", "cuisine": "Drinks",
   "instructions": "To make the syrup: Bring the sugar and water to a boil in a medium-sized laminated pot. Simmer for 10 minutes over medium heat, stirring occasionally, until the sugar has thoroughly dissolved.\nAdd the vinegar and boil for 15 to 20 minutes over medium heat until a thick syrup forms. Remove the pot from heat.\nWash the mint sprigs and pat dry. Add them to the syrup. Allow to cool. Remove the mint and pour the syrup into a clean, dry bottle. Cork tightly.\nTo make the sherbet: In a pitcher, mix 1 part syrup with 3 parts chilled water and stir well. Keep cool.\nFill 1/2 a glass with crushed ice, slices of cucumber, a slice of lime, a few mint and cilantro leaves, and 1 rose petal. Top up the glass with the sherbet. Serve well chilled. Nush-e Jan!",
   "ingredients": [
    {"group_label": "Syrup", "name": "6 cups (1.2kg) sugar", "required": true},
    {"group_label": "Syrup", "name": "2 cups (480ml) water", "required": true},
    {"group_label": "Syrup", "name": "1 1/2 cups (360ml) wine vinegar", "required": true},
    {"group_label": "Syrup", "name": "4 sprigs fresh mint", "required": true},
    {"group_label": "Garnish", "name": "1 cucumber, peeled and thinly sliced", "required": false},
    {"group_label": "Garnish", "name": "3 limes, sliced", "required": false},
    {"group_label": "Garnish", "name": "2 cups (170g) fresh mint leaves", "required": false},
    {"group_label": "Garnish", "name": "1 cup (85g) fresh cilantro", "required": false},
    {"group_label": "Garnish", "name": "2 tablespoons dried rose petals", "required": false}
   ]},
  {"title": "Rose Water Syrup (Sharbat-e Gol-e Mohammadi)", "cuisine": "Drinks",
   "instructions": "In a medium saucepan, bring the water and sugar to a boil. Simmer for 10 minutes. Add the lime juice and rose water, and cook 10 minutes longer, stirring occasionally.\nRemove the pan from heat and allow to cool. Pour the syrup into a clean, dry bottle and cork tightly.\nIn a pitcher, mix 1 part syrup, 3 parts water, and 2 ice cubes per person. Stir with a spoon and serve well chilled. Nush-e Jan!\nVariation — Saffron Syrup: Add 1/2 teaspoon ground saffron threads diluted in 2 tablespoons hot water to the rose water syrup.\nVariation — Barberry Syrup: Replace the lime juice in step 1 with barberry juice. (When fresh barberries are not available, barberry juice can be made from dried barberries. Pick over and thoroughly wash 2 cups barberries. Combine with 4 cups water and boil for 15 minutes over high heat. Allow to cool and pass the juice through 2 layers of cheesecloth or a fine-meshed sieve into a pitcher.)\nVariation — Almond Syrup: Replace water and lime juice with almond milk. (To make almond milk puree 3 cups blanched almonds with 5 cups/1.2l boiling water in a food processor for 5 minutes until creamy. Strain the mixture through 2 layers of cheesecloth into a bowl. Reserve the almond milk and discard the solids. You can also use ready-made almond milk.)\nVariation — Basil Seed Syrup: Soak 1 cup of basil seeds (tokhm-e sharbati) in 2 cups/480ml water for a few hours, then add soaking seeds to the syrup in step 1 with the rose water. This is an excellent syrup, often served to the mother of a newborn baby.\nVariation — Persian Musk Rose, Mint Leaf, Orange Blossom, Licorice, Palm or Willow Syrup: Replace the rose water with musk rose water, mint water, orange blossom water, licorice water, palm water or willow water.\nNote: Rose water (suitable for cooking) and most of the distillates (called araqs in Persian) listed here are available in Persian stores (produced by Sadaf).",
   "ingredients": [
    {"group_label": null, "name": "2 1/2 cups (600ml) water", "required": true},
    {"group_label": null, "name": "4 cups (800g) sugar", "required": true},
    {"group_label": null, "name": "1/4 cup (60ml) fresh lime juice", "required": true},
    {"group_label": null, "name": "1/2 cup (120ml) rose water", "required": true}
   ]},
  {"title": "Honey Almond Brittle (Sohan Asal)", "cuisine": "Desserts",
   "instructions": "Line 2 baking sheets with parchment paper. Place a bowl of ice water next to the stove. In a small, heavy bottomed saucepan, combine the sugar, honey, and oil, and cook over high heat for 4 minutes, stirring occasionally with a long wooden spoon. At this stage the sugar should be slightly discolored and foaming lightly around the edges.\nReduce heat to medium. Add the almonds to the mixture, giving them a quick stir. Continue to cook for 3 to 4 minutes until the mixture is firm, golden, and covered with small bubbles.\nAdd the saffron-rose water mixture, gently stirring with a wooden spoon (be careful not to burn yourself). Cook for another 4 to 5 minutes, stirring occasionally, until the mixture is golden brown with large bubbles on the surface. Be careful. It should not be dark brown.\nTo be sure the mixture is ready, drop a spoonful of the hot almond mixture in the water: If it hardens immediately and does not stick to your teeth when you try it, the brittle is ready. Remove from heat using a pot holder. Give it a stir, using a wooden spoon.\nPlace about a teaspoon of the mixture on the parchment paper, leaving a 1-inch space between each (use 2 teaspoons, one for scooping and another for scraping off. Change spoons if they get too hot to handle). Immediately garnish with pinches of chopped pistachios.\nAllow the brittle to cool completely (at least 1 hour). Remove them from the paper using an offset spatula.\nArrange on a serving platter or store in an airtight glass container in a cool place. Nush-e Jan!\nVariation — Honey Pistachio Brittle: Replace the almonds with whole raw pistachio kernels. Replace the chopped raw pistachios with 1/3 cup/15g rose petals for garnish.",
   "ingredients": [
    {"group_label": null, "name": "1 cup (200g) sugar", "required": true},
    {"group_label": null, "name": "3 tablespoons pure honey", "required": true},
    {"group_label": null, "name": "4 tablespoons oil", "required": true},
    {"group_label": null, "name": "1 1/2 cups (180g) blanched slivered almonds", "required": true},
    {"group_label": null, "name": "1/4 teaspoon ground saffron dissolved in 2 tablespoons rose water", "required": true},
    {"group_label": "Garnish", "name": "1/4 cup (30g) chopped raw pistachios", "required": false}
   ]},
  {"title": "Baklava Cake (Cayk-e Baqlava)", "cuisine": "Desserts",
   "instructions": "In a small saucepan, combine all the ingredients for the glaze. Bring to a boil, reduce heat to medium, and stir gently for 3 minutes. Remove from heat and set aside.\nPreheat the oven to 350°F (180°C). Butter a quarter-sized (9 1/2 x 13 in/24 x 33 cm) rimmed sheet pan.\nIn a mixing bowl, whisk the egg yolks, sugar, and salt until creamy. Add the cardamom, rose water, milk, and oil, and whisk for 1 minute longer.\nAdd the flour, almonds, and apple, and fold in with a rubber spatula.\nIn a separate mixing bowl, whisk the egg whites until there are soft peaks. Fold into the flour mixture until you have a smooth, light batter.\nGently pour the batter into the lined, rimmed sheet pan and bake for 30 to 35 minutes until a tester comes out clean.\nRemove the pan from the oven and place it on a cooling rack. Drizzle the glaze evenly over the hot cake and leave it in the pan until it has absorbed all the glaze. Allow the cake to cool completely.\nCut into diamond shapes, and decorate with pistachios, almonds, and rose petals. Nush-e Jan!\nVariation — Flourless Baklava Cake: Use the same glaze and garnish as in the ingredients above but change the cake ingredients to: 4 eggs, separated; 1/8 teaspoon salt; 2 teaspoons baking powder; 1/2 cup/120g plain yogurt; 1 tablespoon rose water; 1 1/2 cups/120g ground walnuts; and 1 cup/85g ground almonds. Follow the steps as above.",
   "ingredients": [
    {"group_label": "Glaze", "name": "1 cup (340g) honey", "required": true},
    {"group_label": "Glaze", "name": "1/4 cup (60ml) rose water", "required": true},
    {"group_label": "Glaze", "name": "Zest of 1 orange", "required": true},
    {"group_label": "Glaze", "name": "1 teaspoon orange blossom water", "required": true},
    {"group_label": "Glaze", "name": "2 tablespoons fresh lime juice", "required": true},
    {"group_label": "Cake", "name": "3 eggs, separated (room temperature)", "required": true},
    {"group_label": "Cake", "name": "1/4 cup (50g) sugar", "required": true},
    {"group_label": "Cake", "name": "1/8 teaspoon salt", "required": true},
    {"group_label": "Cake", "name": "1 tablespoon cardamom powder", "required": true},
    {"group_label": "Cake", "name": "2 tablespoons rose water", "required": true},
    {"group_label": "Cake", "name": "1/2 cup (120ml) milk or almond milk", "required": true},
    {"group_label": "Cake", "name": "1/2 cup (120ml) oil", "required": true},
    {"group_label": "Cake", "name": "1 cup (100g) unbleached all-purpose flour sifted with 2 teaspoons baking powder", "required": true},
    {"group_label": "Cake", "name": "1 1/2 cups (125g) ground almonds or pistachios", "required": true},
    {"group_label": "Cake", "name": "1 apple, peeled, cored, and diced into 1/4-in/6mm cubes", "required": true},
    {"group_label": "Garnish", "name": "1 tablespoon raw pistachios", "required": false},
    {"group_label": "Garnish", "name": "1 tablespoon blanched almonds", "required": false},
    {"group_label": "Garnish", "name": "1 tablespoon dried rose petals", "required": false}
   ]},
  {"title": "Baklava (Baqlava)", "cuisine": "Desserts",
   "instructions": "Prepare the syrup by combining the sugar and water in a saucepan. Bring to a boil (do not overboil), add the rose water and lime juice, and set aside.\nFor the dough, combine the milk, oil, syrup, rose water, and egg in a food processor mixing bowl (it's important to use a food processor as opposed to a dough maker because the heat generated by the food processor helps develop the dough). Add the flour and mix well for 5 to 10 minutes to form a dough that does not stick to your hands. Divide the dough into 2 balls of equal size and immediately wrap in plastic. Set aside.\nFor the filling, finely grind the almonds, sugar, cardamom, and rose water using the same food processor. Set aside.\nBrush a 17x11x1-in/42x27x2.5cm rimmed baking sheet with 1/4 cup (60ml) oil. Place the oven rack in the center and preheat oven to 350°F (180°C).\nPrepare and dust with flour a large, wide surface for rolling out the dough. Unwrap 1 ball of dough and roll out into a very thin rectangular layer with a thin wooden rolling pin (the rolled dough should be thinner than a pie crust). Roll dough from the center to the outside edge in all directions, giving it a quarter turn occasionally for an even thickness — dust the dough with flour as necessary. The finished dough should be larger than the baking sheet.\nRoll the thin layer of dough around the wooden rolling pin and transfer it to the oiled baking sheet and unroll the dough until it covers the whole baking sheet. Do not cut off the excess dough; let the dough hang over the edge of the baking sheet, 1 inch on all sides.\nSpread all the almond-filling mixture on top of the dough. Spread, press down, and smooth it out using your hands. Use a small rolling pin to even it out and to pack it down firmly (this is important to achieve a tight, firm baklava when baked).\nRoll out the second ball of dough into a very thin rectangular layer as you did in step 5 for the first one. Transfer dough sheet on top of the filling, allowing it to hang over all sides like the bottom layer. Press down on the dough evenly with your hands and smooth out the surface of the dough.\nFold and roll the overhanging dough from the top layer under the dough from the bottom layer. Press together and pinch the top and bottom edges together to seal like a pie, forming a rim around the edge of the baking pan.\nHold down the dough with one hand, pressing down with your palm while cutting the dough with a sharp knife (all the way through) into diamond shapes. Use a brush to paint the dough with 1/4 cup (60ml) oil.\nPlace the baking pan in the middle of the preheated oven and bake for 25 to 35 minutes (depending on your oven) until the baklava is golden or pinkish in color.\nSpread a damp towel on the counter. When the baklava is pink, remove it from the oven and place it on the towel. Evenly pour 2 cups of the syrup all over the top (I prefer a less syrupy baklava, use more syrup if you prefer it more moist).\nDecorate the baklava with pistachios and rose petals. Cover immediately with a layer of plastic wrap and a layer of aluminum foil and seal tightly. Let stand at room temperature for at least 4 hours. It is important that the baklava be covered at all times because it dries out very easily.\nWhen ready to serve, use a sharp knife to lift 2 of the diamond pieces out of the baking sheet (to create an opening), then carefully lift 1 diamond at a time and arrange on a serving dish. Or transfer to a covered glass container for storing in the refrigerator. Nush-e Jan!\nNote: A thin, long dough roller or tool handle available at hardware stores makes a perfect rolling pin. The dough can be divided into 3 layers with 1 layer of pistachios and 1 layer of almonds. You can also substitute honey for the syrup.\nVariation — Qazvini-Style Baklava (baqlava-ye qazvini): This baklava, which tastes somewhere between a baklava and saffron pudding (sholeh zard) is made with a layer of saffron flavored almonds and a layer of pistachios on top. To make the almond layer filling: In a food processor, finely grind 1 pound blanched almonds, 1 cup sugar, 1/2 teaspoon ground saffron dissolved in 1 tablespoon rose water, and 1 tablespoon ground cardamom. To make the pistachio layer filling: In a food processor, finely grind 1 pound raw pistachio kernels, 1 cup sugar, and 1 tablespoon ground cardamom. In step 7, first spread all the almond filling and press down using a rolling pin to smooth and even out. Then pack down firmly. Spread the pistachio filling over the top and roll and press down firmly. Proceed with step 8.",
   "ingredients": [
    {"group_label": "Syrup", "name": "2 1/2 cups (500g) sugar", "required": true},
    {"group_label": "Syrup", "name": "1 1/2 cups (360ml) water", "required": true},
    {"group_label": "Syrup", "name": "1/2 cup (60ml) rose water", "required": true},
    {"group_label": "Syrup", "name": "2 tablespoons fresh lime juice", "required": true},
    {"group_label": "Dough", "name": "1/4 cup (60ml) plain whole milk", "required": true},
    {"group_label": "Dough", "name": "1/2 cup (120ml) oil", "required": true},
    {"group_label": "Dough", "name": "1 tablespoon syrup (from the syrup above)", "required": true},
    {"group_label": "Dough", "name": "1/4 cup (60ml) rose water", "required": true},
    {"group_label": "Dough", "name": "1 egg", "required": true},
    {"group_label": "Dough", "name": "2 1/2 cups (250g) unbleached all-purpose flour, sifted", "required": true},
    {"group_label": "Filling", "name": "2 pounds (900g) ground blanched almonds", "required": true},
    {"group_label": "Filling", "name": "2 cups (400g) sugar", "required": true},
    {"group_label": "Filling", "name": "3 tablespoons ground cardamom", "required": true},
    {"group_label": "Filling", "name": "1 tablespoon rose water", "required": true},
    {"group_label": "Baking", "name": "1/2 cup (60ml) oil for baking", "required": true},
    {"group_label": "Decoration", "name": "2 tablespoons slivered raw pistachios", "required": false},
    {"group_label": "Decoration", "name": "2 tablespoons dried rose petals", "required": false}
   ]},
  {"title": "Raisin Cookies (Nan-e Keshmeshy)", "cuisine": "Desserts",
   "instructions": "Place the oven rack in the center and preheat oven to 350°F (180°C). Line several cookie sheets with parchment paper or baking mats.\nIn a large mixing bowl whisk together the oil, vanilla, rose water, salt, and sugar until smooth. Then whisk in the eggs one at a time. Stir until the mixture is creamy.\nStir in the raisins. Fold in the flour using a rubber spatula until a thick batter forms.\nUse a small ice cream scoop to pick up spoonfuls of the batter and place on the lined cookie sheets, leaving about 2 in/5cm between each scoop.\nBake for 10 to 15 minutes until the edges of the cookies are golden brown.\nRemove cookie sheets from the oven and place on a cooling rack. When cool, loosen the cookies from the parchment paper with an offset spatula.\nTransfer the raisin cookies to a serving platter. To store, place them in an airtight glass container and refrigerate until ready to serve. Nush-e Jan!",
   "ingredients": [
    {"group_label": null, "name": "1 1/4 cups (300ml) oil or (280g) unsalted butter, softened", "required": true},
    {"group_label": null, "name": "1 teaspoon vanilla extract", "required": true},
    {"group_label": null, "name": "2 tablespoons rose water", "required": true},
    {"group_label": null, "name": "1/4 teaspoon sea salt", "required": true},
    {"group_label": null, "name": "1 1/4 cups (250g) sugar", "required": true},
    {"group_label": null, "name": "4 large eggs", "required": true},
    {"group_label": null, "name": "1 1/4 cups (185g) raisins", "required": true},
    {"group_label": null, "name": "2 cups (240g) unbleached all-purpose flour", "required": true}
   ]},
  {"title": "Saffron Ice Cream (Bastani-e Gol-o Bolbol)", "cuisine": "Desserts",
   "instructions": "Pour the cream into a 9-inch/23cm freezer-proof pie dish and place in the freezer.\nIn a small bowl, dissolve the sahlab in 1 cup/240ml milk until quite smooth. Set aside.\nTo make the ice cream: In a medium saucepan, bring 3 cups/720ml milk and the sugar to boil, and reduce heat to very low. Add the sahlab mixture, salt, saffron-rose water, cardamom, and mastic, and bring back to a boil. Reduce heat to low and simmer, whisking constantly, for 10 to 20 minutes until thick enough for the mixture to coat the back of a spoon. Remove from heat and allow to cool then chill in refrigerator. Pour into a chilled ice cream maker and follow the manufacturer's instructions for making ice cream (in my machine it takes about 1 hour 40 minutes).\nRemove the cream from the freezer. Unmold it from the pan and break it into 1/4-in/6mm pieces. Add it to the ice cream in the machine. Add the pistachios and continue to turn in the machine for another 20 seconds.\nPour the ice cream into a freezer-proof glass container with a press-in-place lid. Cover tightly (uncovered ice cream develops an unpleasant taste). Freeze the ice cream for at least 1 hour to allow it to develop texture and flavor.\nTwenty minutes before serving, remove the ice cream from the freezer and refrigerate. Serve by placing 3 scoops of ice cream into individual glass containers or use 2 wafers to make an ice cream sandwich. Nush-e Jan!\nNote: You can make round ice cream sandwiches, similar to those made in Iran and Turkey, using torte wafers available at Middle Eastern grocery stores. They come in 8 1/2x11-inch (21x27cm) sheets. Use a cookie cutter to make 4-in/10cm disks.\nNote: Mastic is a resin from the mastic tree (Pistacia lentiscus). Sahlab is a starch made from the tubers of an orchid. The sahlab available in the U.S. is often artificially flavored and mixed with cornstarch, which is why 1/4 cup is necessary. If you have pure sahlab: dissolve the sugar in the milk and bring to a boil, then dissolve 2 teaspoons of the pure, ground sahlab in 1 cup of the hot milk mixture, and stir well until it thickens. Return to the rest of the milk with the rest of the ingredients. Stir well.",
   "ingredients": [
    {"group_label": "Crunchy frozen heavy cream", "name": "1 cup (240ml) heavy cream", "required": true},
    {"group_label": "Ice cream", "name": "1/4 cup (30g) sahlab mixture (Cortas)", "required": true},
    {"group_label": "Ice cream", "name": "4 cups (960ml) whole milk", "required": true},
    {"group_label": "Ice cream", "name": "3/4 cup (150g) sugar", "required": true},
    {"group_label": "Ice cream", "name": "1/2 teaspoon salt", "required": true},
    {"group_label": "Ice cream", "name": "1/4 teaspoon ground saffron threads dissolved in 2 tablespoons rose water", "required": true},
    {"group_label": "Ice cream", "name": "1/4 teaspoon ground cardamom (optional)", "required": false},
    {"group_label": "Ice cream", "name": "1/2 teaspoon mastic ground with 1 teaspoon sugar", "required": true},
    {"group_label": "Ice cream", "name": "1/4 cup (40g) shelled raw pistachios", "required": true},
    {"group_label": "Wafers", "name": "8 ice cream wafers (3 in/7.5cm round)", "required": false}
   ]},
  {"title": "Paradise Custard (Yakh dar Behesht)", "cuisine": "Desserts",
   "instructions": "In a medium-sized, heavy-bottom saucepan whisk together the rice flour, corn starch, and the milk until smooth. Cook over medium-low heat for 10 minutes, stirring frequently.\nAdd the sugar, cardamom seeds, and rose water. Cook for 10 to 15 minutes longer, stirring constantly to prevent sticking and lumping, until the mixture reaches the consistency of a smooth, glossy custard (and you are able to draw a line on the surface). Remove from heat.\nImmediately transfer the custard to a serving dish, or to individual silicone molds, while the custard is hot, and garnish. Allow to cool at room temperature, then chill in the refrigerator for at least 4 hours. Serve cold. Nush-e Jan!\nVariation — Custard on Ice (Ru yakhi): Cook in the same way as above except you should eliminate the sugar. Serve with grape molasses (shireh-ye angur).",
   "ingredients": [
    {"group_label": null, "name": "1/2 cup (75g) rice flour", "required": true},
    {"group_label": null, "name": "1/4 cup (30g) corn starch", "required": true},
    {"group_label": null, "name": "4 cups (960ml) milk or almond milk", "required": true},
    {"group_label": null, "name": "3/4 cup (150g) sugar", "required": true},
    {"group_label": null, "name": "Seeds of 5 cardamom pods", "required": true},
    {"group_label": null, "name": "1/4 cup (60ml) rose water", "required": true},
    {"group_label": "Garnish", "name": "2 tablespoons sliced almonds, toasted", "required": false},
    {"group_label": "Garnish", "name": "2 tablespoons sliced raw pistachio kernels", "required": false},
    {"group_label": "Garnish", "name": "2 teaspoons rose petals, crushed", "required": false}
   ]},
  {"title": "Saffron Pudding (Sholeh Zard)", "cuisine": "Desserts",
   "instructions": "Clean and wash the rice, changing the water several times. Drain.\nIn a large pot, combine the rice and salt with 7 cups/1.7l water, and bring to a boil, skimming the foam as it rises. Cover and simmer for 35 minutes over medium heat, stirring occasionally, until the rice is quite soft.\nAdd the sugar, stirring constantly with a long, wooden spoon for 5 minutes until the sugar has dissolved. Add the oil, almonds, saffron water, cardamom, and rose water. Stir well. Reduce heat to low, cover, and simmer for 50 to 60 minutes or until you have thick, smooth pudding.\nRemove from heat and immediately spoon the pudding into individual serving bowls or a large bowl. Decorate right away (before the pudding has cooled) with cinnamon, almonds, orange peel, and pistachios. Allow to cool at room temperature, then chill in refrigerator.\nServe the pudding chilled. Nush-e Jan!\nNote: This rich, delicious saffron pudding is associated with sofrehs and the giving of alms during religious ceremonies. It also makes a wonderful dessert in small portions.",
   "ingredients": [
    {"group_label": null, "name": "1 cup (200g) rice", "required": true},
    {"group_label": null, "name": "1/2 teaspoon sea salt", "required": true},
    {"group_label": null, "name": "7 cups (1.7l) water", "required": true},
    {"group_label": null, "name": "2 cups (400g) sugar", "required": true},
    {"group_label": null, "name": "1/4 cup (60ml) oil or unsalted butter", "required": true},
    {"group_label": null, "name": "1/2 cup (85g) raw blanched almonds", "required": true},
    {"group_label": null, "name": "1/2 teaspoon ground saffron dissolved in 2 tablespoons hot water", "required": true},
    {"group_label": null, "name": "1 tablespoon ground cardamom", "required": true},
    {"group_label": null, "name": "1/2 cup (120ml) rose water", "required": true},
    {"group_label": "Garnish", "name": "2 teaspoons ground cinnamon", "required": false},
    {"group_label": "Garnish", "name": "2 teaspoons slivered almonds", "required": false},
    {"group_label": "Garnish", "name": "1/4 cup (30g) candied orange peel, chopped", "required": false},
    {"group_label": "Garnish", "name": "2 teaspoons slivered pistachios", "required": false}
   ]},
  {"title": "Barbari Bread (Nan-e Barbari)", "cuisine": "Persian",
   "instructions": "In a wide mixing bowl, dissolve the yeast in 3 cups/720ml warm water. Add the sugar and set aside for 10 minutes.\nAdd the salt to the yeast mixture and mix well. Gradually add the flour and stir constantly. When 6 cups/600g flour have been added and you have a sticky dough, add 1 tablespoon oil and mix for 2 minutes. Transfer the dough to a floured counter and knead for about 15 minutes, adding the rest of the flour if necessary, until the dough is no longer sticky.\nPour 3 tablespoons oil into another wide bowl and place the dough over it. Cover the bowl entirely with a clean damp towel or plastic wrap and allow the dough to rise for 4 hours, without moving it, in a warm, dark place (oven or pantry).\nPunch the air out of the dough while it is still in the bowl and flip it over. Cover with a clean damp towel and allow to rise 2 more hours.\nTo cook the bread, place a baking stone in the lower level of the oven and preheat the oven to 500°F (260°C) for at least 20 minutes.\nTo make the glaze: In a small bowl, mix together the baking soda, flour, and warm water, and mix well until smooth.\nWith oily hands, divide the dough into 4 balls. Place each ball on a lightly oiled surface. Use an oiled rolling pin to roll each ball out to an approximately 14x8-in/45x35cm oval shape. Place loaves on an oiled surface, cover with a towel, and leave at room temperature for 20 minutes.\nDust the baker's peel with the cornmeal and transfer a loaf to the baker's peel. Brush the glaze down the length of the dough. With damp fingers, make dents on the top of the loaf and sprinkle the tops with seeds.\nImmediately slide the dough onto the hot baking stone in the oven, cornmeal side down, and bake for 8 minutes. Turn over and bake for 2 to 4 minutes longer. Continue for the remaining loaves.\nUse the baker's peel to remove the bread from the oven and slide it onto cooling rack. Cover with a clean towel and serve hot. If you are not serving the bread fresh, wrap in aluminum foil and toast before serving. Nush-e Jan!\nNote: Barbari bread is a flat oval or round 1 to 1 1/2-in/3.5cm-thick loaf. It is at its best eaten fresh, as you would a French baguette. You can also cook this bread without a baking stone by using a baking sheet. Dust it with cornmeal, place a loaf on it, and with damp hands dent the top and sprinkle with seeds. Bake for 12 minutes on one side and 6 minutes on the other.\nVariation — Whole Wheat: If you'd like to make Barbari bread using whole wheat flour, use about 1/2 cup/50g less flour.",
   "ingredients": [
    {"group_label": "Dough", "name": "1 package or 1 tablespoon dry active yeast", "required": true},
    {"group_label": "Dough", "name": "3 cups (720ml) warm water", "required": true},
    {"group_label": "Dough", "name": "1 tablespoon sugar", "required": true},
    {"group_label": "Dough", "name": "2 teaspoons sea salt", "required": true},
    {"group_label": "Dough", "name": "6 1/2-8 1/2 cups (650g-850g) unbleached all-purpose flour, sifted", "required": true},
    {"group_label": "Dough", "name": "4 tablespoons oil or butter", "required": true},
    {"group_label": "Dough", "name": "1/2 cup (85g) yellow cornmeal, for dusting", "required": true},
    {"group_label": "Glaze", "name": "1 teaspoon baking soda", "required": true},
    {"group_label": "Glaze", "name": "1 teaspoon flour", "required": true},
    {"group_label": "Glaze", "name": "2 tablespoons warm water", "required": true},
    {"group_label": "Decoration", "name": "1 tablespoon sesame seeds or nigella seeds", "required": true},
    {"group_label": "Special equipment", "name": "Baking stone", "required": false},
    {"group_label": "Special equipment", "name": "Baker's peel", "required": false}
   ]},
  {"title": "Persian Gulf-Style Shrimp with Herbs and Tamarind (Ghalieh Maygu)", "cuisine": "Persian",
   "instructions": "Heat 2 tablespoons oil in a medium-sized sauté pan and sauté the spring onions and garlic over medium heat, until translucent. Add cilantro, parsley, and fenugreek, and sauté 2 minutes longer.\nAdd the salt, pepper, turmeric, coriander, red pepper flakes, and flour, and sauté for 1 minute. Add the tamarind, and grape molasses. Stir well and bring to a boil. Reduce heat to low, cover, and simmer for 20 minutes. Adjust seasoning to taste. Keep warm.\nIn a bowl, mix together all the dusting ingredients. Dust all sides of the shrimps and set aside.\nJust before serving, in a large skillet, heat 1 tablespoon oil and butter over medium-high heat until very hot and sauté the shrimp on both sides, shaking the pan, for a few minutes until they change color. Be careful not to overcook — shrimp loses its tenderness when overcooked. Add to the tamarind sauce.\nServe with chelow (saffron-flavored steamed rice). Nush-e Jan!\nNote: Store-bought tamarind paste is very sour and concentrated. I prefer to use homemade tamarind puree: soak 1/2 pound/225g tamarind pods in 5 cups water overnight, pass through a sieve and use a masher to extract as much liquid as possible.\nVegetarian variation: Replace the shrimp with 2 cups/340g raw cashew nuts. Just before serving, dust the cashews with the dusting mixture and sauté in oil and butter until golden. Add them to the tamarind sauce in step 4.\nVariation — Fish Khoresh (Ghalieh-ye mahi): Replace the shrimp with fish fillets. In step 3 use 2 pounds/900g of firm white fish fillets, bones removed, (rockfish or catfish) cut into 3-inch/7.5cm lengths. Proceed with step 4, searing both sides of the fillets. Add to the sauce just before serving.\nVariation — Caspian Fish Khoresh (Khoresh-e anar avij): Replace the tamarind paste with 2 tablespoons pomegranate molasses or bitter orange paste, everything else remains the same.",
   "ingredients": [
    {"group_label": "Tamarind sauce", "name": "2 tablespoons oil", "required": true},
    {"group_label": "Tamarind sauce", "name": "1/2 cup (50g) chopped fresh spring onions", "required": true},
    {"group_label": "Tamarind sauce", "name": "6 cloves garlic, peeled and sliced", "required": true},
    {"group_label": "Tamarind sauce", "name": "3 cups (250g) fresh chopped cilantro", "required": true},
    {"group_label": "Tamarind sauce", "name": "1 cup (85g) fresh chopped parsley", "required": true},
    {"group_label": "Tamarind sauce", "name": "1 tablespoon dried or 1 cup (85g) fresh chopped fenugreek leaves", "required": true},
    {"group_label": "Tamarind sauce", "name": "2 teaspoons sea salt", "required": true},
    {"group_label": "Tamarind sauce", "name": "1/2 teaspoon freshly ground pepper", "required": true},
    {"group_label": "Tamarind sauce", "name": "1/2 teaspoon turmeric", "required": true},
    {"group_label": "Tamarind sauce", "name": "1 teaspoon ground coriander", "required": true},
    {"group_label": "Tamarind sauce", "name": "1/2 teaspoon red pepper flakes", "required": true},
    {"group_label": "Tamarind sauce", "name": "1 tablespoon flour", "required": true},
    {"group_label": "Tamarind sauce", "name": "3 cups (825g) homemade tamarind puree, or 2 tablespoons commercial paste dissolved in 3 cups (720ml) water", "required": true},
    {"group_label": "Tamarind sauce", "name": "1 tablespoon grape molasses or brown sugar", "required": true},
    {"group_label": "Dusting", "name": "1 tablespoon flour", "required": true},
    {"group_label": "Dusting", "name": "1/2 teaspoon red pepper flakes", "required": true},
    {"group_label": "Dusting", "name": "1/2 teaspoon turmeric", "required": true},
    {"group_label": "Dusting", "name": "1 teaspoon ground cumin", "required": true},
    {"group_label": "Dusting", "name": "1 teaspoon ground coriander", "required": true},
    {"group_label": "Dusting", "name": "1/4 teaspoon cinnamon", "required": true},
    {"group_label": "Dusting", "name": "1/4 teaspoon ground cloves", "required": true},
    {"group_label": "Dusting", "name": "1 teaspoon sea salt", "required": true},
    {"group_label": "Dusting", "name": "1/2 teaspoon freshly ground pepper", "required": true},
    {"group_label": "Shrimp", "name": "1 tablespoon oil", "required": true},
    {"group_label": "Shrimp", "name": "1 tablespoon butter", "required": true},
    {"group_label": "Shrimp", "name": "1 1/2 pounds (675g) raw shrimp, butterflied, rinsed and patted dry", "required": true}
   ]},
  {"title": "Orange Khoresh (Khoresh-e Porteqal)", "cuisine": "Persian",
   "instructions": "In a Dutch oven, heat 3 tablespoons oil over medium heat and brown the onions and chicken. Sprinkle in flour, orange zest, advieh, salt, pepper, and turmeric, and sauté for 1 minute.\nPour in the orange juice. Cover and simmer over low heat for 35 minutes.\nMeanwhile, peel the carrots and slice into thin slivers. Sauté in 2 tablespoons oil for a few minutes. Add the carrot to the chicken, cover, and simmer for 1 hour.\nPeel the oranges, separate them into segments, and peel the membrane from each segment.\nIn a saucepan, combine the vinegar, lime juice, sugar, and saffron-orange blossom water. Simmer for 10 minutes over low heat. Remove from heat, add the orange segments, and set aside to macerate for 10 minutes.\nTransfer the khoresh to a deep, ovenproof casserole, carefully arrange the orange segments with the sauce on the top, cover, and place in a warm oven until ready to serve.\nCheck to see if the chicken is tender. Taste and adjust seasoning. Add more sugar or lime juice according to your taste.\nJust before serving, sprinkle the khoresh with pistachios and almonds. Serve hot from same dish with chelow (saffron-steamed rice). Nush-e Jan!\nVegetarian variation: Eliminate the meat from the ingredients and from step 1. Replace it with 1 cup/200g dried white broad beans (soaked in water overnight and drained). In step 2 add 3 cups/720ml water with the orange juice and cook for 1 1/2 hours. Proceed with step 3.",
   "ingredients": [
    {"group_label": null, "name": "6 tablespoons oil, butter, or ghee", "required": true},
    {"group_label": null, "name": "2 large onions, peeled and thinly sliced", "required": true},
    {"group_label": null, "name": "2 pounds (900g) chicken legs, cut up, or 1 pound (450g) boneless, skinless chicken thighs, cut into 3-inch/7.5cm cubes", "required": true},
    {"group_label": null, "name": "1 tablespoon all-purpose flour", "required": true},
    {"group_label": null, "name": "Zest of 4 oranges", "required": true},
    {"group_label": null, "name": "1 teaspoon advieh (Persian spice mix)", "required": true},
    {"group_label": null, "name": "1 teaspoon sea salt", "required": true},
    {"group_label": null, "name": "1/2 teaspoon freshly ground black pepper", "required": true},
    {"group_label": null, "name": "1/2 teaspoon turmeric", "required": true},
    {"group_label": null, "name": "1 1/2 cups (360ml) freshly squeezed orange juice", "required": true},
    {"group_label": null, "name": "2 large carrots", "required": true},
    {"group_label": null, "name": "4 large oranges (used for zest), segmented", "required": true},
    {"group_label": null, "name": "2 tablespoons wine vinegar", "required": true},
    {"group_label": null, "name": "1/4 cup (60ml) fresh lime juice", "required": true},
    {"group_label": null, "name": "1/2 cup (100g) brown sugar or 2 tablespoons grape molasses", "required": true},
    {"group_label": null, "name": "1/4 teaspoon ground saffron dissolved in 1 tablespoon orange blossom water", "required": true},
    {"group_label": "Garnish", "name": "1 tablespoon slivered pistachios", "required": false},
    {"group_label": "Garnish", "name": "1 tablespoon slivered almonds", "required": false}
   ]},
  {"title": "Barberry Khoresh (Khoresh-e Zereshk)", "cuisine": "Persian",
   "instructions": "In a Dutch oven, heat 2 tablespoons oil over medium heat and brown the onions and chicken. Add salt, pepper, turmeric, cinnamon, cardamom, cumin, tomato paste, and saffron-rose water, and sauté for 1 minute.\nAdd water — 1 1/2 cups/360ml for chicken or 2 1/2 cups/600ml for lamb or beef — and bring to a boil. Reduce heat, cover, and simmer over low heat for 1 hour for chicken or 2 hours for lamb or beef — or until the meat is tender.\nMeanwhile, to make the garnish: Heat 2 tablespoons oil in a wide skillet over medium-low heat, add the nuts, and stir-fry for 20 seconds. Remove the nuts from the skillet and set aside (for garnish later).\nIn the same skillet, place 2 tablespoons oil, the barberries, 2 tablespoons water, grape molasses, saffron-rose water, and lime juice, and stir-fry over medium heat for 4 minutes (beware, barberries burn easily; do not overcook). Set aside.\nCheck to be sure the meat is tender. Transfer the khoresh from the Dutch oven to a deep, ovenproof casserole. Add barberries on top, cover and keep warm until ready to serve. Just before serving, add the nuts and serve with chelow (saffron-steamed rice). Nush-e Jan!\nVegetarian variation: Eliminate the meat from the ingredients and from step 1. In step 2 reduce the water to 1/2 cup and the cooking time to 5 minutes. In step 3 increase the nuts to 1 cup each of almonds and pistachios. Proceed with the recipe.\nVariation — Barberry Khoresh with Whole Roast Duck: In step 1, eliminate the chicken. Stuff a whole duck with 4 cloves garlic, 2 spring onions, 1 tablespoon salt, 1 teaspoon black pepper, 1 tablespoon turmeric, and 1 cup/85g fresh, chopped cilantro. Roast at 350°F (180°C) for 3 hours. Cut up the duck and transfer it to an ovenproof casserole, and in step 5, add the khoresh to the casserole with the duck. Add the barberries on top, cover and keep warm until ready to serve.\nVariation — Barberry Khoresh with Meatballs: Use 1 1/2 pounds/675g ground meat or chicken thighs to make meatballs. Mix with 1 grated onion, 1/2 teaspoon salt, 1/2 teaspoon pepper, 1/2 teaspoon turmeric, 1 teaspoon ground cardamom, and 1/2 teaspoon cinnamon. Knead lightly and shape into hazelnut-sized meatballs. In a wide skillet heat 2 tablespoons oil over medium heat, carefully add the meatballs, then swirl and shake the skillet back and forth to brown meatballs all over. Add to the Dutch oven in step 2.",
   "ingredients": [
    {"group_label": "Khoresh", "name": "2 tablespoons oil, butter, or ghee", "required": true},
    {"group_label": "Khoresh", "name": "2 large onions, peeled and thinly sliced", "required": true},
    {"group_label": "Khoresh", "name": "1 1/2 pounds (675g) boneless chicken thighs (or lamb or beef), cut into 2-inch cubes", "required": true},
    {"group_label": "Khoresh", "name": "1 teaspoon sea salt", "required": true},
    {"group_label": "Khoresh", "name": "1/2 teaspoon freshly ground black pepper", "required": true},
    {"group_label": "Khoresh", "name": "1/4 teaspoon turmeric", "required": true},
    {"group_label": "Khoresh", "name": "1/2 teaspoon ground cinnamon", "required": true},
    {"group_label": "Khoresh", "name": "1 teaspoon ground cardamom", "required": true},
    {"group_label": "Khoresh", "name": "2 teaspoons ground cumin", "required": true},
    {"group_label": "Khoresh", "name": "2 tablespoons tomato paste", "required": true},
    {"group_label": "Khoresh", "name": "1/4 teaspoon ground saffron dissolved in 1 tablespoon rose water", "required": true},
    {"group_label": "Barberry sauce", "name": "2 tablespoons oil", "required": true},
    {"group_label": "Barberry sauce", "name": "1 1/2 cups (225g) dried barberries (zereshk), cleaned and drained", "required": true},
    {"group_label": "Barberry sauce", "name": "1/4 cup (60g) grape molasses or brown sugar", "required": true},
    {"group_label": "Barberry sauce", "name": "1/4 teaspoon ground saffron dissolved in 1 tablespoon rose water", "required": true},
    {"group_label": "Barberry sauce", "name": "2 tablespoons fresh lime juice", "required": true},
    {"group_label": "Garnish", "name": "2 tablespoons oil", "required": false},
    {"group_label": "Garnish", "name": "1/4 cup (30g) slivered almonds", "required": false},
    {"group_label": "Garnish", "name": "1/4 cup (40g) raw shelled pistachios", "required": false}
   ]},
  {"title": "Pomegranate Khoresh with Chicken (Khoresh-e Fesenjan ba Jujeh)", "cuisine": "Persian",
   "instructions": "To roast the butternut squash: Preheat the oven to 400°F (200°C). In a sheet pan lined with parchment paper, place the butternut squash, 2 tablespoons oil, 1/2 teaspoon salt and 1/2 teaspoon pepper. Toss well and spread evenly. Bake for 15 minutes. Set aside.\nIn a Dutch oven, heat 2 tablespoons oil over medium heat until very hot, and sauté the onions until golden brown. Add the walnuts and sauté for 1 minute. Remove from heat and transfer to a food processor. Add the salt, pepper, turmeric, cinnamon, cardamom, and pulse until grainy. Add 1 cup pomegranate juice, the pomegranate molasses, and saffron-rose water, and mix well to create a creamy paste.\nIn the Dutch oven, heat 2 tablespoons oil over medium heat and sauté the chicken until golden brown. Add the walnut paste and half the roasted butternut squash, and the remaining pomegranate juice, stirring gently. Cover and simmer over low heat for 1 1/2 hours, stirring occasionally with a wooden spoon to prevent from burning.\nThe khoresh should be sweet and sour and have the consistency of heavy cream. Adjust to taste by adding pomegranate molasses for sourness or grape molasses for sweetness. If the sauce is too thick, thin it with more pomegranate juice.\nTransfer the khoresh from the Dutch oven to a deep, ovenproof casserole. Cover and place in a warm oven until ready to serve. Just prior to serving, garnish with the remaining roasted butternut squash, and sprinkle with fresh pomegranate arils and walnuts. Serve with saffron-steamed rice. Nush-e Jan!\nNote: The butternut squash can be replaced with 2 cups peeled and cubed beets, quinces, carrots, or prunes.\nVegetarian variation: Eliminate the chicken from the ingredients. Everything else remains the same.\nVariation — Caspian-Style Pomegranate Khoresh with Fish: Eliminate the chicken in step 3 and replace it with 2 pounds/900g of white fish fillets (bones removed), cut into 3-inch/7.5cm lengths and seared in 2 tablespoons oil in a wide skillet over medium-high heat. Add it to the khoresh in step 6.\nVariation — Pistachio Khoresh-e Fesenjan: In Kerman, walnuts are replaced with raw pistachio kernels to make a pistachio fesenjan.\nVariation — Pomegranate Khoresh with Roasted Duck: Rub a duck, inside and out, with 1 tablespoon salt, 1 tablespoon black pepper, and 2 teaspoons turmeric. Stuff it with 4 cloves garlic and 4 spring onions, and roast at 350°F for 3 hours. Meanwhile, make the khoresh above without the chicken. Serve the duck with the khoresh.",
   "ingredients": [
    {"group_label": null, "name": "2 pounds (900g) butternut squash, peeled and cut into 2-inch/5cm cubes", "required": true},
    {"group_label": null, "name": "6 tablespoons oil, butter, or ghee", "required": true},
    {"group_label": null, "name": "2 large onions, peeled and thinly sliced", "required": true},
    {"group_label": null, "name": "1/2 pound (2 cups/225g) shelled walnuts", "required": true},
    {"group_label": null, "name": "1 teaspoon sea salt", "required": true},
    {"group_label": null, "name": "1/4 teaspoon freshly ground pepper", "required": true},
    {"group_label": null, "name": "1/4 teaspoon turmeric", "required": true},
    {"group_label": null, "name": "1/2 teaspoon cinnamon", "required": true},
    {"group_label": null, "name": "2 teaspoons ground cardamom", "required": true},
    {"group_label": null, "name": "4 cups (960ml) pure pomegranate juice", "required": true},
    {"group_label": null, "name": "1 teaspoon pomegranate molasses", "required": true},
    {"group_label": null, "name": "1/4 teaspoon ground saffron dissolved in 1 tablespoon water", "required": true},
    {"group_label": null, "name": "2 pounds (900g) chicken legs, cut up", "required": true},
    {"group_label": null, "name": "1 teaspoon grape molasses or sugar (if pomegranate juice too sour)", "required": false},
    {"group_label": "Garnish", "name": "Arils of 1 fresh pomegranate", "required": false},
    {"group_label": "Garnish", "name": "2 tablespoons walnuts", "required": false}
   ]},
  {"title": "Spinach and Plum Khoresh (Khoresh-e Esfenaj-o Alu)", "cuisine": "Persian",
   "instructions": "To cook the meat: In a Dutch oven, heat 3 tablespoons oil over medium heat and brown the onion and the meat. Add salt, pepper, and turmeric, and sauté for 1 minute.\nPour in water — 2 1/2 cups/600ml for meat, 1 1/2 cups/360ml for chicken. Cover and simmer 45 minutes for meat or 10 minutes for chicken over low heat.\nTo cook the spinach: In a wide skillet, heat 3 tablespoons oil over medium heat and brown the onions. Add the spinach, cover and cook for 5 minutes. Add the spinach and onion mixture to the Dutch oven. Add the plums, grape molasses, and verjuice. Cover and simmer 1 1/2 hours over low heat.\nCheck to see that meat is cooked. Taste the khoresh and adjust seasoning. Transfer to a deep casserole. Cover and place in a warm oven until ready to serve. Serve hot from the same dish with chelow (saffron-steamed rice). Nush-e Jan!",
   "ingredients": [
    {"group_label": "Meat", "name": "3 tablespoons oil, butter, or ghee", "required": true},
    {"group_label": "Meat", "name": "1 large onion, peeled and thinly sliced", "required": true},
    {"group_label": "Meat", "name": "1 pound (450g) leg of lamb or boneless, skinless chicken thighs, cut into 2-inch/5cm cubes, or 2 pounds/900g veal shanks", "required": true},
    {"group_label": "Meat", "name": "1 1/2 teaspoons sea salt", "required": true},
    {"group_label": "Meat", "name": "1/2 teaspoon freshly ground pepper", "required": true},
    {"group_label": "Meat", "name": "1/2 teaspoon turmeric", "required": true},
    {"group_label": "Spinach", "name": "3 tablespoons oil, butter, or ghee", "required": true},
    {"group_label": "Spinach", "name": "2 large onions, peeled and thinly sliced", "required": true},
    {"group_label": "Spinach", "name": "2 pounds (900g) fresh spinach, washed and coarsely chopped, or 1 pound (450g) frozen", "required": true},
    {"group_label": "Spinach", "name": "1 1/2 cups (200g) dried Persian plums (alu zard) or pitted dried prunes", "required": true},
    {"group_label": "Spinach", "name": "1 tablespoon grape molasses", "required": true},
    {"group_label": "Spinach", "name": "1/4 cup (60ml) verjuice (ab-ghureh)", "required": true}
   ]}
]
$recipes$::jsonb)
  loop
    continue when exists (select 1 from public.recipes where title = r ->> 'title');

    insert into public.recipes (title, instructions, cuisine, source_url)
    values (r ->> 'title', r ->> 'instructions', r ->> 'cuisine',
            'The Food of Life by Najmieh Batmanglij')
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
