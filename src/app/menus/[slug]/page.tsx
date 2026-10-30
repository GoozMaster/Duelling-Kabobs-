import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ChristmasBackdrop } from "@/components/christmas/christmas-backdrop"
import xmasCss from "@/components/christmas/christmas-page.module.css"
import { GardenBackdrop } from "@/components/garden/garden-backdrop"
import gardenCss from "@/components/garden/garden-page.module.css"
import { RecipeCard } from "@/components/recipe-card"
import { SiteFooter } from "@/components/site-footer/site-footer"
import { SiteNav } from "@/components/site-nav/site-nav"
import { menuBySlug, specialMenus } from "@/lib/special-menus"
import { veganEntryFor, veganReason, type VeganEntry } from "@/lib/vegan-menu"
import { createClient } from "@/lib/supabase/server"

// The vegan menu's filters. A recipe that already offers a vegan choice and one
// that needs a swap read the same to a cook, so they share a filter.
const VEGAN_FILTERS: { key: string; label: string; kinds: VeganEntry["kind"][] }[] = [
  { key: "all", label: "All vegan options", kinds: ["written", "option", "swap"] },
  { key: "written", label: "Vegan as written", kinds: ["written"] },
  { key: "swap", label: "Vegan with a simple swap", kinds: ["option", "swap"] },
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
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ show?: string }>
}) {
  const menu = menuBySlug((await params).slug)
  const { show } = await searchParams
  if (!menu) notFound()

  const supabase = await createClient()
  let query = supabase.from("recipes").select("id, title, cuisine")
  query = menu.titles ? query.in("title", menu.titles) : query.in("id", menu.recipeIds ?? [])
  const { data } = await query.limit(1000)

  const found = data ?? []
  const byKey = new Map(found.map((recipe) => [menu.titles ? recipe.title : recipe.id, recipe]))
  const recipes = (menu.titles ?? menu.recipeIds ?? []).flatMap((key) => byKey.get(key) ?? [])

  // The vegan menu filters its cards by how each one is vegan.
  const inFilter = (title: string, kinds: VeganEntry["kind"][]) => {
    const kind = veganEntryFor(title)?.kind
    return kind !== undefined && kinds.includes(kind)
  }
  const filters = menu.showReasons
    ? VEGAN_FILTERS.map((f) => ({
        ...f,
        count: recipes.filter((r) => inFilter(r.title, f.kinds)).length,
      }))
    : []
  const active = filters.find((f) => f.key === show) ?? filters[0]
  const visible = active ? recipes.filter((r) => inFilter(r.title, active.kinds)) : recipes

  const themed = menu.theme !== undefined
  const x = menu.theme === "garden" ? gardenCss : xmasCss

  return (
    <>
      {menu.theme === "christmas" && <ChristmasBackdrop />}
      {menu.theme === "garden" && <GardenBackdrop />}
      <SiteNav />
      <main className="page-wrap relative flex flex-col gap-8 py-10 lg:py-14">
        <header className="flex flex-col gap-3">
          <p
            className={`text-sm font-semibold tracking-widest uppercase ${
              themed ? x.eyebrow : "text-[var(--sk-teal)]"
            }`}
          >
            Special menu
          </p>
          <h1
            className={`font-display text-[clamp(40px,5vw,64px)] leading-none ${themed ? x.title : ""}`}
          >
            {menu.title}
          </h1>
          <p className={`max-w-[60ch] text-lg ${themed ? x.blurb : ""}`}>{menu.blurb}</p>
        </header>

        {filters.length > 0 && (
          <nav aria-label="Filter the vegan menu" className="flex flex-wrap gap-3">
            {filters.map((f) => (
              <Link
                key={f.key}
                href={f.key === "all" ? `/menus/${menu.slug}` : `/menus/${menu.slug}?show=${f.key}`}
                scroll={false}
                aria-current={f === active ? "page" : undefined}
                className={`font-display text-2xl ${gardenCss.heading} ${gardenCss.filter} ${
                  f === active ? gardenCss.filterActive : ""
                }`}
              >
                {f.label}
                <span className="text-muted-foreground ml-2 text-base font-normal">{f.count}</span>
              </Link>
            ))}
          </nav>
        )}

        {[{ recipes: visible }].map((section) => (
          <section key={active?.key ?? "all"} className="flex flex-col gap-4">
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
          className={
            themed
              ? `${x.exit} w-fit text-sm`
              : "text-foreground w-fit text-sm font-medium underline underline-offset-4"
          }
        >
          Browse all recipes
        </Link>
      </main>
      <SiteFooter />
    </>
  )
}
