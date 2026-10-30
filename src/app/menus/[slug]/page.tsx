import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { RecipeCard } from "@/components/recipe-card"
import { SiteFooter } from "@/components/site-footer/site-footer"
import { SiteNav } from "@/components/site-nav/site-nav"
import { menuBySlug, specialMenus } from "@/lib/special-menus"
import { veganEntryFor, veganReason, type VeganEntry } from "@/lib/vegan-menu"
import { createClient } from "@/lib/supabase/server"

const VEGAN_SECTIONS: { kind: VeganEntry["kind"]; heading: string }[] = [
  { kind: "written", heading: "Vegan as written" },
  { kind: "option", heading: "Vegan using a choice the recipe already lists" },
  { kind: "swap", heading: "Vegan with a simple swap" },
]

export function generateStaticParams() {
  return specialMenus.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const menu = menuBySlug((await params).slug)
  return menu ? { title: menu.title, description: menu.blurb } : { title: "Not found" }
}

/** A special menu: a curated list of recipe cards, in the order the menu sets. */
export default async function SpecialMenuPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const menu = menuBySlug((await params).slug)
  if (!menu) notFound()

  const supabase = await createClient()
  let query = supabase.from("recipes").select("id, title, cuisine")
  query = menu.titles ? query.in("title", menu.titles) : query.in("id", menu.recipeIds ?? [])
  const { data } = await query.limit(1000)

  const found = data ?? []
  const byKey = new Map(found.map((recipe) => [menu.titles ? recipe.title : recipe.id, recipe]))
  const recipes = (menu.titles ?? menu.recipeIds ?? []).flatMap((key) => byKey.get(key) ?? [])

  // The vegan menu groups its cards by how each one is vegan.
  const sections = menu.showReasons
    ? VEGAN_SECTIONS.map((section) => ({
        heading: section.heading,
        recipes: recipes.filter((r) => veganEntryFor(r.title)?.kind === section.kind),
      })).filter((section) => section.recipes.length > 0)
    : [{ heading: null, recipes }]

  return (
    <>
      <SiteNav />
      <main className="page-wrap flex flex-col gap-8 py-10 lg:py-14">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-semibold tracking-widest text-[var(--sk-teal)] uppercase">
            Special menu
          </p>
          <h1 className="font-display text-[clamp(40px,5vw,64px)] leading-none">{menu.title}</h1>
          <p className="max-w-[60ch] text-lg">{menu.blurb}</p>
        </header>

        {sections.map((section) => (
          <section key={section.heading ?? "all"} className="flex flex-col gap-4">
            {section.heading && (
              <h2 className="font-display text-2xl">
                {section.heading}{" "}
                <span className="text-muted-foreground text-base font-normal">
                  {section.recipes.length}
                </span>
              </h2>
            )}
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {section.recipes.map((recipe) => {
                const entry = menu.showReasons ? veganEntryFor(recipe.title) : undefined
                return (
                  <li key={recipe.id}>
                    <RecipeCard
                      id={recipe.id}
                      title={recipe.title}
                      cuisine={recipe.cuisine}
                      note={
                        entry ? (
                          <span className="text-[14px] leading-snug">{veganReason(entry)}</span>
                        ) : undefined
                      }
                    />
                  </li>
                )
              })}
            </ul>
          </section>
        ))}

        <Link
          href="/recipes"
          className="text-foreground w-fit text-sm font-medium underline underline-offset-4"
        >
          Browse all recipes
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
