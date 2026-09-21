import type { Metadata } from "next"

import { SiteNav } from "@/components/site-nav/site-nav"
import { createPublicClient } from "@/lib/supabase/public"

import { Spinner } from "./spinner"

export const metadata: Metadata = {
  title: "Surprise me — Dueling Kebabs",
  description: "Spin the reel and cook whatever it lands on.",
}

/**
 * Deliberately static with a five-minute window.
 *
 * Nothing on this page differs by visitor: the randomness happens in the
 * browser after load, and no cookie is read, so the cookie-free public client
 * keeps the route prerenderable. The home page learned this the hard way —
 * adding a cookie-bound query there silently turned a static page dynamic and
 * left an `export const revalidate` that did nothing. Stated explicitly here so
 * the next person to add a query knows what they would be giving up.
 *
 * The cost is that a newly added recipe can be up to five minutes late to the
 * reel, which for a "surprise me" button is not a cost worth a dynamic render.
 */
export const revalidate = 300

export default async function SurprisePage() {
  const supabase = createPublicClient()
  const { data } = await supabase.from("recipes").select("id, title, cuisine")

  const recipes = data ?? []

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="font-[family-name:var(--sk-font-display)] text-3xl tracking-wide">
            SURPRISE ME
          </h1>
          <p className="text-muted-foreground text-sm">
            One recipe out of {recipes.length}, picked at random. It ignores your
            pantry entirely — that is what the other page is for.
          </p>
        </header>

        {recipes.length === 0 ? (
          <p className="text-muted-foreground rounded-[var(--sk-radius-md)] border border-dashed px-4 py-12 text-center">
            No recipes to spin through yet.
          </p>
        ) : (
          <Spinner recipes={recipes} />
        )}
      </main>
    </>
  )
}
