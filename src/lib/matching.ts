/**
 * Ingredient matching — the shared utility behind "What can I make?".
 *
 * The spec requires one implementation used by both the public and admin
 * flows, so everything here is pure and takes its data as arguments.
 */

/**
 * The qualifier list exactly as the spec gives it. Kept verbatim and separate
 * from the additions below, so the deviation stays visible.
 */
const SPEC_QUALIFIERS = [
  "boneless", "skinless", "skin-on", "fresh", "frozen", "dried", "ground",
  "chopped", "diced", "minced", "sliced", "shredded", "grated", "crushed",
  "whole", "large", "medium", "small", "extra-large", "low-sodium",
  "unsalted", "salted", "raw", "cooked", "ripe", "fine", "coarse", "packed",
]

/**
 * Additions the spec does not list, without which this feature matches nothing.
 *
 * The spec's list assumes names like "boneless skinless chicken thighs". The
 * real data is "1/2 cup low sodium soy sauce (see notes for alternatives)" —
 * 1,248 of 1,420 names begin with a number. Stripping only adjectives leaves
 * the quantity, unit, parenthetical and trailing prep clause, none of which can
 * ever equal a pantry entry.
 *
 * "low sodium" appears unhyphenated in the data, so both spellings are handled.
 */
const UNIT_WORDS = [
  "cup", "cups", "tbsp", "tbsps", "tsp", "tsps", "tablespoon", "tablespoons",
  "teaspoon", "teaspoons", "oz", "ounce", "ounces", "lb", "lbs", "pound",
  "pounds", "gram", "grams", "kg", "ml", "litre", "liter", "quart", "quarts",
  "pint", "pints", "pinch", "dash", "bunch", "bunches", "clove", "cloves",
  "stalk", "stalks", "can", "cans", "jar", "jars", "package", "packages",
  "handful", "handfuls", "sprig", "sprigs", "slice", "slices", "piece",
  "pieces", "head", "heads", "stick", "sticks", "of",
]

const STRIP_WORDS = new Set([...SPEC_QUALIFIERS, ...UNIT_WORDS])

/**
 * A token that is purely a measurement: "2", "1/2", "½", "2-3", "350g", "1c".
 *
 * Applied to every token, not just the first, because the data commonly gives
 * two units at once — "350g or 3c bread flour", "225g or 1c warm water".
 * Stripping only a leading quantity leaves "or 3c bread flour".
 */
const QUANTITY_TOKEN = /^[\d¼½¾⅓⅔⅛⅜⅝⅞][\d¼½¾⅓⅔⅛⅜⅝⅞/.,\-–—]*[a-z]{0,6}$/

/** Connectors that are noise once the quantities around them are gone. */
const EDGE_CONNECTORS = new Set(["or", "and", "&", "plus", "about", "approx"])

/**
 * Crude singulariser, applied to both sides of every comparison.
 *
 * Correctness matters less than consistency here: "molasses" becoming
 * "molasse" is harmless because the pantry entry becomes "molasse" too. What
 * matters is that a recipe asking for "1 egg" finds a pantry holding "Eggs",
 * which was a real miss before this existed.
 *
 * "ss", "us" and "is" endings are left alone so "glass", "hummus" and "anis"
 * are not mangled into something that then fails to match itself.
 */
function singularize(token: string): string {
  if (token.length <= 3) return token
  if (/(ss|us|is)$/.test(token)) return token
  return token.endsWith("s") ? token.slice(0, -1) : token
}

