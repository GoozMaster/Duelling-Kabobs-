import type { Metadata } from "next"

import { SiteFooter } from "@/components/site-footer/site-footer"
import { SiteNav } from "@/components/site-nav/site-nav"
import { viewerIsAdmin } from "@/lib/recipe-browse"
import { createClient } from "@/lib/supabase/server"

import { findRecipes } from "./actions"
import { SearchPanel } from "./search-panel"

export const metadata: Metadata = {
  title: "What can I make?",
  description:
    "Tell it what you have and it tells you what you can cook. No account needed.",
}

export default async function WhatCanIMakePage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  const isAdmin = viewerIsAdmin(auth.user?.email)

  // Server-render the first result so the admin's pantry answer is on screen
  // immediately, and a public visitor sees the empty state rather than a flash
  // of nothing while the first action round-trips.
  const initial = await findRecipes([])

  return (
    <>
      <SiteNav />
      <main className="page-wrap flex flex-col gap-8 py-10 lg:py-14">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-[clamp(40px,5vw,64px)] leading-none">
          What can I make?
        </h1>
        <p className="max-w-[60ch] text-lg">
          {isAdmin
            ? "Matched against your saved pantry."
            : "Add the ingredients you have, one at a time, and the recipes you can cook rise to the top. Nothing is saved."}
        </p>
      </header>

        <SearchPanel isAdmin={isAdmin} initial={initial} />
      </main>
      <SiteFooter />
    </>
  )
}
