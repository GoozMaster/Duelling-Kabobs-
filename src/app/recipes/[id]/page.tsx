import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { SiteNav } from "@/components/site-nav/site-nav"
import { Badge } from "@/components/ui/badge"
import { parseInstructions } from "@/lib/instructions"
import { viewerIsAdmin } from "@/lib/recipe-browse"
import { groupIngredients, sourceLink } from "@/lib/recipes"
import { createClient } from "@/lib/supabase/server"

import { AdminBar } from "./admin-bar"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("recipes").select("title").eq("id", id).maybeSingle()

  return { title: data ? `${data.title} — Dueling Kebabs` : "Recipe — Dueling Kebabs" }
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

  const ingredients = ingredientsResult.data ?? []
  const isAdmin = viewerIsAdmin(auth.user?.email)

  // Reuses the editor's own grouping, which is what makes the 39 multi-part
  // recipes read as "Poolish / Dough" rather than one flat list.
  const groups = groupIngredients(
    ingredients.map((row) => ({ ...row, groupLabel: row.group_label })),
  )

  const blocks = parseInstructions(recipe.instructions)

  const source = sourceLink(recipe.source_url)

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
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
          ingredientCount={ingredients.length}
          needsReview={recipe.needs_review}
        />
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Ingredients</h2>

        {groups.length === 0 ? (
          <p className="text-muted-foreground text-sm">No ingredients recorded yet.</p>
        ) : (
          groups.map((group, index) => (
            <div key={group.label ?? `ungrouped-${index}`} className="flex flex-col gap-1.5">
              {group.label && (
                <h3 className="text-muted-foreground text-sm font-medium">{group.label}</h3>
              )}
              <ul className="border-border rounded-[var(--sk-radius-md)] border px-4 py-2">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className="border-border/40 flex flex-col gap-0.5 border-b py-2 text-sm last:border-b-0"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span>{item.name}</span>
                      {!item.required && (
                        <span className="text-muted-foreground shrink-0 text-xs">
                          optional
                        </span>
                      )}
                    </span>
                    {item.substitution && (
                      <span className="text-muted-foreground text-xs">
                        or {item.substitution}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Instructions</h2>

        {blocks.length === 0 ? (
          // Two imported recipes genuinely have none. An explicit line beats a
          // blank region that reads as a loading bug.
          <p className="text-muted-foreground text-sm">
            No instructions recorded for this one yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {blocks.map((block, index) =>
              block.kind === "heading" ? (
                <h3
                  key={index}
                  className="font-[family-name:var(--sk-font-display)] pt-2 text-base tracking-wide"
                >
                  {block.text}
                </h3>
              ) : (
                <p key={index} className="text-sm leading-relaxed">
                  {block.text}
                </p>
              ),
            )}
          </div>
        )}
      </section>
      </main>
    </>
  )
}
