import type { Metadata } from "next"
import Link from "next/link"

import { SiteFooter } from "@/components/site-footer/site-footer"
import { SiteNav } from "@/components/site-nav/site-nav"
import { createPublicClient } from "@/lib/supabase/public"

import { Spinner } from "./spinner"

export const metadata: Metadata = {
  title: "Surprise me",
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
      <main className="page-wrap flex flex-col gap-8 py-10 lg:py-14">
        <header className="flex flex-col gap-3">
          <h1 className="font-display text-[clamp(40px,5vw,64px)] leading-none">
            Surprise me
          </h1>
          <p className="max-w-[64ch] text-lg">
            One recipe out of all {recipes.length}, picked at random. To match
            recipes to the ingredients you have, use{" "}
            <Link href="/what-can-i-make" className="font-semibold underline underline-offset-4">
              What can I make?
            </Link>
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
      <SiteFooter />
    </>
  )
}
