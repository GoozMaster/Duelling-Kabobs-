import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SiteNav } from "@/components/site-nav/site-nav"
import { Badge } from "@/components/ui/badge"
import { parseInstructions } from "@/lib/instructions"
import { markIngredients } from "@/lib/matching"
import { viewerIsAdmin } from "@/lib/recipe-browse"
import { groupIngredients, sourceLink } from "@/lib/recipes"
import { createClient } from "@/lib/supabase/server"
import { viewerPantry } from "@/lib/viewer-pantry"

import { AdminBar } from "./admin-bar"
import { IngredientList } from "./ingredient-list"

// The same sticker pill as the recipes page's "ways in": these leave the page.
const wayOn =
  "border-border bg-card hover:-translate-y-0.5 focus-visible:ring-ring/50 inline-flex items-center rounded-[var(--sk-radius-pill)] border-2 px-4 py-1.5 text-sm font-medium shadow-[var(--sk-shadow-press)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] hover:shadow-[var(--sk-shadow-sticker)] focus-visible:ring-[3px] focus-visible:outline-none"

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
  return { title: data ? `${data.title} — Dueling Kebabs` : "Not found — Dueling Kebabs" }
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
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        {/* Kept despite the nav: this walks up the hierarchy to the listing,
            which the nav's wordmark (home) does not do. */}
        <Link
          href="/recipes"
          className="text-muted-foreground hover:text-foreground w-fit text-sm underline underline-offset-4"
        >
          ← All recipes
        </Link>
        <h1 className="font-[family-name:var(--sk-font-display)] text-3xl tracking-wide">
          {recipe.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {recipe.cuisine && (
            <Badge variant="outline" asChild>
              <Link href={`/recipes?cuisine=${encodeURIComponent(recipe.cuisine)}`}>
                {recipe.cuisine}
              </Link>
            </Badge>
          )}
          {/* Admin-only: all 126 imported recipes carry this flag, so showing
              it publicly would stamp "needs review" across the whole site. */}
          {isAdmin && recipe.needs_review && (
            <Badge variant="destructive">Needs review</Badge>
          )}
        </div>

        {/* Its own line under the badges rather than another badge: it is
            attribution, not a label, and a null source renders nothing at all
            rather than the word "Source" with a gap after it. */}
        {source && (
          <p className="text-muted-foreground text-xs">
            Source{" "}
            {source.href ? (
              // nofollow because these are third-party sites we are crediting,
              // not vouching for; noopener because target="_blank" otherwise
              // hands the destination a handle on this window.
              <a
                href={source.href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="hover:text-foreground underline underline-offset-4"
              >
                {source.label}
              </a>
            ) : (
              <span>{source.label}</span>
            )}
          </p>
        )}
      </header>

      {isAdmin && (
        <AdminBar
          id={recipe.id}
          title={recipe.title}
          ingredientCount={allIngredients.length}
          needsReview={recipe.needs_review}
        />
      )}

      {isStub ? (
        <section className="border-border bg-card flex flex-col items-start gap-3 rounded-[var(--sk-radius-lg)] border-2 border-dashed p-6">
          <h2 className="font-[family-name:var(--sk-font-display)] text-xl tracking-wide">
            STILL ON THE CUTTING BOARD
          </h2>
          <p className="text-muted-foreground max-w-prose">
            This one is in the collection by name, but its ingredients and method
            have not been written up yet.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href="/recipes/surprise" className={wayOn}>
              Surprise me instead →
            </Link>
            {recipe.cuisine && (
              <Link
                href={`/recipes?cuisine=${encodeURIComponent(recipe.cuisine)}`}
                className={wayOn}
              >
                More {recipe.cuisine} →
              </Link>
            )}
          </div>
        </section>
      ) : (
        <>
          <IngredientList
            groups={groups}
            have={have}
            totalRequired={totalRequired}
            usedPantry={pantry.usedPantry}
          />

          <section className="flex flex-col gap-4">
            <h2 className="font-[family-name:var(--sk-font-display)] text-xl tracking-wide">
              INSTRUCTIONS
            </h2>

            {blocks.length === 0 ? (
              // An explicit line beats a blank region that reads as a loading bug.
              <p className="text-muted-foreground rounded-[var(--sk-radius-md)] border border-dashed px-4 py-6 text-center text-sm">
                No method written up for this one yet.
              </p>
            ) : (
              // 16px, not 14: this is the part of the page people read at the
              // counter, often from arm's length.
              <div className="flex max-w-prose flex-col gap-4">
                {blocks.map((block, index) =>
                  block.kind === "heading" ? (
                    <h3
                      key={index}
                      className="font-[family-name:var(--sk-font-display)] pt-3 text-lg tracking-wide"
                    >
                      {block.text}
                    </h3>
                  ) : (
                    <p key={index} className="text-base leading-7">
                      {block.text}
                    </p>
                  ),
                )}
              </div>
            )}
          </section>
        </>
      )}
      </main>
    </>
  )
}
