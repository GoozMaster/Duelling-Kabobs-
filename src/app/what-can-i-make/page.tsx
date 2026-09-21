import type { Metadata } from "next"

import { SiteNav } from "@/components/site-nav/site-nav"
import { viewerIsAdmin } from "@/lib/recipe-browse"
import { createClient } from "@/lib/supabase/server"

import { findRecipes } from "./actions"
import { SearchPanel } from "./search-panel"

export const metadata: Metadata = {
  title: "What can I make? — Dueling Kebabs",
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
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--sk-font-display)] text-3xl tracking-wide">
          WHAT CAN I MAKE?
        </h1>
        <p className="text-muted-foreground text-sm">
          {isAdmin
            ? "Matched against your saved pantry."
            : "Type what you have in. Nothing is saved — it resets when you leave."}
        </p>
      </header>

        <SearchPanel isAdmin={isAdmin} initial={initial} />
      </main>
    </>
  )
}
