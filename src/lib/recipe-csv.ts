import Papa from "papaparse"

import { type DraftRecipe, newIngredientKey } from "@/lib/recipes"

/**
 * One row per recipe. Columns: title, instructions, cuisine, ingredients —
 * the last packed into a single semicolon-separated cell.
 *
 * Papaparse rather than a hand-rolled split: the shipped template already has
 * quoted fields containing commas, and correct RFC-4180 handling of escaped
 * quotes and newlines inside cells is easy to get subtly wrong. A bug there
 * would silently corrupt recipe text partway through a 150-row migration.
 */

export type CsvParseResult = {
  drafts: DraftRecipe[]
  /** Row-level problems, reported rather than thrown. */
  problems: string[]
}

/** Column lookup that survives casing and stray whitespace in the header. */
function pick(row: Record<string, string>, name: string): string {
  const key = Object.keys(row).find(
    (candidate) => candidate.trim().toLowerCase() === name,
  )
  return key ? (row[key] ?? "").trim() : ""
}

export function parseRecipeCsv(text: string): CsvParseResult {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    // Excel writes a UTF-8 BOM, which otherwise becomes part of the first
    // header name and makes the title column impossible to find.
    transformHeader: (header) => header.replace(/^﻿/, "").trim(),
  })

  const drafts: DraftRecipe[] = []
  const problems: string[] = []

  // Check the header before anything else. Without this, a file that is not a
  // recipe CSV at all surfaces papaparse's own diagnostics — "unable to
  // auto-detect delimiting character" — which describes its parsing trouble
  // rather than the thing the admin actually needs to fix.
  const headers = (parsed.meta.fields ?? []).map((field) => field.trim().toLowerCase())

  if (!headers.includes("title")) {
    return {
      drafts: [],
      problems: [
        headers.length > 0
          ? `No "title" column. Found: ${headers.join(", ")}.`
          : "That file has no column headers.",
      ],
    }
  }

  for (const error of parsed.errors) {
    // Papaparse reports a 0-based data row; +2 accounts for that and the header.
    const where = typeof error.row === "number" ? `Row ${error.row + 2}` : "The file"
    problems.push(`${where}: ${error.message}`)
  }

  parsed.data.forEach((row, index) => {
    const lineNumber = index + 2
    const title = pick(row, "title")

    if (!title) {
      problems.push(`Row ${lineNumber}: no title, skipped.`)
      return
    }

    const ingredientNames = pick(row, "ingredients")
      .split(";")
      .map((name) => name.trim())
      .filter(Boolean)

    if (ingredientNames.length === 0) {
      problems.push(`Row ${lineNumber}: "${title}" has no ingredients, skipped.`)
      return
    }

    drafts.push({
      id: null,
      title,
      instructions: pick(row, "instructions"),
      // Kept as written; the import action reconciles it against the cuisines
      // table and creates anything missing, because the shipped template
      // carries cuisines the seeded list does not have.
      cuisine: pick(row, "cuisine") || null,
      // Bulk imports are flagged until the required/optional tagging and
      // substitutions have been done by hand.
      needsReview: true,
      // The CSV template has no source column. Left blank rather than guessed
      // at; the Doc backfill fills these in where it can.
      sourceUrl: null,
      ingredients: ingredientNames.map((name) => ({
        key: newIngredientKey(),
        name,
        // CSV has no way to express sub-components; groups are added later
        // through the edit form.
        groupLabel: "",
        required: true,
        substitution: "",
      })),
    })
  })

  return { drafts, problems }
}
