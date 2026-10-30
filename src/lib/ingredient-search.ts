import type { IngredientRow } from "@/lib/ingredients"
import { normalizeIngredient } from "@/lib/matching"

/**
 * Ingredient search for the recipe list pages.
 *
 * Reuses normalizeIngredient so "2 cups chopped Onions (about 1 lb)" and a
 * visitor typing "onions" meet in the same form, then compares word by word:
 *
 * - every typed word must match a word in the ingredient, so "chicken" finds
 *   "chicken thighs" and "chicken stock" (a typed phrase is a subset test, not
 *   an equality test)
 * - a word matches on equal stems, which folds plurals the crude singulariser
 *   misses (tomatoes, berries), or within one typo for words of five letters or
 *   more ("tomatto", "cinamon")
 *
 * Results come in two tiers. `matches` holds recipes where every typed word
 * was found. `related` holds recipes that matched only some of a multi-word
 * search ("chicken thighs" also surfaces chicken breast dishes), shown apart so
 * a near miss never reads as a hit.
 */

/** Words that say nothing about which ingredient is meant. */
const FILLER = new Set(["fresh", "the", "a", "an", "and", "or", "with", "of", "for"])

function stem(token: string): string {
  if (token.length > 4 && token.endsWith("ie")) return `${token.slice(0, -2)}y`
  if (token.length > 4 && token.endsWith("oe")) return token.slice(0, -1)
  if (token.length > 4 && /(ch|sh|x|z|s)e$/.test(token)) return token.slice(0, -1)
  return token
}

/** True when two strings differ by at most one insertion, deletion or swap-in-place. */
function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true
  if (Math.abs(a.length - b.length) > 1) return false

  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++

  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1)
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a]
  return shorter.slice(i) === longer.slice(i + 1)
}

function wordsMatch(typed: string, word: string): boolean {
  const a = stem(typed)
  const b = stem(word)
  if (a === b) return true
  return a.length >= 5 && b.length >= 5 && withinOneEdit(a, b)
}

function toWords(text: string): string[] {
  return normalizeIngredient(text)
    .split(/[\s,/]+/)
    .filter((word) => word !== "" && !FILLER.has(word))
}

export type IngredientSearchResult<T> = {
  /** The cleaned words that were actually searched for. */
  terms: string[]
  matches: T[]
  related: T[]
}

export function searchRecipesByIngredient<T extends { id: string }>(
  query: string,
  recipes: T[],
  ingredients: IngredientRow[],
): IngredientSearchResult<T> {
  const terms = toWords(query)
  if (terms.length === 0) return { terms, matches: [], related: [] }

  const wordsByRecipe = new Map<string, string[][]>()
  for (const row of ingredients) {
    const words = toWords(row.name)
    if (words.length === 0) continue
    const list = wordsByRecipe.get(row.recipe_id) ?? []
    list.push(words)
    wordsByRecipe.set(row.recipe_id, list)
  }

  const matches: T[] = []
  const related: T[] = []

  for (const recipe of recipes) {
    const lines = wordsByRecipe.get(recipe.id) ?? []

    const fullHit = lines.some((words) =>
      terms.every((term) => words.some((word) => wordsMatch(term, word))),
    )
    if (fullHit) {
      matches.push(recipe)
      continue
    }

    // Partial matches only make sense for multi-word searches; for one word the
    // full test already was the partial test.
    if (terms.length > 1) {
      const partial = lines.some((words) =>
        terms.some((term) => words.some((word) => wordsMatch(term, word))),
      )
      if (partial) related.push(recipe)
    }
  }

  return { terms, matches, related }
}
