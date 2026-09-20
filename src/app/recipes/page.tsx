import type { Metadata } from "next"
import Link from "next/link"

import { viewerIsAdmin } from "@/lib/recipe-browse"
import { createClient } from "@/lib/supabase/server"

import { fetchRecipePage } from "./actions"
import { CuisineFilter } from "./cuisine-filter"
import { RecipeGrid } from "./recipe-grid"

export const metadata: Metadata = {
  title: "Recipes — Dueling Kebabs",
  description: "Browse the whole collection. No account needed.",
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ cuisine?: string }>
}) {
  const { cuisine: requested } = await searchParams
  const supabase = await createClient()

  // This page must never gate. isAdmin() is read only to decide whether the
  // needs-review badge renders — requireAdmin() would redirect the public away
  // from the one page built for them.
  const [cuisineRows, allRecipes, { data: auth }] = await Promise.all([
    supabase.from("cuisines").select("name").order("name"),
    supabase.from("recipes").select("cuisine"),
    supabase.auth.getUser(),
  ])

  const cuisines = (cuisineRows.data ?? []).map((row) => row.name)

  // An unrecognised ?cuisine= shows everything rather than erroring or showing
  // an empty page that looks like a bug.
  const cuisine = requested && cuisines.includes(requested) ? requested : null

  const tally = new Map<string, number>()
  for (const row of allRecipes.data ?? []) {
    if (row.cuisine) tally.set(row.cuisine, (tally.get(row.cuisine) ?? 0) + 1)
  }

  const counts = cuisines.map((name) => ({ name, count: tally.get(name) ?? 0 }))
  const total = allRecipes.data?.length ?? 0

  const page = await fetchRecipePage({ cuisine })
  const isAdminViewer = viewerIsAdmin(auth.user?.email)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground w-fit text-sm underline underline-offset-4"
        >
          ← Dueling Kebabs
        </Link>
        <h1 className="font-[family-name:var(--sk-font-display)] text-3xl tracking-wide">
          RECIPES
        </h1>
        <p className="text-muted-foreground text-sm">
          {total} {total === 1 ? "recipe" : "recipes"}, no account needed.
        </p>
      </header>

      <CuisineFilter counts={counts} total={total} active={cuisine} />

      {/* Keyed on the filter so a chip change resets the grid's list rather
          than appending the new cuisine onto the old one. */}
      <RecipeGrid
        key={cuisine ?? "all"}
        initial={page.recipes}
        initialHasMore={page.hasMore}
        cuisine={cuisine}
        isAdminViewer={isAdminViewer}
      />
    </main>
  )
}
