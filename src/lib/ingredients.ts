import type { createClient } from "@/lib/supabase/server"

export type IngredientRow = {
  recipe_id: string
  name: string
  required: boolean
}

/**
 * Fetches every ingredient row, in pages.
 *
 * PostgREST caps a response at 1,000 rows by default and says nothing about it
 * — no error, no flag, just a short array. With 1,420 ingredients a plain
 * select silently dropped roughly a third, so recipes whose rows fell past the
 * cap arrived with no ingredients and disappeared from "What can I make?"
 * entirely. Baguettes and Flan, both fully covered by the pantry, were missing
 * from the results for exactly that reason.
 *
 * This lives outside the Server Action file on purpose: a "use server" module
 * may only export async functions, and Next.js does not reliably keep
 * non-exported helpers in it either — declaring this there produced a runtime
 * "fetchAllIngredients is not defined" on the server.
 */
export async function fetchAllIngredients(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<IngredientRow[]> {
  const PAGE = 1000
  const all: IngredientRow[] = []

  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("ingredients")
      .select("recipe_id, name, required")
      .order("id")
      .range(from, from + PAGE - 1)

    if (error || !data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE) break
  }

  return all
}
