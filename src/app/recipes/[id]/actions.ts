"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export type RecipeActionResult = { error: string | null }

/**
 * Both actions call requireAdmin() themselves. A Server Action compiles to a
 * real POST endpoint that anyone holding its id can invoke without rendering
 * the page, so the page's own admin check does not cover them. RLS refuses the
 * write regardless; this turns an opaque database error into a redirect.
 */

export async function markReviewed(id: string): Promise<RecipeActionResult> {
  await requireAdmin()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recipes")
    .update({ needs_review: false })
    .eq("id", id)
    .select("id")

  if (error) return { error: error.message }
  if (!data || data.length === 0) return { error: "That recipe no longer exists." }

  revalidatePath(`/recipes/${id}`)
  revalidatePath("/recipes")
  return { error: null }
}

/**
 * Deleting a recipe cascades to its ingredients — up to 29 rows — and there is
 * no undo anywhere in this app.
 *
 * The .select("id") is not decoration. Under RLS a DELETE matching no visible
 * row SUCCEEDS with zero rows affected: Postgres filters first, then deletes
 * nothing, and returns success. Without asking which rows came back, "deleted"
 * and "silently did nothing" are indistinguishable, and this action would
 * redirect to the listing announcing a deletion that never happened.
 */
export async function deleteRecipe(id: string): Promise<RecipeActionResult> {
  await requireAdmin()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .select("id")

  if (error) return { error: error.message }
  if (!data || data.length === 0) {
    return { error: "That recipe was already gone." }
  }

  revalidatePath("/recipes")
  revalidatePath("/")
  redirect("/recipes")
}
