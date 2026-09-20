"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth"
import { type DraftRecipe, ingredientsPayload } from "@/lib/recipes"
import { createClient } from "@/lib/supabase/server"

export type SaveRecipeResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

/**
 * Saves a recipe and its ingredients in one transaction via the save_recipe
 * function. See the migration for why this cannot be done from the client:
 * PostgREST has no multi-call transaction, so a failed ingredient insert on an
 * edit would leave the recipe with none at all.
 *
 * requireAdmin() runs first because a Server Action is a public POST endpoint —
 * the page guard does not cover it.
 */
export async function saveRecipe(draft: DraftRecipe): Promise<SaveRecipeResult> {
  await requireAdmin()

  const title = draft.title.trim()
  const ingredients = ingredientsPayload(draft.ingredients)

  // Checked here as well as in the function so the admin gets a sentence rather
  // than a Postgres exception. The function keeps its own checks because it is
  // reachable independently of this form.
  if (!title) {
    return { ok: false, error: "Give the recipe a title." }
  }

  if (ingredients.length === 0) {
    return { ok: false, error: "Add at least one ingredient." }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.rpc("save_recipe", {
    // The type generator renders every function argument as non-nullable, but
    // p_id is `uuid` with no NOT NULL — passing null is how a new recipe is
    // created. The cast is a limitation of the generator, not of the call.
    p_id: draft.id as string,
    p_title: title,
    p_instructions: draft.instructions.trim(),
    p_cuisine: draft.cuisine as string,
    p_needs_review: draft.needsReview,
    p_ingredients: ingredients,
  })

  if (error) {
    // 23503 is foreign_key_violation — in practice always the cuisine, since it
    // is the only FK a recipe carries that the form can get wrong.
    if (error.code === "23503") {
      return {
        ok: false,
        error: `"${draft.cuisine}" is not a cuisine yet. Pick Other to add it.`,
      }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath("/admin/recipes")
  revalidatePath("/recipes")

  return { ok: true, id: data as string }
}

/** Adds a cuisine chosen through the form's "Other" option. */
export async function addCuisine(name: string): Promise<SaveRecipeResult> {
  await requireAdmin()

  const trimmed = name.trim()
  if (!trimmed) {
    return { ok: false, error: "Give the cuisine a name." }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("cuisines").insert({ name: trimmed })

  // 23505 means it already exists, which for "add this cuisine" is the desired
  // end state rather than a failure.
  if (error && error.code !== "23505") {
    return { ok: false, error: error.message }
  }

  revalidatePath("/admin/recipes")
  return { ok: true, id: trimmed }
}
