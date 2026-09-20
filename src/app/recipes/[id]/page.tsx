import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { groupIngredients } from "@/lib/recipes"
import { createClient } from "@/lib/supabase/server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from("recipes").select("title").eq("id", id).maybeSingle()

  return { title: data ? `${data.title} — Dueling Kebabs` : "Recipe — Dueling Kebabs" }
}

/**
 * Placeholder for Recipe Detail (section 5). Public, like the browse page.
 * Section 5 adds instructions, substitutions and the admin edit/delete
 * controls; the route, the query and the grouping stay.
 */
export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // A malformed uuid makes PostgREST error rather than return nothing, so the
  // shape check happens first and both cases land on the same 404.
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const supabase = await createClient()
  const [recipeResult, ingredientsResult] = await Promise.all([
    supabase.from("recipes").select("*").eq("id", id).maybeSingle(),
    supabase.from("ingredients").select("*").eq("recipe_id", id).order("sort_order"),
  ])

  const recipe = recipeResult.data
  if (!recipe) notFound()

  // Reuses the same grouping the editor uses, which is what makes the 39
  // multi-part recipes read as "Poolish / Dough" instead of one flat list.
  const groups = groupIngredients(
    (ingredientsResult.data ?? []).map((row) => ({
      ...row,
      groupLabel: row.group_label,
    })),
  )

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <header className="flex flex-col gap-2">
        <Link
          href="/recipes"
          className="text-muted-foreground hover:text-foreground w-fit text-sm underline underline-offset-4"
        >
          ← All recipes
        </Link>
        <h1 className="font-[family-name:var(--sk-font-display)] text-3xl tracking-wide">
          {recipe.title}
        </h1>
        {recipe.cuisine && (
          <span>
            <Badge variant="outline">{recipe.cuisine}</Badge>
          </span>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Ingredients</h2>

        {groups.map((group, index) => (
          <div key={group.label ?? `ungrouped-${index}`} className="flex flex-col gap-1.5">
            {group.label && (
              <h3 className="text-muted-foreground text-sm font-medium">{group.label}</h3>
            )}
            <ul className="border-border rounded-[var(--sk-radius-md)] border px-4 py-2">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="border-border/40 flex items-baseline justify-between gap-3 border-b py-1.5 text-sm last:border-b-0"
                >
                  <span>{item.name}</span>
                  {!item.required && (
                    <span className="text-muted-foreground shrink-0 text-xs">optional</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <p className="text-muted-foreground border-border rounded-[var(--sk-radius-sm)] border border-dashed px-3 py-2 text-sm">
        Instructions, substitution notes and the admin controls arrive in section 5.
      </p>
    </main>
  )
}
