/**
 * Why each recipe is on the vegan menu, and what to change to make it vegan.
 *
 * Recipes are keyed by title, which is unique. The recipe data itself is left
 * as the cook wrote it: a swap is matched against each ingredient line and
 * shown next to it as "(vegan: ...)" on the recipe card, never saved over it.
 * If a recipe is renamed, its entry here stops matching until updated.
 *
 * kind:
 * - "written": vegan exactly as the recipe is written.
 * - "option":  the recipe already offers a vegan choice (oil for butter).
 * - "swap":    vegan once the listed ingredients are swapped.
 */

export type VeganSwap = {
  /** Case-insensitive pattern tested against each ingredient line. */
  match: string
  /** Shown as "(vegan: ...)" beside the matching ingredient. */
  swap: string
}

export type VeganEntry = {
  title: string
  kind: "written" | "option" | "swap"
  /** Replaces the default reason shown on the recipe card and menu. */
  note?: string
  swaps?: VeganSwap[]
}

const written = (title: string): VeganEntry => ({ title, kind: "written" })

const VB = "swap with vegan butter"
const VP = "swap with vegan parmesan (or nutritional yeast)"
const CC = "swap with cashew cream (or coconut cream)"
const VS = "swap with vegetable stock"
const BUTTER_OR_OIL = "swap with vegan butter (or olive oil)"
const SYRUP = "swap with maple syrup (or agave)"

