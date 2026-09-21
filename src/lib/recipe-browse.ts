import type { SupabaseClient } from "@supabase/supabase-js"

import { isAdmin } from "@/lib/auth"
import type { Recipe } from "@/lib/recipes"
import type { Database } from "@/lib/supabase/database.types"

/**
 * Shared vocabulary for the public browse page.
 *
 * This is a plain module, not the Server Action file, because a "use server"
 * module may only export async functions — a constant or a sync helper there
 * makes Next.js refuse to load the file at all, and neither typecheck nor lint
 * catches it.
 */

export const PAGE_SIZE = 24

/**
 * The columns a recipe tile needs. Named for the data, not the component —
 * <RecipeCard> in components/recipe-card.tsx renders it, and two things sharing
 * one name across a type import and a value import is a needless papercut.
 */
export type RecipeSummary = Pick<Recipe, "id" | "title" | "cuisine" | "needs_review">

export type RecipePage = {
  recipes: RecipeSummary[]
  /** False once a short page comes back, so the grid can stop asking. */
  hasMore: boolean
}

export type CuisineCount = { name: string; count: number }

/**
 * The full cuisine vocabulary with each one's recipe count, plus the total.
 *
 * Two queries rather than a group-by: PostgREST cannot express one, and the
 * vocabulary has to come from the `cuisines` table rather than from the recipes
 * so that a cuisine with nothing in it still appears. Both the filter chips and
 * the globe's tile row render a zero as "0" rather than dropping the entry, and
 * they can only do that if something tells them the entry exists.
 *
 * Takes the client instead of building one: /recipes needs the cookie-bound
 * client because it also reads auth, while the globe page uses the public one to
 * stay statically renderable. Constructing one here would force that choice on
 * every caller.
 */
export async function cuisineCounts(
  supabase: SupabaseClient<Database>,
): Promise<{ counts: CuisineCount[]; total: number }> {
  const [cuisineRows, recipeRows] = await Promise.all([
    supabase.from("cuisines").select("name").order("name"),
    supabase.from("recipes").select("cuisine"),
  ])

  const tally = new Map<string, number>()
  for (const row of recipeRows.data ?? []) {
    if (row.cuisine) tally.set(row.cuisine, (tally.get(row.cuisine) ?? 0) + 1)
  }

  return {
    counts: (cuisineRows.data ?? []).map(({ name }) => ({
      name,
      count: tally.get(name) ?? 0,
    })),
    total: recipeRows.data?.length ?? 0,
  }
}

/**
 * Admin check that cannot take a public page down.
 *
 * isAdmin() throws when ADMIN_EMAIL is missing, which is the right behaviour on
 * an admin route — fail loudly rather than silently let someone in. Here it
 * would turn a misconfigured deploy into a 500 on the one page anonymous
 * visitors are meant to see. Nobody being the admin is the safe answer.
 */
export function viewerIsAdmin(email: string | null | undefined): boolean {
  try {
    return isAdmin(email)
  } catch {
    return false
  }
}