export function normalizeIngredient(raw: string): string {
  let text = raw.toLowerCase()

  // "(see notes for alternatives)", "(120ml)", "(minced)" — asides, never the
  // ingredient itself.
  text = text.replace(/\([^)]*\)/g, " ")

  // "4 garlic cloves, peeled and finely chopped" — everything after the first
  // comma is preparation, not identity.
  text = text.replace(/,.*$/, " ")

  text = text.replace(/\bto taste\b/g, " ")

  // Multi-word and hyphenated qualifiers have to go before tokenising, since
  // splitting on whitespace would leave "extra-large" as one unmatched token
  // and "low sodium" as two. The spec hyphenates "low-sodium"; the data does
  // not, so both spellings are handled.
  for (const phrase of ["skin-on", "extra-large", "low-sodium", "low sodium"]) {
    text = text.replace(new RegExp(`\\b${phrase}\\b`, "g"), " ")
  }

  // Hyphens become spaces so "all-purpose flour" and "all purpose flour" are
  // the same thing. The pantry writes one, recipes write the other, and before
  // this they never matched.
  text = text.replace(/[-–—]/g, " ")

  const kept = text
    .split(/\s+/)
    .map((token) => token.replace(/^[^a-z0-9&½¼¾⅓⅔⅛]+|[^a-z0-9&]+$/g, ""))
    .filter(
      (token) =>
        token !== "" && !STRIP_WORDS.has(token) && !QUANTITY_TOKEN.test(token),
    )
    .map(singularize)

  // Only at the edges: "or 3c bread flour" -> "bread flour", while the "&" in
  // "salt & pepper" is load-bearing and stays.
  while (kept.length > 0 && EDGE_CONNECTORS.has(kept[0])) kept.shift()
  while (kept.length > 0 && EDGE_CONNECTORS.has(kept[kept.length - 1])) kept.pop()

  return kept.join(" ").trim()
}

/** The last token — what the ingredient actually *is*. */
export function headNoun(normalized: string): string {
  const tokens = normalized.split(" ").filter(Boolean)
  return tokens[tokens.length - 1] ?? ""
}

function containsPhrase(haystack: string, phrase: string): boolean {
  if (!phrase) return false
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(^| )${escaped}( |$)`).test(haystack)
}

/**
 * Whether a pantry list covers one recipe ingredient.
 *
 * A pantry entry counts only when it appears as a whole-word phrase in the
 * ingredient AND covers the ingredient's head noun.
 *
 * The head-noun condition is what stops confident wrong answers. Without it,
 * "oil- or salt-packed anchovy filets" matches the pantry's Salt and the recipe
 * is reported as cookable while the anchovies are missing. Its head noun is
 * "filets", which nothing in the pantry covers, so it correctly stays missing.
 *
 * The cost is some legitimate loose matches — "red pepper flakes" no longer
 * counts as Pepper. That trade is deliberate: a missed match makes the list
 * shorter, a false match makes it wrong, and you find out in the kitchen.
 */
export function isOnHand(ingredientName: string, pantryNormalized: string[]): boolean {
  const ingredient = normalizeIngredient(ingredientName)
  if (!ingredient) return false

  // "water or broth", "oil or butter" offer alternatives: having either one is
  // enough. Without splitting, the head noun of the whole phrase is "broth",
  // and a pantry full of water reports the ingredient as missing.
  const alternatives = ingredient.split(/\s+or\s+/).filter(Boolean)

  return alternatives.some((alternative) => {
    const head = headNoun(alternative)
    return pantryNormalized.some(
      (entry) => containsPhrase(alternative, entry) && containsPhrase(entry, head),
    )
  })
}

export type MatchIngredient = {
  name: string
  required: boolean
}

export type MatchRecipe<T> = {
  recipe: T
  missing: string[]
}

/**
 * Buckets recipes by how many *required* ingredients are absent.
 *
 * Optional ingredients never disqualify a recipe, per spec — a missing garnish
 * does not stop you cooking.
 */
export function matchRecipes<T>(
  recipes: Array<{ recipe: T; ingredients: MatchIngredient[] }>,
  pantry: string[],
): MatchRecipe<T>[] {
  const pantryNormalized = pantry
    .map((entry) => normalizeIngredient(entry))
    .filter(Boolean)

  return recipes
    .map(({ recipe, ingredients }) => ({
      recipe,
      missing: ingredients
        .filter((item) => item.required && !isOnHand(item.name, pantryNormalized))
        .map((item) => item.name),
    }))
    .sort((a, b) => a.missing.length - b.missing.length)
}