export const veganEntries: VeganEntry[] = [
  // Vegan exactly as written.
  written("Baba Ganoush"),
  written("Baguettes"),
  written("Bang Bang Mien"),
  written("Cheesy Roasted Cabbage and Breadcrumbs"),
  written("Chinese Style Garlic Eggplant"),
  written("Cobb Salad"),
  written("Creamy Coconut Cucumber Salad"),
  written("Crushed Tomato Sauce"),
  written("Cucumber Salad"),
  written("Deviled Chickpea Bites"),
  written("Dutch Oven Artisan Loaf"),
  written("Focaccia Muffins"),
  written("Garlic Smashed Potatoes"),
  written("Green Superfood Smoothie"),
  written("Ina Garten Panzanella Salad"),
  written("No-Knead Bread in a Pot (The Lahey Method)"),
  written("Pineapple Cucumber Smoothie"),
  written("Pizza Dough"),
  written("Roasted Tomatillo Salsa (Salsa Verde)"),
  written("Rose Water Syrup (Sharbat-e Gol-e Mohammadi)"),
  written("Salt and Pepper Tofu"),
  written("Scott Conant’s Pasta Pomodoro"),
  written("Sourdough"),
  written("Sourdough Crumpets"),
  written("Taco Seasoning"),
  written("Vegan Zucchini Gratin"),
  written("Vinegar and Mint Syrup (Sharbat-e Sekanjebin)"),
  written("Watermelon and Chocolate Chip Sorbet"),
  written("Watermelon Sorbetto"),

  // The recipe already lists a vegan choice; the menu just picks it.
  {
    title: "Barbari Bread (Nan-e Barbari)",
    kind: "option",
    note: "Vegan when you use oil instead of butter.",
    swaps: [{ match: "oil or butter", swap: "use the oil, not the butter" }],
  },
  {
    title: "Brown Sugar Glazed Carrots",
    kind: "option",
    note: "Vegan when you use olive oil instead of butter.",
    swaps: [{ match: "butter", swap: "use the olive oil, not the butter" }],
  },
  {
    title: "Saffron Pudding (Sholeh Zard)",
    kind: "option",
    note: "Vegan when you use oil instead of butter.",
    swaps: [{ match: "oil or unsalted butter", swap: "use the oil, not the butter" }],
  },
  {
    title: "Jeweled Rice (Javaher Polow)",
    kind: "option",
    note: "Vegan when you use oil instead of butter or ghee.",
    swaps: [{ match: "oil, butter, or ghee", swap: "use the oil, not the butter or ghee" }],
  },
  {
    title: "Saffron-Flavored Steamed Rice with Golden Crust (Chelow)",
    kind: "option",
    note: "Vegan when you use oil instead of butter or ghee, and plant-based yogurt.",
    swaps: [
      { match: "oil, melted butter, or ghee", swap: "use the oil, not the butter or ghee" },
      { match: "yogurt", swap: "swap with plain unsweetened plant-based yogurt" },
    ],
  },
  {
    title: "Black Rice",
    kind: "option",
    note: "Vegan when you cook it in water instead of broth.",
    swaps: [{ match: "water or broth", swap: "use the water, not the broth" }],
  },
  {
    title: "Pearl Couscous Salad",
    kind: "option",
    note: "Vegan when you use vegetable broth, not chicken broth.",
    swaps: [{ match: "vegetable or chicken broth", swap: "use the vegetable broth" }],
  },
  {
    title: "Paradise Custard (Yakh dar Behesht)",
    kind: "option",
    note: "Vegan when you use almond milk instead of milk.",
    swaps: [{ match: "milk or almond milk", swap: "use the almond milk" }],
  },
  {
    title: "Chinese Stir Fry Sauce",
    kind: "option",
    note: "Vegan when you choose the vegetable stock and vegetarian oyster sauce the recipe lists.",
    swaps: [
      { match: "chicken stock", swap: "use the vegetable or mushroom stock" },
      { match: "oyster sauce", swap: "use the vegetarian oyster sauce" },
    ],
  },

  // Vegan after swapping dairy, egg, honey or meat.
  {
    title: "Mashed Potatoes",
    kind: "swap",
    swaps: [
      { match: "butter", swap: VB },
      { match: "milk", swap: "swap with unsweetened plant milk (oat or soy)" },
    ],
  },
  {
    title: "Super Green Salad",
    kind: "swap",
    swaps: [{ match: "manchego", swap: "swap with shaved vegan hard cheese (or leave it out)" }],
  },
  { title: "Pesto Genovese", kind: "swap", swaps: [{ match: "parmesan", swap: VP }] },
  { title: "Pizza Rosa", kind: "swap", swaps: [{ match: "parmigiano", swap: VP }] },
  { title: "Tomato Tartine", kind: "swap", swaps: [{ match: "parmesan", swap: VP }] },
  {
    title: "Parmesan Peas",
    kind: "swap",
    swaps: [
      { match: "butter", swap: VB },
      { match: "parmesan", swap: VP },
    ],
  },
  {
    title: "Burst Cherry Tomato Pasta",
    kind: "swap",
    swaps: [
      { match: "parmesan", swap: VP },
      { match: "butter", swap: BUTTER_OR_OIL },
    ],
  },
  {
    title: "Oven Polenta with Roasted Mushrooms and Thyme",
    kind: "swap",
    swaps: [
      { match: "butter", swap: "swap with olive oil (or vegan butter)" },
      { match: "parmesan", swap: VP },
    ],
  },
  {
    title: "Pizza Margherita",
    kind: "swap",
    swaps: [
      { match: "mozzarella", swap: "swap with vegan mozzarella" },
      { match: "parmigiano", swap: "swap with vegan parmesan (or leave it out)" },
    ],
  },
  {
    title: "NYT Panzanella Salad",
    kind: "swap",
    swaps: [{ match: "mozzarella", swap: "swap with vegan mozzarella (or white beans)" }],
  },
  {
    title: "Fettuccine Alfredo",
    kind: "swap",
    swaps: [
      { match: "butter", swap: VB },
      { match: "cream", swap: CC },
      { match: "parmigiano", swap: VP },
    ],
  },
  {
    title: "Spaghetti Alla Nerano",
    kind: "swap",
    swaps: [
      { match: "butter", swap: VB },
      { match: "pecorino", swap: VP },
      { match: "parmigiano", swap: VP },
    ],
  },
  {
    title: "Creamy Mushroom and Leak Pasta",
    kind: "swap",
    swaps: [
      { match: "chicken broth", swap: VS },
      { match: "cream", swap: CC },
      { match: "parmesan", swap: VP },
    ],
  },
  {
    title: "Creamy Kale And Caramelized Onion Pasta",
    kind: "swap",
    swaps: [
      { match: "egg noodles", swap: "swap with egg-free dried pasta" },
      { match: "parmesan", swap: VP },
      { match: "cream", swap: CC },
    ],
  },
  {
    title: "Creamy Mushroom Soup",
    kind: "swap",
    swaps: [
      { match: "butter", swap: BUTTER_OR_OIL },
      { match: "chicken broth", swap: VS },
      { match: "cream", swap: CC },
    ],
  },
  {
    title: "Cream of Tomato Soup",
    kind: "swap",
    swaps: [
      { match: "butter", swap: BUTTER_OR_OIL },
      { match: "stock", swap: "use vegetable stock, not chicken" },
      { match: "cream", swap: CC },
    ],
  },
  {
    title: "Cauliflower Soup",
    kind: "swap",
    swaps: [{ match: "butter", swap: BUTTER_OR_OIL }],
  },
  {
    title: "Creamy White Bean Soup with Herb Oil and Crispy Capers",
    kind: "swap",
    swaps: [
      { match: "parmesan", swap: VP },
      { match: "chicken broth", swap: VS },
      { match: "butter", swap: VB },
    ],
  },
  {
    title: "Instant Pot Mushroom Risotto",
    kind: "swap",
    swaps: [
      { match: "butter", swap: VB },
      { match: "chicken broth", swap: VS },
      { match: "parmesan", swap: VP },
    ],
  },
  {
    title: "Roasted Brussels Sprouts with Gochujang Brown Butter",
    kind: "swap",
    swaps: [{ match: "butter", swap: VB }],
  },
  {
    title: "Soy Butter Glazed King Oyster Mushrooms",
    kind: "swap",
    swaps: [
      { match: "butter", swap: VB },
      { match: "honey", swap: SYRUP },
    ],
  },
  {
    title: "Buffalo Cauliflower Bites",
    kind: "swap",
    swaps: [
      { match: "milk", swap: "use the milk alternative (unsweetened plant milk)" },
      { match: "honey", swap: SYRUP },
    ],
  },
  {
    title: "Sweet Cucumber Salad",
    kind: "swap",
    swaps: [{ match: "honey", swap: SYRUP }],
  },
  {
    title: "Elote",
    kind: "swap",
    swaps: [
      { match: "mayonnaise", swap: "swap with vegan mayonnaise" },
      { match: "cotija", swap: "swap with crumbled vegan feta (or leave it out)" },
    ],
  },
  {
    title: "Cold Peanut Sesame Noodles",
    kind: "swap",
    swaps: [{ match: "egg noodles", swap: "swap with egg-free wheat noodles" }],
  },
  {
    title: "Dolsot Bibimbap",
    kind: "swap",
    swaps: [{ match: "\\beggs?\\b", swap: "swap with pan-fried tofu (or leave them out)" }],
  },
  {
    title: "Asian Fusion Spicy Garlic Noodles",
    kind: "swap",
    swaps: [
      { match: "butter", swap: VB },
      { match: "oyster sauce", swap: "swap with vegetarian mushroom oyster sauce" },
      { match: "parmesan", swap: VP },
    ],
  },
  {
    title: "Honey Almond Brittle (Sohan Asal)",
    kind: "swap",
    swaps: [{ match: "honey", swap: "swap with agave syrup (or maple syrup)" }],
  },
  {
    title: "Savory Meat and Mushroom Hand Pies",
    kind: "swap",
    note: "Vegan when you swap the ground beef for Impossible beef, use vegetable stock, and brush with plant milk.",
    swaps: [
      { match: "ground beef", swap: "swap with Impossible beef (plant-based ground beef)" },
      { match: "stock", swap: VS },
      { match: "egg", swap: "swap with plant milk for the wash" },
    ],
  },
  {
    title: "Japanese Soboro Beef",
    kind: "swap",
    swaps: [{ match: "ground beef", swap: "swap with plant-based ground beef" }],
  },
]

const byTitle = new Map(veganEntries.map((entry) => [entry.title, entry]))

export const veganTitles = veganEntries.map((entry) => entry.title)

export function veganEntryFor(title: string): VeganEntry | undefined {
  return byTitle.get(title)
}

/** The sentence shown on the recipe card and under the title on the menu. */
export function veganReason(entry: VeganEntry): string {
  if (entry.note) return entry.note
  if (entry.kind === "written") return "Vegan as written: no meat, dairy, eggs or honey."
  const swaps = (entry.swaps ?? []).map((s) => s.swap.replace(/^(swap with|use) /, ""))
  return `Vegan with these swaps: ${swaps.join("; ")}.`
}

/** The vegan swap for one ingredient line, or null when none applies. */
export function veganSwapFor(
  entry: VeganEntry | undefined,
  ingredientName: string,
): string | null {
  if (!entry?.swaps) return null
  const hit = entry.swaps.find((s) => new RegExp(s.match, "i").test(ingredientName))
  return hit ? hit.swap : null
}
