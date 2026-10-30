-- Chef App — twelve ice creams and sorbets from The Perfect Scoop.
--
-- Transcribed from photographs of David Lebovitz's "The Perfect Scoop" (revised
-- and updated). source_url carries the citation as plain text, as it does for
-- the Food of Life recipes (see 20261030000100_persian_recipes.sql).
--
-- All go under Desserts, with subcategory 'Ice Cream & Sorbets' (the column
-- added by 20261030000400_recipe_subcategory.sql).
--
-- The book's anecdotes are left out; its practical notes, variations and
-- "perfect pairings" follow the steps as "Tip:", "Note:", "Variation:" and
-- "Perfect pairing:" lines, with page references removed since the pages they
-- point to are not in the app. The pairings and the Wet Walnuts ingredient name
-- other recipes from the book that have not been added.
--
-- Labneh Ice Cream is the book's two-page recipe and only its first page has
-- been photographed, so it ends at the freezing step; the continuation (and the
-- Note on making labneh) is still to come.
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
  {"title": "Watermelon Sorbetto", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "In a small, nonreactive saucepan, heat 1/2 cup (125ml) of the watermelon puree with the sugar and salt, stirring until the sugar is dissolved. Transfer to a medium bowl and stir in the remaining 2 1/2 cups (625ml) watermelon puree. Mix in the lime juice and the vodka, if using.\nChill the mixture thoroughly in the refrigerator, then freeze it in your ice cream maker according to the manufacturer's instructions. During the last minute of churning, add the mini chocolate chips.\nTip: Because watermelons have a lot of water, take the sorbetto out of the freezer long enough ahead of serving to make it scoopable, 5 to 10 minutes.\nNote: I find that I get about 3 cups (750ml) watermelon puree from a 3-pound (1.4kg) chunk of watermelon. Cut away the rind, remove any seeds, and then cut the juicy, pink flesh into cubes and puree them in a blender or food processor. Any extra puree can be frozen for another use, such as watermelon margaritas.\nVariation: This sorbetto makes excellent Watermelon Popsicles. Simply pour the just-churned mixture into plastic Popsicle molds and freeze until firm.",
   "ingredients": [
    {"group_label": null, "name": "3 cups (750ml) watermelon puree (from a 3-pound, 1.4kg, watermelon; see Note)", "required": true},
    {"group_label": null, "name": "1/2 cup (100g) sugar", "required": true},
    {"group_label": null, "name": "Big pinch of kosher or sea salt", "required": true},
    {"group_label": null, "name": "1 tablespoon freshly squeezed lime juice", "required": true},
    {"group_label": null, "name": "1 to 2 tablespoons vodka (optional)", "required": false},
    {"group_label": null, "name": "1 to 2 tablespoons mini semisweet chocolate chips", "required": true}
   ]},
  {"title": "Fresh Mint Ice Cream", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "Warm the milk, sugar, 1 cup (250ml) of the cream, and the salt in a small saucepan. Add the mint leaves and stir until they're immersed in the liquid. Cover, remove from the heat, and let steep at room temperature for 1 hour.\nStrain the mint-infused mixture through a mesh strainer into a medium saucepan. Press on the mint leaves to extract as much of the flavor as possible, then discard the mint leaves. Pour the remaining 1 cup (250ml) heavy cream into a large bowl and set the strainer on top.\nRewarm the mint-infused mixture. In a separate medium bowl, whisk together the egg yolks. Slowly pour the warm mint liquid into the egg yolks, whisking constantly, then scrape the warmed egg yolks into the saucepan. Stir the mixture constantly with a heatproof spatula over medium heat, scraping the bottom as you stir, until the mixture thickens and coats the spatula.\nPour the custard through the strainer and stir it into the cream. Stir over an ice bath until cool.\nChill the mixture thoroughly in the refrigerator, then freeze it in your ice cream maker according to the manufacturer's instructions.\nPerfect pairings: Make Girl Scout–Style Ice Cream Sandwiches by using Chocolate Ice Cream Sandwich Cookies to surround scoops of Fresh Mint Ice Cream. You can also get that same chocolate-mint cookie effect by layering the just-churned ice cream with a swirl of Fudge Ripple, Stracciatella, or crumbled bits of Chewy-Dense Brownies.",
   "ingredients": [
    {"group_label": null, "name": "1 cup (250ml) whole milk", "required": true},
    {"group_label": null, "name": "3/4 cup (150g) sugar", "required": true},
    {"group_label": null, "name": "2 cups (500ml) heavy cream", "required": true},
    {"group_label": null, "name": "Pinch of kosher or sea salt", "required": true},
    {"group_label": null, "name": "2 cups (40g) packed fresh mint leaves", "required": true},
    {"group_label": null, "name": "5 large egg yolks", "required": true}
   ]},
  {"title": "Olive Oil Ice Cream", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "Warm the milk, sugar, and salt in a medium saucepan. Pour the cream into a large bowl and set a mesh strainer on top.\nIn a separate medium bowl, whisk together the egg yolks. Slowly pour the warm mixture into the egg yolks, whisking constantly, then scrape the warmed egg yolks into the saucepan. Stir the mixture constantly with a heatproof spatula over medium heat, scraping the bottom as you stir, until the mixture thickens and coats the spatula.\nPour the custard through the strainer and stir it into the cream. Vigorously whisk the olive oil into the custard until it's well blended, then stir over an ice bath until cool.\nChill the mixture thoroughly in the refrigerator, then freeze it in your ice cream maker according to the manufacturer's instructions.\nTip: Olive oil ice cream pairs remarkably well with summer fruits such as strawberries or roasted apricots, and if you use a fruity Spanish Arbequina olive oil, you'll find this ice cream is sublime drizzled with Lean Chocolate Sauce. Or just serve it with a few threads of extra-virgin olive oil scribbled over the top, flecked with a few grains of flaky sea salt.\nVariation: For Lemon–Olive Oil Ice Cream, very, very finely grate the zest of 1 lemon, preferably unsprayed, into the olive oil and warm it gently. Remove from the heat and let it infuse while you make the custard. Whisk the oil along with the zest into the ice cream custard.\nPerfect pairing: To make Honey-Roasted Apricots to serve alongside, for 6 servings, halve 12 fresh apricots and remove the pits. Arrange them cut-side down in a baking dish and drizzle with 3 tablespoons (45ml) honey, 1/3 cup (90ml) white wine, and 1/2 vanilla bean, split lengthwise. Bake uncovered in a 400°F (200°C) oven for 15 to 20 minutes, until the apricots are tender, basting them with their juices during baking. Serve the apricots with a scoop of ice cream and some French Almonds.",
   "ingredients": [
    {"group_label": null, "name": "1 1/3 cups (330ml) whole milk", "required": true},
    {"group_label": null, "name": "1/2 cup (100g) sugar", "required": true},
    {"group_label": null, "name": "Pinch of kosher or sea salt", "required": true},
    {"group_label": null, "name": "1 cup (250ml) heavy cream", "required": true},
    {"group_label": null, "name": "6 large egg yolks", "required": true},
    {"group_label": null, "name": "1/2 cup (125ml) fruity extra-virgin olive oil", "required": true}
   ]},
  {"title": "Pear-Caramel Ice Cream", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "Dice the pears into 1/4-inch (6mm) pieces.\nSpread the sugar in a large, nonreactive, heavy-bottomed saucepan. Cook over medium heat, watching it carefully. When the sugar begins to liquefy and darken at the edges, use a heatproof spatula to very gently stir, encouraging the heat of the liquefied sugar around the edges to moisten and melt the sugar crystals in the center.\nOnce the sugar becomes deep amber, stir in the pear pieces. Some of the caramel will seize and harden; use a heatproof utensil to stir the pears and melt any bits of hard caramel. Continue to cook the pears for 10 minutes, until the pieces are cooked through.\nRemove from the heat and stir in 1/2 cup (125ml) of the cream, then mix in the remaining 1 1/2 cups (375ml) cream, along with the salt and lemon juice.\nLet cool to room temperature, then puree in a blender or food processor until smooth. To remove any tough pear fibers, use a flexible rubber spatula to press the mixture through a mesh strainer.\nChill the mixture thoroughly in the refrigerator, then freeze it in your ice cream maker according to the manufacturer's instructions.\nTip: Use the ripest, most flavorful pears you can find, because you want the flavor of the pears to stand up to the slightly burnt taste of the caramel. I recommend Comice or Bartlett pears, which have a heady, roselike aroma when ripe. Don't be alarmed if the sugar hardens and crackles when you add the pears. Keep cooking. The liquid from the pears will dissolve any bits of the caramelized sugar that may, at first, seem stubborn. Any resistance will soon melt away.\nVariation: For Pear, Caramel, and Ginger Ice Cream, add 1/3 cup (35g) very finely chopped candied ginger during the last few minutes of churning.\nPerfect pairing: Make Pear-Caramel Cream Puffs with Salted Butter Caramel and Chocolate Sauces and Buttercrunch Toffee Bits: Fill Profiteroles with Pear-Caramel Ice Cream, and set them on a pool of Salted Butter Caramel Sauce. Scribble Lean Chocolate Sauce over the cream puffs, then top with bits of well-crumbled Buttercrunch Toffee.",
   "ingredients": [
    {"group_label": null, "name": "3 medium ripe pears, peeled and cored", "required": true},
    {"group_label": null, "name": "3/4 cup plus 2 tablespoons (180g) sugar", "required": true},
    {"group_label": null, "name": "2 cups (500ml) heavy cream", "required": true},
    {"group_label": null, "name": "1/8 teaspoon kosher or sea salt", "required": true},
    {"group_label": null, "name": "A few drops freshly squeezed lemon juice", "required": true}
   ]},
  {"title": "Labneh Ice Cream with Pistachio-Sesame Brittle", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "To make the ice cream, whisk together the labneh, cream, honey, sugar, and salt. Chill the mixture thoroughly in the refrigerator.\nTo make the pistachio-sesame brittle, line a baking sheet with a silicone baking mat or grease it lightly with vegetable oil. Mix the pistachios and sesame seeds in a small bowl.\nSpread the sugar in a medium, heavy-bottomed skillet and cook over medium heat, watching it carefully. When it begins to liquefy and darken at the edges, use a heatproof spatula to stir it very gently, encouraging the liquefied sugar around the edges to moisten and melt the sugar crystals in the center.\nTilt the pan and stir gently until all the sugar is melted and the caramel begins to smoke. Once it has a deep golden color, remove it from the heat and immediately stir in the nuts and seeds. Scrape the mixture onto the prepared baking sheet and spread it with a spatula into an even layer. Let cool completely. Once cooled, chop the brittle into bite-size pieces with a chef's knife. Store in an airtight container until ready to use.\nFreeze the labneh mixture in your ice cream maker according to the manufacturer's instructions.",
   "ingredients": [
    {"group_label": "Ice cream", "name": "2 1/2 cups (620ml) homemade labneh (see Note) or plain Greek yogurt", "required": true},
    {"group_label": "Ice cream", "name": "1 cup (250ml) heavy cream", "required": true},
    {"group_label": "Ice cream", "name": "6 tablespoons (90ml) good-flavored honey, slightly warmed", "required": true},
    {"group_label": "Ice cream", "name": "1/4 cup (50g) sugar", "required": true},
    {"group_label": "Ice cream", "name": "Pinch of kosher or sea salt", "required": true},
    {"group_label": "Pistachio-sesame brittle", "name": "1/4 cup plus 2 tablespoons (45g) shelled pistachios", "required": true},
    {"group_label": "Pistachio-sesame brittle", "name": "3 tablespoons sesame seeds", "required": true},
    {"group_label": "Pistachio-sesame brittle", "name": "1/2 cup (100g) sugar", "required": true}
   ]},
  {"title": "Maple Walnut Ice Cream with Wet Walnuts", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "Warm the milk and sugar in a medium saucepan. Pour the cream into a large bowl and set a mesh strainer on top.\nIn a separate medium bowl, whisk together the egg yolks. Slowly pour the warm mixture into the egg yolks, whisking constantly, then scrape the warmed egg yolks into the saucepan. Stir the mixture constantly with a heatproof spatula over medium heat, scraping the bottom as you stir, until the mixture thickens and coats the spatula.\nPour the custard through the strainer and stir it into the cream. Add the maple syrup, salt, and vanilla and stir over an ice bath until cool.\nChill the mixture thoroughly in the refrigerator, then freeze it in your ice cream maker according to the manufacturer's instructions. During the last few minutes of churning, add the Wet Walnuts.\nTip: Maple syrup is graded dark amber or light amber. The darker the syrup, the deeper the flavor, so I always use the darker type, because there's no such thing in my book as \"too much maple syrup flavor.\" Add Wet Walnuts for a double-delivery of the delectable maple flavor, if you can handle it.\nPerfect pairing: Use Salted Butter Caramel Sauce to make Maple Walnut Ice Cream Sundaes, resting the ice cream on Chewy-Dense Brownies and topping them off with Candied Cherries.",
   "ingredients": [
    {"group_label": null, "name": "1 1/2 cups (375ml) whole milk", "required": true},
    {"group_label": null, "name": "2 tablespoons sugar", "required": true},
    {"group_label": null, "name": "1 1/2 cups (375ml) heavy cream", "required": true},
    {"group_label": null, "name": "5 large egg yolks", "required": true},
    {"group_label": null, "name": "3/4 cup (180ml) dark amber maple syrup", "required": true},
    {"group_label": null, "name": "1/8 teaspoon kosher or sea salt", "required": true},
    {"group_label": null, "name": "1/4 teaspoon pure vanilla extract", "required": true},
    {"group_label": null, "name": "1 batch Wet Walnuts (a separate recipe in the book)", "required": true}
   ]},
  {"title": "Gianduja Gelato", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "Rub the hazelnuts in a kitchen towel to remove as much of the papery skins as possible, then chop them into pieces the size of lemon seeds in a food processor or blender.\nWarm the milk with 1 cup (250ml) of the cream, the sugar, and the salt in a saucepan. Once warm, remove from the heat and add the chopped hazelnuts. Cover and let steep at room temperature for 1 hour.\nPut the milk chocolate in a large bowl. Heat the remaining 1 cup (250ml) cream in a medium saucepan until it just begins to boil. Pour it over the milk chocolate and stir until the chocolate is completely melted and smooth. Set a mesh strainer over the top.\nPour the hazelnut-infused milk through a strainer into a medium saucepan, squeezing the nuts firmly with your hands to extract as much of the flavorful liquid as possible. Discard the hazelnuts (see Note).\nRewarm the hazelnut-infused mixture. In a separate medium bowl, whisk together the egg yolks. Slowly pour the warm hazelnut mixture into the egg yolks, whisking constantly, then scrape the warmed egg yolks into the saucepan. Stir the mixture constantly with a heatproof spatula over medium heat, scraping the bottom as you stir, until the mixture thickens and coats the spatula.\nPour the custard through the strainer and stir it into the milk chocolate mixture. Add the vanilla and stir over an ice bath until cool.\nChill the mixture thoroughly in the refrigerator, then freeze it in your ice cream maker according to the manufacturer's instructions.\nTip: Be sure to toast the hazelnuts well and use top-quality dark milk chocolate with at least 30 percent cocoa solids, for best results.\nNote: Most of the flavor will have been extracted from the hazelnuts after they're infused in the milk, but if you wish to reuse them, to add crunch to a batch of homemade granola or to mix into a batch of brownies, they can be rinsed well, spread out on a baking sheet, and dried out in a low oven.\nPerfect pairing: Make Gianduja-Stracciatella Gelato by adding Stracciatella to the gelato. Scoop it into Ice Cream Cones to serve.",
   "ingredients": [
    {"group_label": null, "name": "1 1/2 cups (185g) hazelnuts, toasted", "required": true},
    {"group_label": null, "name": "1 cup (250ml) whole milk", "required": true},
    {"group_label": null, "name": "2 cups (500ml) heavy cream", "required": true},
    {"group_label": null, "name": "3/4 cup (150g) sugar", "required": true},
    {"group_label": null, "name": "1/4 teaspoon kosher or sea salt", "required": true},
    {"group_label": null, "name": "4 ounces (115g) milk chocolate, finely chopped", "required": true},
    {"group_label": null, "name": "5 large egg yolks", "required": true},
    {"group_label": null, "name": "1/8 teaspoon pure vanilla extract", "required": true}
   ]},
  {"title": "Cinnamon Ice Cream", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "Warm the milk, sugar, salt, cinnamon sticks, and 1 cup (250ml) of the cream in a medium saucepan. Once warm, cover, remove from the heat, and let steep at room temperature for 1 hour.\nRewarm the cinnamon-infused milk mixture. Remove the cinnamon sticks with a slotted spoon and discard them. Pour the remaining 1 cup (250ml) cream into a large bowl and set a mesh strainer on top.\nIn a separate medium bowl, whisk together the egg yolks. Slowly pour the warm mixture into the egg yolks, whisking constantly, then scrape the warmed egg yolks into the saucepan. Stir the mixture constantly with a heatproof spatula over medium heat, scraping the bottom as you stir, until the mixture thickens and coats the spatula.\nPour the custard through the strainer and into the cream. Stir over an ice bath until cool.\nChill the mixture thoroughly in the refrigerator, then freeze it in your ice cream maker according to the manufacturer's instructions.\nTip: Spicy cinnamon sticks give this ice cream a stronger, far more complex flavor than ground cinnamon does. It's also very good alongside any favorite chocolate dessert, such as devil's food cake or homemade brownies. To break up the cinnamon sticks, put them in a zip-top freezer bag and whack them with a rolling pin or hammer.\nPerfect pairing: Marble this ice cream with Aztec \"Hot\" Chocolate Ice Cream to make Aztec Cinnamon-Chocolate Ice Cream.",
   "ingredients": [
    {"group_label": null, "name": "1 cup (250ml) whole milk", "required": true},
    {"group_label": null, "name": "3/4 cup (150g) sugar", "required": true},
    {"group_label": null, "name": "Pinch of kosher or sea salt", "required": true},
    {"group_label": null, "name": "Ten 3-inch (8cm) cinnamon sticks, broken up", "required": true},
    {"group_label": null, "name": "2 cups (500ml) heavy cream", "required": true},
    {"group_label": null, "name": "5 large egg yolks", "required": true}
   ]},
  {"title": "Vietnamese Coffee Ice Cream", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "Whisk together the condensed milk, espresso, half-and-half, and ground coffee.\nChill the mixture thoroughly in the refrigerator, then freeze it in your ice cream maker according to the manufacturer's instructions.",
   "ingredients": [
    {"group_label": null, "name": "1 1/2 cups (600g) sweetened condensed milk", "required": true},
    {"group_label": null, "name": "1 1/2 cups (375ml) brewed espresso (or very strong brewed coffee)", "required": true},
    {"group_label": null, "name": "1/2 cup (125ml) half-and-half", "required": true},
    {"group_label": null, "name": "Big pinch of finely ground coffee", "required": true}
   ]},
  {"title": "Coffee Ice Cream", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "Warm the milk, sugar, whole coffee beans, salt, and 1/2 cup (125ml) of the cream in a medium saucepan. Once the mixture is warm, cover, remove from the heat, and let steep at room temperature for 1 hour.\nRewarm the coffee-infused milk mixture. Pour the remaining 1 cup (250ml) cream into a large bowl and set a mesh strainer on top. In a separate medium bowl, whisk together the egg yolks. Slowly pour the warm coffee mixture into the egg yolks, whisking constantly, then scrape the warmed egg yolks into the saucepan.\nStir the mixture constantly with a heatproof spatula over medium heat, scraping the bottom as you stir, until the mixture thickens and coats the spatula. Pour the custard through the strainer and stir it into the cream. Press on the coffee beans in the strainer to extract as much of the coffee flavor as possible, then discard the beans. Mix in the vanilla and the finely ground coffee and stir over an ice bath until cool.\nChill the mixture thoroughly in the refrigerator, then freeze it in your ice cream maker according to the manufacturer's instructions.\nNote: I'm frequently asked about reusing the coffee beans for another purpose. When I make a cup of coffee, I never reuse the grounds because the flavor has been extracted from them. Similarly, with this ice cream, the flavor of the coffee beans is in the custard, so I put the used coffee beans in my compost bucket.\nPerfect pairing: Make Coffee Ice Cream Brownie Sundaes by topping brownies with scoops of Coffee Ice Cream, then spooning Mocha Sauce over the top, and finishing with a final flourish of French Almonds.",
   "ingredients": [
    {"group_label": null, "name": "1 1/2 cups (375ml) whole milk", "required": true},
    {"group_label": null, "name": "3/4 cup (150g) sugar", "required": true},
    {"group_label": null, "name": "1 1/2 cups (125g) whole, dark-roasted coffee beans", "required": true},
    {"group_label": null, "name": "Pinch of kosher or sea salt", "required": true},
    {"group_label": null, "name": "1 1/2 cups (375ml) heavy cream", "required": true},
    {"group_label": null, "name": "5 large egg yolks", "required": true},
    {"group_label": null, "name": "1/4 teaspoon pure vanilla extract", "required": true},
    {"group_label": null, "name": "1/4 teaspoon finely ground coffee", "required": true}
   ]},
  {"title": "Chocolate Ice Cream", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "Warm 1 cup (250ml) of the cream with the cocoa powder in a medium saucepan, whisking to thoroughly blend the cocoa. Bring to a boil, then lower the heat and simmer for 30 seconds, whisking constantly.\nRemove from the heat and add the chocolate, stirring until smooth. Stir in the remaining 1 cup (250ml) cream. Pour the mixture into a large bowl, scraping the saucepan as thoroughly as possible, and set a mesh strainer on top of the bowl.\nWarm the milk, sugar, and salt in the same saucepan.\nIn a separate medium bowl, whisk together the egg yolks. Slowly pour the warm milk into the egg yolks, whisking constantly, then scrape the warmed egg yolks into the saucepan. Stir the mixture constantly with a heatproof spatula over medium heat, scraping the bottom as you stir, until the mixture thickens and coats the spatula.\nPour the custard through the strainer and stir it into the chocolate mixture until smooth, add the vanilla, and stir over an ice bath until cool.\nChill the mixture thoroughly in the refrigerator, then freeze it in your ice cream maker according to the manufacturer's instructions. (If the cold mixture is too thick to pour into your machine, whisk it vigorously to thin it out.)\nVariation: To make Rocky Road Ice Cream, fold in 1 1/2 cups (90g) homemade (or miniature store-bought) Marshmallows and 1 cup (150g) roasted peanuts or toasted, coarsely chopped almonds.\nPerfect pairings: To make Chocolate-Mint Ice Cream, stir 1/8 teaspoon mint oil or extract into the custard before freezing, then fold in one recipe of homemade Peppermint Patties or 2 cups (250g) crumbled store-bought peppermint patties into the just-churned ice cream.",
   "ingredients": [
    {"group_label": null, "name": "2 cups (500ml) heavy cream", "required": true},
    {"group_label": null, "name": "3 tablespoons unsweetened Dutch-process cocoa powder", "required": true},
    {"group_label": null, "name": "5 ounces (140g) bittersweet or semisweet chocolate, chopped", "required": true},
    {"group_label": null, "name": "1 cup (250ml) whole milk", "required": true},
    {"group_label": null, "name": "3/4 cup (150g) sugar", "required": true},
    {"group_label": null, "name": "Pinch of kosher or sea salt", "required": true},
    {"group_label": null, "name": "5 large egg yolks", "required": true},
    {"group_label": null, "name": "1/2 teaspoon pure vanilla extract", "required": true}
   ]},
  {"title": "Vanilla Ice Cream", "cuisine": "Desserts", "subcategory": "Ice Cream & Sorbets",
   "instructions": "Warm the milk, sugar, 1 cup (250ml) of the cream, and the salt in a medium saucepan. Scrape the seeds from the vanilla bean into the warm milk and add the bean as well. Cover, remove from the heat, and let steep at room temperature for 30 minutes.\nPour the remaining 1 cup (250ml) cream into a large bowl and set a mesh strainer on top. In a separate medium bowl, whisk together the egg yolks. Slowly pour the warm mixture into the egg yolks, whisking constantly, then scrape the warmed egg yolks into the saucepan. Stir the mixture constantly with a heatproof spatula over medium heat, scraping the bottom as you stir, until the mixture thickens and coats the spatula.\nPour the custard through the strainer and stir it into the cream. Put the vanilla bean into the custard, add the vanilla extract, and stir over an ice bath until cool.\nChill the mixture thoroughly in the refrigerator. When ready to churn, remove the vanilla bean, rinsing and reserving it for another use, and then freeze the mixture in your ice cream maker according to the manufacturer's instructions.\nTip: I use two kinds of vanilla in mine; the bean lends rich, deep vanilla notes and the vanilla extract rounds out, and further deepens, the flavor.\nPerfect pairings: Make Chocolate Chip Ice Cream by drizzling in one recipe of dark chocolate Stracciatella.\nPerfect pairings: To make Bourbon and Spiced Pecan Ice Cream, stir 3 tablespoons (45ml) bourbon (I like Jack Daniel's or Four Roses) into the custard just before freezing, then mix in one recipe coarsely chopped Spiced Pecans just after churning the ice cream.",
   "ingredients": [
    {"group_label": null, "name": "1 cup (250ml) whole milk", "required": true},
    {"group_label": null, "name": "3/4 cup (150g) sugar", "required": true},
    {"group_label": null, "name": "2 cups (500ml) heavy cream", "required": true},
    {"group_label": null, "name": "Pinch of kosher or sea salt", "required": true},
    {"group_label": null, "name": "1 vanilla bean, split in half lengthwise", "required": true},
    {"group_label": null, "name": "6 large egg yolks", "required": true},
    {"group_label": null, "name": "3/4 teaspoon pure vanilla extract", "required": true}
   ]}
]
$recipes$::jsonb)
  loop
    continue when exists (select 1 from public.recipes where title = r ->> 'title');

    insert into public.recipes (title, instructions, cuisine, subcategory, source_url)
    values (r ->> 'title', r ->> 'instructions', r ->> 'cuisine', r ->> 'subcategory',
            'The Perfect Scoop by David Lebovitz')
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
