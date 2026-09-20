"use server"

import { fetchAllIngredients } from "@/lib/ingredients"
import { matchRecipes } from "@/lib/matching"
import { BASE_STAPLES } from "@/lib/pantry"
import { viewerIsAdmin } from "@/lib/recipe-browse"
import { createClient } from "@/lib/supabase/server"

export type MatchResult = {
  id: string
  title: string
  cuisine: string | null
  missing: string[]
  totalRequired: number
}

export type FindRecipesResult = {
  /** Every required ingredient on hand — the spec's rule, and the headline answer. */
  exact: MatchResult[]
  /** Near misses, so a page with 4 exact matches is still worth reading. */
  missingOne: MatchResult[]
  missingTwo: MatchResult[]
  usedPantry: boolean
  pantryCount: number
}

/**
 * Deliberately PUBLIC — no requireAdmin(), same as the browse page's loader.
 * Anyone can use this page without an account; that is the whole point of it.
 *
 * Whether the saved pantry applies is decided HERE, from the session, never
 * from an argument. A public visitor cannot ask for the admin's pantry, and
 * RLS would refuse them anyway — pantry_items grants anon nothing.
 */
export async function findRecipes(typed: string[]): Promise<FindRecipesResult> {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const isAdmin = viewerIsAdmin(auth.user?.email)

  const [recipesResult, ingredientRows, pantryResult] = await Promise.all([
    supabase.from("recipes").select("id, title, cuisine").order("title"),
    fetchAllIngredients(supabase),
    isAdmin
      ? supabase.from("pantry_items").select("name")
      : Promise.resolve({ data: null }),
  ])

  const pantryNames = (pantryResult.data ?? []).map((row) => row.name)

  // Base staples count as on hand in both modes. That is what the "Base"
  // category was created for in Section 2 — nobody lists salt and water when
  // asked what they have in.
  const onHand = [
    ...typed.map((entry) => entry.trim()).filter(Boolean),
    ...pantryNames,
    ...BASE_STAPLES,
  ]

  const byRecipe = new Map<string, Array<{ name: string; required: boolean }>>()
  for (const row of ingredientRows) {
    const list = byRecipe.get(row.recipe_id) ?? []
    list.push({ name: row.name, required: row.required })
    byRecipe.set(row.recipe_id, list)
  }

  const matched = matchRecipes(
    (recipesResult.data ?? []).map((recipe) => ({
      recipe,
      ingredients: byRecipe.get(recipe.id) ?? [],
    })),
    onHand,
  )

  const toResult = (entry: (typeof matched)[number]): MatchResult => ({
    id: entry.recipe.id,
    title: entry.recipe.title,
    cuisine: entry.recipe.cuisine,
    missing: entry.missing,
    totalRequired: (byRecipe.get(entry.recipe.id) ?? []).filter((i) => i.required)
      .length,
  })

  // A recipe with no *required* ingredients is not something you "can make" —
  // it trivially has nothing missing and would top the list. The import stubs
  // are exactly this: their only ingredient is the optional "TODO — add
  // ingredients" placeholder, which is why counting total ingredients rather
  // than required ones put Coffee at the top of "you can make these now".
  const usable = matched.filter(
    (entry) =>
      (byRecipe.get(entry.recipe.id) ?? []).filter((i) => i.required).length > 0,
  )

  return {
    exact: usable.filter((e) => e.missing.length === 0).map(toResult),
    missingOne: usable.filter((e) => e.missing.length === 1).map(toResult),
    missingTwo: usable.filter((e) => e.missing.length === 2).map(toResult),
    usedPantry: isAdmin,
    pantryCount: pantryNames.length,
  }
}
