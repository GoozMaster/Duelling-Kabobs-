import type { Metadata } from "next"

import { SiteNav } from "@/components/site-nav/site-nav"
import { cuisineCounts } from "@/lib/recipe-browse"
import { createPublicClient } from "@/lib/supabase/public"

import { CuisineTiles } from "./cuisine-tiles"
import { Globe } from "./globe"
import s from "./by-cuisine.module.css"

export const metadata: Metadata = {
  title: "By cuisine — Dueling Kebabs",
  description: "Turn the globe, or pick a cuisine from the list.",
}

/**
 * Dynamic, because reading searchParams makes it so — `?face=` is what turns
 * the globe without JavaScript, and that is worth more here than prerendering.
 *
 * There is deliberately no `export const revalidate` below. It would do
 * nothing on a dynamic route, and a config line that silently has no effect is
 * exactly what hid the static-to-dynamic regression on the home page. The work
 * per request is one cheap query plus ~180 path computations.
 */
export default async function ByCuisinePage({
  searchParams,
}: {
  searchParams: Promise<{ face?: string }>
}) {
  const supabase = createPublicClient()
  const { counts, total } = await cuisineCounts(supabase)

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="font-[family-name:var(--sk-font-display)] text-3xl tracking-wide">
            BY CUISINE
          </h1>
          <p className="text-muted-foreground text-sm">
            {total} recipes across {counts.filter((c) => c.count > 0).length}{" "}
            cuisines. Turn the globe and click a country, or pick from the list.
          </p>
        </header>

        {/* Order flips at the breakpoint: on a phone a 640px globe is the worst
            way to pick a cuisine, so the tiles come first there. */}
        <div className={s.layout}>
          <div className={s.globeSlot}>
            <Globe face="old" counts={counts} />
          </div>
          <div className={s.tilesSlot}>
            <CuisineTiles counts={counts} />
          </div>
        </div>
      </main>
    </>
  )
}
