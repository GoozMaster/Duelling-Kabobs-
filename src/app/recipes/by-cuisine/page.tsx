import type { Metadata } from "next"
import Link from "next/link"

import { SiteNav } from "@/components/site-nav/site-nav"
import { GLOBE_FACES, type GlobeFace, isGlobeFace } from "@/lib/cuisine-geography"
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
  const { face: requested } = await searchParams

  // An unrecognised ?face= shows the default rather than erroring, exactly as
  // an unrecognised ?cuisine= does on the recipes page.
  const face: GlobeFace = isGlobeFace(requested) ? requested : "old"

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

        {/* Rotation as navigation. Every face is a plain link, so it is
            shareable and the back button steps through them — the same
            reasoning behind the cuisine filter chips being links. */}
        <nav aria-label="Turn the globe" className={s.faces}>
          {(Object.keys(GLOBE_FACES) as GlobeFace[]).map((key) => (
            <Link
              key={key}
              href={key === "old" ? "/recipes/by-cuisine" : `/recipes/by-cuisine?face=${key}`}
              aria-current={key === face ? "page" : undefined}
              className={`${s.face} ${key === face ? s.faceOn : ""}`}
            >
              {GLOBE_FACES[key].label}
            </Link>
          ))}
        </nav>

        {/* Order flips at the breakpoint: on a phone a 640px globe is the worst
            way to pick a cuisine, so the tiles come first there. */}
        <div className={s.layout}>
          <div className={s.globeSlot}>
            <Globe face={face} counts={counts} />
          </div>
          <div className={s.tilesSlot}>
            <CuisineTiles counts={counts} />
          </div>
        </div>
      </main>
    </>
  )
}
