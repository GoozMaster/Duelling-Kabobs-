import { isAdmin } from "@/lib/auth"
import type { Recipe } from "@/lib/recipes"

/**
 * Shared vocabulary for the public browse page.
 *
 * This is a plain module, not the Server Action file, because a "use server"
 * module may only export async functions — a constant or a sync helper there
 * makes Next.js refuse to load the file at all, and neither typecheck nor lint
 * catches it.
 */

export const PAGE_SIZE = 24

export type RecipeCard = Pick<Recipe, "id" | "title" | "cuisine" | "needs_review">

export type RecipePage = {
  recipes: RecipeCard[]
  /** False once a short page comes back, so the grid can stop asking. */
  hasMore: boolean
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
