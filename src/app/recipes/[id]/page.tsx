import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/site-footer/site-footer"
import { SiteNav } from "@/components/site-nav/site-nav"
import { CuisineArt } from "@/components/cuisine-art"
import { Badge } from "@/components/ui/badge"
import { parseInstructions } from "@/lib/instructions"
import { markIngredients } from "@/lib/matching"
import { viewerIsAdmin } from "@/lib/recipe-browse"
import { groupIngredients, sourceLink } from "@/lib/recipes"
import { videoFromSource } from "@/lib/source-video"
import { createClient } from "@/lib/supabase/server"
import { viewerPantry } from "@/lib/viewer-pantry"

import { AdminBar } from "./admin-bar"
import { IngredientList } from "./ingredient-list"
import { MethodSteps } from "./method-steps"
import { RecipeMedia } from "./recipe-media"

// The sticker pill for links that leave the page: the cuisine, the stub's ways out.
const wayOn =
  "inline-flex items-center rounded-[var(--sk-radius-pill)] border-2 border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] px-4 py-1.5 text-base font-semibold shadow-[var(--sk-shadow-press)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] hover:-translate-y-0.5 hover:shadow-[var(--sk-shadow-sticker)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("recipes").select("title").eq("id", id).maybeSingle()

  // A missing recipe renders app/not-found.tsx, but this metadata still wins
  // the <title>, so it has to say the same thing that page does.
  return { title: data ? data.title : "Not found" }
}

/**
 * Public recipe view. Anyone can read it; the admin bar renders only for the
 * one recognised account.
 *
 * This page reads cookies to decide that, which forces dynamic rendering — so
 * unlike the home page it cannot use the cookie-free public client. That is
 * correct here: the response genuinely differs by who is asking.
 */
