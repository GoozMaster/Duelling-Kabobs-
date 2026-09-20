import type { Metadata } from "next"
import Link from "next/link"

import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import { NewRecipe } from "../new-recipe"

export const metadata: Metadata = {
  title: "Add a recipe — Dueling Kebabs",
}

export default async function NewRecipePage() {
  await requireAdmin()

  const supabase = await createClient()
  const { data } = await supabase.from("cuisines").select("name").order("name")

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
          ADD A RECIPE
        </h1>
        <p className="text-muted-foreground text-sm">
          Type one in, pull one from a web page, or upload a batch.
        </p>
      </header>

      <NewRecipe cuisines={(data ?? []).map((row) => row.name)} />
    </main>
  )
}
