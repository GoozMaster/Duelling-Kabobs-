"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth"
import { isPantrySection, isStapleCategory, sectionLabel } from "@/lib/pantry"
import { createClient } from "@/lib/supabase/server"

export type PantryActionState = { error: string | null }

const PANTRY_PATH = "/admin/pantry"

const ok: PantryActionState = { error: null }

/**
 * Every action here calls requireAdmin() for itself.
 *
 * A Server Action is not a function call — Next.js compiles it into a real POST
 * endpoint with a generated id, and anyone who digs that id out of the client
 * bundle can invoke it without ever rendering the page. The guard on page.tsx
 * protects the page, not these.
 *
 * RLS is still the boundary that actually holds: the Supabase client below is
 * bound to the caller's cookies, so a stranger's write is refused by Postgres
 * regardless. Checking here turns that opaque database error into a redirect.
 */

export async function addPantryItem(input: {
  section: string
  name: string
  category: string | null
}): Promise<PantryActionState> {
  await requireAdmin()

  const { section } = input
  const name = input.name.trim()

  if (!isPantrySection(section)) {
    return { error: "That is not a pantry section." }
  }

  if (!name) {
    return { error: "Give the item a name." }
  }

  // Only staples carry a category. Rather than trusting the caller and letting
  // the CHECK constraint reject the row, normalise it here — a category arriving
  // for the fridge is a bug in the form, not something to show the admin.
  let category: string | null = null

  if (section === "staple") {
    if (!isStapleCategory(input.category)) {
      return { error: "Pick a category for this staple." }
    }
    category = input.category
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("pantry_items")
    .insert({ section, name, category })

  if (error) {
    // 23505 is unique_violation, from the unique (section, name) constraint —
    // exactly the case it was added to catch.
    if (error.code === "23505") {
      return { error: `"${name}" is already in your ${sectionLabel(section)}.` }
    }
    return { error: `Could not save that: ${error.message}` }
  }

  revalidatePath(PANTRY_PATH)
  return ok
}

export async function deletePantryItem(id: string): Promise<PantryActionState> {
  await requireAdmin()

  if (!id) {
    return { error: "Nothing to remove." }
  }

  const supabase = await createClient()

  // `select()` matters here. Under RLS a DELETE that matches no visible row
  // succeeds with zero rows affected rather than erroring, so without asking for
  // the deleted rows back there is no way to tell "removed" from "silently did
  // nothing" — the same trap the Section 0 verification turned up.
  const { data, error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", id)
    .select("id")

  if (error) {
    return { error: `Could not remove that: ${error.message}` }
  }

  if (!data || data.length === 0) {
    return { error: "That item was already gone." }
  }

  revalidatePath(PANTRY_PATH)
  return ok
}
