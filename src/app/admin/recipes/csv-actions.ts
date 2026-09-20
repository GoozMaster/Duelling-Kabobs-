"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth"
import { parseRecipeCsv } from "@/lib/recipe-csv"
import { type DraftRecipe, ingredientsPayload } from "@/lib/recipes"
import { findBestMatch } from "@/lib/similarity"
import { createClient } from "@/lib/supabase/server"

export type CsvDuplicate = { id: string; title: string; score: number }

export type CsvPlanRow = {
  draft: DraftRecipe
  duplicate: CsvDuplicate | null
}

export type CsvAnalysis = {
  rows: CsvPlanRow[]
  problems: string[]
  /** Cuisines the file uses that do not exist yet; created on commit. */
  newCuisines: string[]
}

/**
 * Phase one: parse and compare, write nothing.
 *
 * Duplicates are never resolved automatically — the spec is emphatic that a
 * possible match is shown side by side for the admin to decide. This action
 * only gathers what the decision needs.
 */
export async function analyzeCsv(text: string): Promise<
  { ok: true; analysis: CsvAnalysis } | { ok: false; error: string }
> {
  await requireAdmin()

  const { drafts, problems } = parseRecipeCsv(text)

  if (drafts.length === 0) {
    return {
      ok: false,
      error:
        problems.length > 0
          ? `Nothing importable. ${problems[0]}`
          : "That file has no recipes in it. Columns should be title, instructions, cuisine, ingredients.",
    }
  }

  const supabase = await createClient()
  const [existing, cuisineRows] = await Promise.all([
    supabase.from("recipes").select("id, title"),
    supabase.from("cuisines").select("name"),
  ])

  const known = existing.data ?? []
  const cuisines = (cuisineRows.data ?? []).map((row) => row.name)

  const rows: CsvPlanRow[] = drafts.map((draft) => {
    const match = findBestMatch(draft.title, known, (candidate) => candidate.title)
    return {
      draft,
      duplicate: match
        ? { id: match.candidate.id, title: match.candidate.title, score: match.score }
        : null,
    }
  })

  // The shipped template carries Japanese and Mexican, neither of which is in
  // the seeded list, and recipes.cuisine is a foreign key — so without creating
  // them the import would fail with 23503 rather than importing anything.
  const newCuisines = [
    ...new Set(
      drafts
        .map((draft) => draft.cuisine)
        .filter((name): name is string => Boolean(name))
        .filter(
          (name) =>
            !cuisines.some((known) => known.toLowerCase() === name.toLowerCase()),
        ),
    ),
  ]

  return { ok: true, analysis: { rows, problems, newCuisines } }
}

export type CsvDecision = "import" | "skip" | "overwrite"

export type CsvCommitRow = {
  draft: DraftRecipe
  decision: CsvDecision
  /** The existing recipe to replace, when the decision is overwrite. */
  overwriteId: string | null
}

export type CsvCommitSummary = {
  imported: number
  overwritten: number
  skipped: number
  cuisinesCreated: string[]
  errors: string[]
}

/** Phase two: apply the decisions the admin made. */
export async function commitCsvImport(
  rows: CsvCommitRow[],
): Promise<{ ok: true; summary: CsvCommitSummary } | { ok: false; error: string }> {
  await requireAdmin()

  const supabase = await createClient()
  const summary: CsvCommitSummary = {
    imported: 0,
    overwritten: 0,
    skipped: 0,
    cuisinesCreated: [],
    errors: [],
  }

  const toWrite = rows.filter((row) => row.decision !== "skip")
  summary.skipped = rows.length - toWrite.length

  // Create any missing cuisines first, and only for rows actually being
  // written — a skipped row should not leave a new cuisine behind.
  const { data: cuisineRows } = await supabase.from("cuisines").select("name")
  const existingCuisines = (cuisineRows ?? []).map((row) => row.name)

  const wanted = [
    ...new Set(
      toWrite
        .map((row) => row.draft.cuisine)
        .filter((name): name is string => Boolean(name)),
    ),
  ]

  // Resolve case differences against what is already there, so a CSV saying
  // "italian" reuses Italian rather than creating a near-duplicate.
  const resolved = new Map<string, string>()

  for (const name of wanted) {
    const match = existingCuisines.find(
      (known) => known.toLowerCase() === name.toLowerCase(),
    )

    if (match) {
      resolved.set(name, match)
      continue
    }

    const { error } = await supabase.from("cuisines").insert({ name })

    if (error && error.code !== "23505") {
      summary.errors.push(`Could not add cuisine "${name}": ${error.message}`)
      continue
    }

    resolved.set(name, name)
    summary.cuisinesCreated.push(name)
  }

  for (const row of toWrite) {
    const cuisine = row.draft.cuisine ? (resolved.get(row.draft.cuisine) ?? null) : null
    const isOverwrite = row.decision === "overwrite" && row.overwriteId

    const { error } = await supabase.rpc("save_recipe", {
      p_id: (isOverwrite ? row.overwriteId : null) as string,
      p_title: row.draft.title,
      p_instructions: row.draft.instructions,
      p_cuisine: cuisine as string,
      p_needs_review: true,
      p_ingredients: ingredientsPayload(row.draft.ingredients),
    })

    if (error) {
      summary.errors.push(`"${row.draft.title}": ${error.message}`)
      continue
    }

    if (isOverwrite) {
      summary.overwritten += 1
    } else {
      summary.imported += 1
    }
  }

  revalidatePath("/admin/recipes")
  revalidatePath("/recipes")

  return { ok: true, summary }
}
