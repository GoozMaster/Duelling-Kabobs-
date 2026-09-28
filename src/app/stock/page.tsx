import type { Metadata } from "next"
import Link from "next/link"

import { SiteNav } from "@/components/site-nav/site-nav"
import type { PantryItem } from "@/lib/pantry"
import { viewerIsAdmin } from "@/lib/recipe-browse"
import { createClient } from "@/lib/supabase/server"

import { StockRoom } from "./stock-room"

export const metadata: Metadata = {
  title: "What's in Stock — Dueling Kebabs",
}

/**
 * What's in Stock is public and view-only for everyone but the admin.
 *
 * Anyone may read pantry_items (see the pantry_public_read migration); only
 * the admin may write it, which RLS enforces and addPantryItem checks again.
 * `canEdit` below only decides whether the quick-add forms are drawn — hiding
 * them is courtesy, not the security boundary.
 */
export default async function StockPage() {
  const supabase = await createClient()

  const [{ data: auth }, { data, error }] = await Promise.all([
    supabase.auth.getUser(),
    // The same rows My Pantry edits — this page only re-sorts them by where
    // they are kept. See lib/stock.ts for how the four sections fold into three.
    supabase
      .from("pantry_items")
      .select("*")
      .order("section")
      .order("category")
      .order("name"),
  ])

  const canEdit = viewerIsAdmin(auth.user?.email)
  const items: PantryItem[] = data ?? []

  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:px-6">
        <header className="flex flex-col gap-2">
          {canEdit && (
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
          )}
          <h1 className="font-[family-name:var(--sk-font-display)] text-3xl tracking-wide">
            WHAT&apos;S IN STOCK
          </h1>
          <p className="text-muted-foreground text-sm">
            Everything on hand, by where it lives. Scroll to a section, or tap a door, to
            open it up.
            {!canEdit && " View only — the kitchen's owner keeps this list up to date."}
          </p>
        </header>

        {error ? (
          <p className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm">
            Could not load what&apos;s in stock: {error.message}
          </p>
        ) : (
          <StockRoom items={items} canEdit={canEdit} />
        )}
      </main>
    </>
  )
}
