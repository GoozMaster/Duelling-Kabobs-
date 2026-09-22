"use server"

import { fetchAllIngredients } from "@/lib/ingredients"
import { isOnHand, markIngredients, normalizePantry } from "@/lib/matching"
import { createClient } from "@/lib/supabase/server"
import { viewerPantry } from "@/lib/viewer-pantry"

export type MatchResult = {
  id: string
  title: string
  cuisine: string | null
  /** Required ingredients already covered. */
  have: number
  totalRequired: number
  /** Named, because "missing 2" sends you back to the recipe to find out which. */
  missing: string[]
  /** How many of the things the visitor typed this recipe actually uses. */
  uses: number
}

export type FindRecipesResult = {
  /** Ranked, best first. */
  recipes: MatchResult[]
  usedPantry: boolean
  pantryCount: number
}

/** Enough to scroll through without shipping all 126 and their missing lists. */
const LIMIT = 36

/**
 * Deliberately PUBLIC — no requireAdmin(), same as the browse page's loader.
 * Anyone can use this page without an account; that is the whole point of it.
 */
export async function findRecipes(typed: string[]): Promise<FindRecipesResult> {
  const supabase = await createClient()

  const [recipesResult, ingredientRows, pantry] = await Promise.all([
    supabase.from("recipes").select("id, title, cuisine").order("title"),
    fetchAllIngredients(supabase),
    viewerPantry(supabase),
  ])

  const entered = typed.map((entry) => entry.trim()).filter(Boolean)
  const onHand = [...entered, ...pantry.items]
  const enteredNormalized = normalizePantry(entered)

  const byRecipe = new Map<string, Array<{ name: string; required: boolean }>>()
  for (const row of ingredientRows) {
    const list = byRecipe.get(row.recipe_id) ?? []
    list.push({ name: row.name, required: row.required })
    byRecipe.set(row.recipe_id, list)
  }

  const ranked = (recipesResult.data ?? [])
    .flatMap((recipe) => {
      const required = (byRecipe.get(recipe.id) ?? []).filter((i) => i.required)

      // A recipe with no *required* ingredients is not something you "can
      // make" — it trivially has nothing missing and would top the list. The
      // import stubs are exactly this: their only ingredient is the optional
      // "TODO — add ingredients" placeholder.
      if (required.length === 0) return []

      const marked = markIngredients(required, onHand)
      const have = marked.filter((item) => item.onHand).length

      return [
        {
          id: recipe.id,
          title: recipe.title,
          cuisine: recipe.cuisine,
          have,
          totalRequired: required.length,
          missing: marked.filter((item) => !item.onHand).map((item) => item.name),
          uses: enteredNormalized.filter((entry) =>
            required.some((item) => isOnHand(item.name, [entry])),
          ).length,
        },
      ]
    })
    /*
     * Relevance first, completeness second.
     *
     * Ranking on completeness alone looked right and was useless: the recipes
     * nearest to finished are the four-ingredient ones that base staples
     * already cover, so Mashed Potatoes and Black Rice sat at the top of the
     * page no matter what anybody typed — which is exactly how this feature
     * came to look broken. Counting how many of your own ingredients a recipe
     * uses puts chocolate recipes at the top when you type chocolate.
     *
     * With nothing typed every recipe scores zero uses and this falls back to
     * pure completeness, which is the right answer for an empty page.
     */
    .sort(
      (a, b) =>
        b.uses - a.uses ||
        b.have / b.totalRequired - a.have / a.totalRequired ||
        a.totalRequired - b.totalRequired,
    )
    .slice(0, LIMIT)

  return {
    recipes: ranked,
    usedPantry: pantry.usedPantry,
    pantryCount: pantry.pantryCount,
  }
}
