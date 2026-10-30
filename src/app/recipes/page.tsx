import type { Metadata } from "next"
import Link from "next/link"

import { SiteFooter } from "@/components/site-footer/site-footer"
import { SiteNav } from "@/components/site-nav/site-nav"
import { fetchAllIngredients } from "@/lib/ingredients"
import { searchRecipesByIngredient } from "@/lib/ingredient-search"
import { cuisineCounts, subcategoryCounts, viewerIsAdmin } from "@/lib/recipe-browse"
import { createClient } from "@/lib/supabase/server"

import { fetchRecipePage } from "./actions"
import { CuisineFilter } from "./cuisine-filter"
import { IngredientSearchBar } from "./ingredient-search-bar"
import { RecipeGrid } from "./recipe-grid"
import { SubcategoryFilter } from "./subcategory-filter"

// Echoes the .btn sticker treatment from the home page rather than the filter
// chips: these launch a different page, the chips filter this one.
const wayIn =
  "inline-flex items-center rounded-[var(--sk-radius-pill)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] px-5 py-2.5 text-base font-semibold shadow-[var(--sk-shadow-sticker)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--sk-shadow-pop)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"

export const metadata: Metadata = {
  title: "Recipes",
  description: "Browse the whole collection. No account needed.",
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ cuisine?: string; sub?: string; q?: string }>
}) {
  const { cuisine: requested, sub: requestedSub, q } = await searchParams
  const query = (q ?? "").trim().slice(0, 80)
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

  // Subheadings only exist inside a cuisine, and an unknown one is ignored for
  // the same reason an unknown cuisine is: show the recipes, not a dead end.
  const subcategories = cuisine ? await subcategoryCounts(supabase, cuisine) : []
  const subcategory =
    requestedSub && subcategories.some(({ name }) => name === requestedSub)
      ? requestedSub
      : null

  const isAdminViewer = viewerIsAdmin(auth.user?.email)

  // An ingredient search replaces the paged list with every match, since the
  // result set is small and ranking across pages would be meaningless.
  const search = query ? await runSearch(supabase, query, cuisine) : null
  const page = search ? null : await fetchRecipePage({ cuisine, subcategory })

  return (
    <>
      <SiteNav />
      <main className="page-wrap flex flex-col gap-8 py-10 lg:py-14">
        <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div className="flex flex-col gap-3">
            <h1 className="font-display text-[clamp(40px,5vw,64px)] leading-none">Recipes</h1>
            <p className="max-w-[60ch] text-lg">
              All {total} {total === 1 ? "recipe" : "recipes"} in the collection. Filter by
              cuisine below, or try one of the other ways in.
            </p>
          </div>

          {/* The other two ways in also live in the nav's Recipes menu, but that
              menu is a Radix trigger and does nothing without JavaScript. These
              are plain links, so the globe and the spinner are never unreachable. */}
          <nav aria-label="Other ways to browse" className="flex flex-wrap gap-3">
            <Link href="/recipes/by-cuisine" className={wayIn}>
              Browse on the globe
            </Link>
            <Link href="/recipes/surprise" className={wayIn}>
              Pick one at random
            </Link>
          </nav>
        </header>

        <IngredientSearchBar query={query} cuisine={cuisine} />

        <CuisineFilter counts={counts} total={total} active={cuisine} query={query} />

        {cuisine && subcategories.length > 0 && !query && (
          <SubcategoryFilter
            cuisine={cuisine}
            cuisineTotal={counts.find(({ name }) => name === cuisine)?.count ?? 0}
            counts={subcategories}
            active={subcategory}
          />
        )}

        {search ? (
          <div className="flex flex-col gap-8">
            <p role="status" className="text-lg">
              {search.matches.length === 0
                ? `No ${cuisine ? `${cuisine} ` : ""}recipes use "${query}".`
                : `${search.matches.length} ${search.matches.length === 1 ? "recipe uses" : "recipes use"} "${query}"${cuisine ? ` in ${cuisine}` : ""}.`}
            </p>
            {search.matches.length > 0 && (
              <RecipeGrid
                key={`m-${cuisine ?? "all"}-${query}`}
                initial={search.matches}
                initialHasMore={false}
                cuisine={cuisine}
                subcategory={null}
                isAdminViewer={isAdminViewer}
              />
            )}
            {search.related.length > 0 && (
              <section className="flex flex-col gap-4">
                <h2 className="font-display text-2xl">Close matches</h2>
                <p className="text-muted-foreground text-sm">
                  These use some of the words in your search but not all of them.
                </p>
                <RecipeGrid
                  key={`r-${cuisine ?? "all"}-${query}`}
                  initial={search.related}
                  initialHasMore={false}
                  cuisine={cuisine}
                  subcategory={null}
                  isAdminViewer={isAdminViewer}
                />
              </section>
            )}
          </div>
        ) : (
          /* Keyed on the filter so a chip change resets the grid's list rather
             than appending the new cuisine onto the old one. */
          <RecipeGrid
            key={`${cuisine ?? "all"}/${subcategory ?? ""}`}
            initial={page!.recipes}
            initialHasMore={page!.hasMore}
            cuisine={cuisine}
            subcategory={subcategory}
            isAdminViewer={isAdminViewer}
          />
        )}
      </main>
      <SiteFooter />
    </>
  )
}

async function runSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  cuisine: string | null,
) {
  let recipeQuery = supabase
    .from("recipes")
    .select("id, title, cuisine, needs_review")
    .order("title")
    .limit(1000)
  if (cuisine) recipeQuery = recipeQuery.eq("cuisine", cuisine)

  const [{ data: recipes }, ingredients] = await Promise.all([
    recipeQuery,
    fetchAllIngredients(supabase),
  ])

  return searchRecipesByIngredient(query, recipes ?? [], ingredients)
}
