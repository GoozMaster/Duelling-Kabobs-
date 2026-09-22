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
 * Static, and no longer by accident. This route was dynamic because it read
 * `?face=` to turn the globe without JavaScript; when the face toggles went,
 * so did the last per-request input, and Next started prerendering it. The
 * `searchParams` prop outlived the code that used it and was the only thing
 * still implying otherwise.
 *
 * The consequence to know about: the cuisine counts below are now resolved at
 * build time and will not move until the next deploy. There is still no
 * `export const revalidate`, but the reason has changed — it used to be inert
 * on a dynamic route, and on a static one it would be the real fix. Adding it
 * is a deliberate decision about staleness, not a tidy-up.
 */
export default async function ByCuisinePage() {
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
