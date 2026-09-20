import type { Metadata } from "next"
import Link from "next/link"

import { requireAdmin } from "@/lib/auth"
import type { PantryItem } from "@/lib/pantry"
import { createClient } from "@/lib/supabase/server"

import { PantryManager } from "./pantry-manager"

export const metadata: Metadata = {
  title: "My Pantry — Dueling Kebabs",
}

export default async function PantryPage() {
  await requireAdmin()

  const supabase = await createClient()

  // One query for the lot. At a few hundred rows, paginating would cost more in
  // complexity than it saves — and the filter needs every row in hand anyway to
  // search across all four sections at once.
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .order("section")
    .order("category")
    .order("name")

  const items: PantryItem[] = data ?? []

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground w-fit text-sm underline underline-offset-4"
        >
          ← Admin
        </Link>
        <h1 className="font-[family-name:var(--sk-font-display)] text-3xl tracking-wide">
          MY PANTRY
        </h1>
        <p className="text-muted-foreground text-sm">
          Everything here is assumed on hand when working out what you can cook.
        </p>
      </header>

      {error ? (
        <p className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm">
          Could not load your pantry: {error.message}
        </p>
      ) : (
        <PantryManager items={items} />
      )}
    </main>
  )
}
