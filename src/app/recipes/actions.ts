"use server"

import { PAGE_SIZE, type RecipePage, viewerIsAdmin } from "@/lib/recipe-browse"
import { createClient } from "@/lib/supabase/server"

/**
 * Keyset pagination on `title` alone, which is only correct because titles are
 * unique — verified against the live data before choosing it.
 *
 * The textbook alternative is a composite (title, id) keyset, but PostgREST can
 * only express that through .or("title.gt.X,and(title.eq.X,id.gt.Y)"), whose
 * delimiters are commas and parentheses. Several titles contain parentheses —
 * "Khao Soi (Chiang Mai Noodle Soup)" — so interpolating them would not error,
 * it would parse as different logic and quietly drop rows near those titles.
 *
 * .order() and .gt() must agree on collation for a keyset to be sound. They do:
 * both use the column's own, which is what backs recipes_title_id_idx.
 */
export async function fetchRecipePage({
  cuisine,
  afterTitle,
}: {
  cuisine?: string | null
  afterTitle?: string | null
}): Promise<RecipePage> {
  const supabase = await createClient()

  let query = supabase
    .from("recipes")
    .select("id, title, cuisine, needs_review")
    .order("title")
    .limit(PAGE_SIZE)

  if (cuisine) query = query.eq("cuisine", cuisine)
  if (afterTitle) query = query.gt("title", afterTitle)

  const { data, error } = await query

  if (error) return { recipes: [], hasMore: false }

  return { recipes: data ?? [], hasMore: (data?.length ?? 0) === PAGE_SIZE }
}

/**
 * Deliberately PUBLIC — there is no requireAdmin() here and there must not be.
 * This backs a page anyone can read without an account, and the Section 0
 * policy already grants anonymous SELECT on recipes. Adding a guard would break
 * anonymous browsing, which is the entire point of the page.
 *
 * It only reads, and it re-derives admin status server-side rather than
 * accepting a flag from the caller, so the needs-review badge cannot be turned
 * on by editing a request.
 */
export async function loadMoreRecipes(
  cuisine: string | null,
  afterTitle: string,
): Promise<RecipePage & { isAdminViewer: boolean }> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const page = await fetchRecipePage({ cuisine, afterTitle })

  return { ...page, isAdminViewer: viewerIsAdmin(data.user?.email) }
}
