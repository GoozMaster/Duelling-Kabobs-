import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { requireAdmin } from "@/lib/auth"
import { draftFromRecipe } from "@/lib/recipes"
import { createClient } from "@/lib/supabase/server"

import { RecipeForm } from "../../recipe-form"

export const metadata: Metadata = {
  title: "Edit recipe — Dueling Kebabs",
}

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params
  const supabase = await createClient()

  const [recipeResult, ingredientsResult, cuisinesResult] = await Promise.all([
    supabase.from("recipes").select("*").eq("id", id).maybeSingle(),
    supabase.from("ingredients").select("*").eq("recipe_id", id).order("sort_order"),
    supabase.from("cuisines").select("name").order("name"),
  ])

  // maybeSingle() returns null rather than erroring on no match, so a bad id and
  // a malformed uuid both land here as a plain 404. There is no unpublished
  // state to distinguish — every recipe is public the moment it is saved.
  if (!recipeResult.data) {
    notFound()
  }

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
          EDIT RECIPE
        </h1>
      </header>

      <RecipeForm
        draft={draftFromRecipe(recipeResult.data, ingredientsResult.data ?? [])}
        cuisines={(cuisinesResult.data ?? []).map((row) => row.name)}
        mode="edit"
      />
    </main>
  )
}
