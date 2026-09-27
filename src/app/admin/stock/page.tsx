import type { Metadata } from "next"
import Link from "next/link"

import { requireAdmin } from "@/lib/auth"
import type { PantryItem } from "@/lib/pantry"
import { createClient } from "@/lib/supabase/server"

import { StockRoom } from "./stock-room"

export const metadata: Metadata = {
  title: "What's in Stock — Dueling Kebabs",
}

export default async function StockPage() {
  await requireAdmin()

  const supabase = await createClient()

  // The same rows My Pantry edits — this page only re-sorts them by where they
  // are kept. See lib/stock.ts for how the four sections fold into three places.
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .order("section")
    .order("category")
    .order("name")

  const items: PantryItem[] = data ?? []

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            ← Admin
          </Link>
          <Link
            href="/admin/pantry"
            className="text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            Edit or remove items in My Pantry
          </Link>
        </div>
        <h1 className="font-[family-name:var(--sk-font-display)] text-3xl tracking-wide">
          WHAT&apos;S IN STOCK
        </h1>
        <p className="text-muted-foreground text-sm">
          Everything on hand, by where it lives. Scroll to a section, or tap a door, to
          open it up.
        </p>
      </header>

      {error ? (
        <p className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm">
          Could not load your stock: {error.message}
        </p>
      ) : (
        <StockRoom items={items} />
      )}
    </main>
  )
}
