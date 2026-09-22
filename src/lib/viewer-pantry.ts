import type { SupabaseClient } from "@supabase/supabase-js"

import { BASE_STAPLES } from "@/lib/pantry"
import { viewerIsAdmin } from "@/lib/recipe-browse"
import type { Database } from "@/lib/supabase/database.types"

export type ViewerPantry = {
  /** Everything the viewer counts as already having. */
  items: string[]
  /** True when the saved pantry contributed, i.e. the viewer is the admin. */
  usedPantry: boolean
  /** Saved items only, for the "using your pantry — N items" line. */
  pantryCount: number
}

/**
 * What the person looking at the page already has in.
 *
 * One definition, used by both "What can I make?" and the recipe page's
 * "Can I cook this?" toggle, so the two can never disagree about whether you
 * have the butter.
 *
 * Whether the saved pantry applies is decided HERE, from the session, never
 * from an argument — a public visitor cannot ask for the admin's pantry, and
 * RLS would refuse them anyway, since pantry_items grants anon nothing.
 *
 * Base staples count for everybody. That is what the Base category was created
 * for: nobody lists salt and water when asked what they have in, so a visitor
 * who has typed nothing still gets a truthful answer rather than a page
 * claiming they own no water.
 */
export async function viewerPantry(
  supabase: SupabaseClient<Database>,
): Promise<ViewerPantry> {
  const { data: auth } = await supabase.auth.getUser()
  const isAdmin = viewerIsAdmin(auth.user?.email)

  const { data } = isAdmin
    ? await supabase.from("pantry_items").select("name")
    : { data: null }

  const saved = (data ?? []).map((row) => row.name)

  return {
    items: [...saved, ...BASE_STAPLES],
    usedPantry: isAdmin,
    pantryCount: saved.length,
  }
}
