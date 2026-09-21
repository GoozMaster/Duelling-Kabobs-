import type { Metadata } from "next"
import Link from "next/link"

import { SiteNav } from "@/components/site-nav/site-nav"
import { cuisineCounts, viewerIsAdmin } from "@/lib/recipe-browse"
import { createClient } from "@/lib/supabase/server"

import { fetchRecipePage } from "./actions"
import { CuisineFilter } from "./cuisine-filter"
import { RecipeGrid } from "./recipe-grid"

// Echoes the .btn sticker treatment from the home page rather than the filter
// chips: these launch a different page, the chips filter this one.
const wayIn =
  "border-border bg-card hover:-translate-y-0.5 focus-visible:ring-ring/50 inline-flex items-center rounded-[var(--sk-radius-pill)] border-2 px-4 py-1.5 text-sm font-medium shadow-[var(--sk-shadow-press)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] hover:shadow-[var(--sk-shadow-sticker)] focus-visible:ring-[3px] focus-visible:outline-none"

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
  const [{ counts, total }, { data: auth }] = await Promise.all([
    cuisineCounts(supabase),
    supabase.auth.getUser(),
  ])

  // An unrecognised ?cuisine= shows everything rather than erroring or showing
  // an empty page that looks like a bug.
  const cuisine =
    requested && counts.some(({ name }) => name === requested) ? requested : null

  const page = await fetchRecipePage({ cuisine })
  const isAdminViewer = viewerIsAdmin(auth.user?.email)

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="font-[family-name:var(--sk-font-display)] text-3xl tracking-wide">
            RECIPES
          </h1>
          <p className="text-muted-foreground text-sm">
            {total} {total === 1 ? "recipe" : "recipes"}, no account needed.
          </p>
        </header>

        {/* The other two ways in also live in the nav's Recipes menu, but that
            menu is a Radix trigger and does nothing without JavaScript. These
            are plain links, so the globe and the spinner are never unreachable. */}
        <nav aria-label="Other ways to browse" className="flex flex-wrap gap-2">
          <Link href="/recipes/by-cuisine" className={wayIn}>
            Browse the globe →
          </Link>
          <Link href="/recipes/surprise" className={wayIn}>
            Surprise me →
          </Link>
        </nav>

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
    </>
  )
}