export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // A malformed uuid makes PostgREST error rather than return nothing, so the
  // shape check happens first and both cases land on the same 404.
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const supabase = await createClient()
  const [recipeResult, ingredientsResult, { data: auth }] = await Promise.all([
    supabase.from("recipes").select("*").eq("id", id).maybeSingle(),
    supabase.from("ingredients").select("*").eq("recipe_id", id).order("sort_order"),
    supabase.auth.getUser(),
  ])

  const recipe = recipeResult.data
  if (!recipe) notFound()

  // Two imported recipes are stubs whose only ingredient row is a literal
  // "TODO — add ingredients". Rendering that row publicly reads as a bug, so a
  // placeholder counts as no ingredient at all. The admin bar still gets the
  // raw count, since that is the number the editor will show.
  const allIngredients = ingredientsResult.data ?? []
  const ingredients = allIngredients.filter((row) => !/^\s*TODO\b/i.test(row.name))
  const isAdmin = viewerIsAdmin(auth.user?.email)

  // A video the admin set wins; otherwise the source link's own video (or one
  // embedded on the source page) is shown.
  const youtubeUrl = recipe.youtube_url ?? (await videoFromSource(recipe.source_url))

  // Every ingredient flagged as on hand or not, from the same matcher the
  // search page uses, so the two can never reach different verdicts about the
  // same recipe. The flags are computed here whether or not the reader turns
  // the view on; it is one pass over a dozen strings.
  const pantry = await viewerPantry(supabase)
  const marked = markIngredients(ingredients, pantry.items)

  const requiredMarked = marked.filter((item) => item.required)
  const totalRequired = requiredMarked.length
  const have = requiredMarked.filter((item) => item.onHand).length

  // Reuses the editor's own grouping, which is what makes the 39 multi-part
  // recipes read as "Poolish / Dough" rather than one flat list.
  const groups = groupIngredients(
    marked.map((row) => ({ ...row, groupLabel: row.group_label })),
  )

  const blocks = parseInstructions(recipe.instructions)

  const source = sourceLink(recipe.source_url)

  // Nothing to cook from yet. One explanation with a way onward beats two
  // separate "none recorded" lines under two empty headings.
  const isStub = ingredients.length === 0 && blocks.length === 0


  return (
    <>
      <SiteNav />
      <main className="page-wrap flex flex-col gap-10 py-10 lg:gap-14 lg:py-14">
        <header className="flex flex-col gap-6">
          {/* Kept despite the nav: this walks up the hierarchy to the listing,
              which the nav's wordmark (home) does not do. */}
          <Link
            href="/recipes"
            className="hover:text-[var(--sk-teal)] w-fit text-base font-semibold underline underline-offset-4"
          >
            ← All recipes
          </Link>

          <div className="flex items-center gap-5 sm:gap-8">
            <span className="hidden size-24 shrink-0 overflow-hidden rounded-full border-4 border-[var(--sk-outline)] shadow-[var(--sk-shadow-sticker)] sm:block lg:size-32">
              <CuisineArt name={recipe.cuisine ?? "Other"} px={128} />
            </span>
            <div className="flex min-w-0 flex-col gap-4">
              <h1 className="font-display text-[clamp(34px,5vw,68px)] leading-[0.95] text-balance">
                {recipe.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
                {recipe.cuisine && (
                  <Link
                    href={`/recipes?cuisine=${encodeURIComponent(recipe.cuisine)}`}
                    className={wayOn}
                  >
                    {recipe.cuisine}
                  </Link>
                )}
                {ingredients.length > 0 && (
                  <span>
                    {ingredients.length} {ingredients.length === 1 ? "ingredient" : "ingredients"}
                  </span>
                )}
                {/* Attribution, not a label, and a null source renders nothing
                    at all rather than the word "Source" with a gap after it. */}
                {source && (
                  <span>
                    From{" "}
                    {source.href ? (
                      // nofollow because these are third-party sites we are
                      // crediting, not vouching for; noopener because
                      // target="_blank" otherwise hands the destination a
                      // handle on this window.
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="font-semibold underline underline-offset-4 hover:text-[var(--sk-teal)]"
                      >
                        {source.label}
                      </a>
                    ) : (
                      <span className="font-semibold">{source.label}</span>
                    )}
                  </span>
                )}
                {/* Admin-only: all 126 imported recipes carry this flag, so
                    showing it publicly would stamp "needs review" across the
                    whole site. */}
                {isAdmin && recipe.needs_review && (
                  <Badge variant="destructive">Needs review</Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <RecipeMedia
          id={recipe.id}
          title={recipe.title}
          isAdmin={isAdmin}
          youtubeUrl={youtubeUrl}
          imageUrl={recipe.image_url}
        />

        {isAdmin && (
          <AdminBar
            id={recipe.id}
            title={recipe.title}
            ingredientCount={allIngredients.length}
            needsReview={recipe.needs_review}
          />
        )}

        {isStub ? (
          <section className="flex max-w-2xl flex-col items-start gap-4 rounded-[var(--sk-radius-lg)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] p-8 shadow-[var(--sk-shadow-sticker)]">
            <h2 className="font-display text-2xl">Not written up yet</h2>
            <p className="max-w-prose text-[17px]">
              This one is in the collection by name, but its ingredients and
              method have not been added yet.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/recipes/surprise" className={wayOn}>
                Pick a random recipe instead
              </Link>
              {recipe.cuisine && (
                <Link
                  href={`/recipes?cuisine=${encodeURIComponent(recipe.cuisine)}`}
                  className={wayOn}
                >
                  More {recipe.cuisine} recipes
                </Link>
              )}
            </div>
          </section>
        ) : (
          // The ingredient card keeps a fixed, comfortable width and rides
          // alongside the method on wide screens, so the list is still in view
          // at the last step. The method takes the rest at a ~68ch measure.
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(340px,420px)_minmax(0,1fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24">
              <IngredientList
                groups={groups}
                have={have}
                totalRequired={totalRequired}
                usedPantry={pantry.usedPantry}
              />
            </div>

            <section aria-labelledby="method-title" className="flex flex-col gap-6">
              <h2 id="method-title" className="font-display text-[clamp(28px,3vw,40px)] leading-none">
                Method
              </h2>

              {blocks.length === 0 ? (
                // An explicit line beats a blank region that reads as a loading bug.
                <p className="text-muted-foreground text-[17px]">
                  No method written up for this one yet.
                </p>
              ) : (
                <MethodSteps blocks={blocks} />
              )}
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
