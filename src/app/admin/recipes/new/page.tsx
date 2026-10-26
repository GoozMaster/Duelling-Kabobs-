import type { Metadata } from "next"
import Link from "next/link"

import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import { NewRecipe } from "../new-recipe"

export const metadata: Metadata = {
  title: "Add a recipe",
}

export default async function NewRecipePage() {
  await requireAdmin()

  const supabase = await createClient()
  const { data } = await supabase.from("cuisines").select("name").order("name")

  return (
    <main className="page-wrap flex flex-col gap-8 py-10 *:max-w-4xl lg:py-14">
      <header className="flex flex-col gap-2">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground w-fit text-sm underline underline-offset-4"
        >
          ← Admin
        </Link>
        <h1 className="font-display text-[clamp(36px,4.5vw,56px)] leading-none">
          ADD A RECIPE
        </h1>
        <p className="text-lg">
          Type one in, pull one from a web page, or upload a batch.
        </p>
      </header>

      <NewRecipe cuisines={(data ?? []).map((row) => row.name)} />
    </main>
  )
}
