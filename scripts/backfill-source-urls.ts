/**
 * Fills in recipes.source_url from the Google Doc the collection came from.
 *
 * WHY A COMMITTED SCRIPT RATHER THAN A ONE-OFF:
 * it imports the app's real title matcher instead of copying it, the Doc is a
 * living source of truth that will gain more linked headings, and this repo
 * already argues for data operations living in supabase/migrations rather than
 * being typed into a console once (see 20260920000300's header).
 *
 * WHAT IT DOES NOT DO: write to the database. It emits a migration for review
 * and prints a report. Nothing here needs a service-role key, because reading
 * recipes is allowed to the public role and writing is left to a human.
 *
 * USAGE
 *   In the Doc: File -> Download -> Markdown (.md), then
 *   npm run backfill:sources -- path/to/Recipes.md
 */

import { readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"

import { createClient } from "@supabase/supabase-js"

// Relative, not "@/...": the alias is a bundler concern and this runs under
// bare node. similarity.ts has no runtime dependencies, so it imports cleanly;
// lib/recipes.ts would drag in the generated database types.
import { titleSimilarity } from "../src/lib/similarity.ts"

/**
 * Higher than the app's DUPLICATE_THRESHOLD of 0.85, deliberately.
 *
 * That constant is tuned for "is this row a duplicate?", where a false
 * positive costs an admin one confirmation click. Here a false positive
 * silently credits a recipe to the wrong publisher, permanently and
 * invisibly. The shared constant is left alone; this is a local, stricter bar.
 */
const AUTO_APPLY = 0.93
const REVIEW_FLOOR = 0.85

/**
 * A linked recipe heading, as Google Docs actually exports one:
 *
 *   ## [**Pineapple Cucumber Smoothie**](https://…) {#pineapple-cucumber-smoothie}
 *
 * Three details that are easy to miss and each break the match completely: the
 * title comes wrapped in bold, the export appends its own anchor id after the
 * link, and a handful of headings carry a stray `&nbsp;` in between. Anchoring
 * on `)$` matched nothing at all against the real file; allowing only the
 * anchor still silently dropped the four headings with the `&nbsp;`, which is
 * the worse failure because it looks like success.
 */
const HEADING =
  /^(#{1,6})\s*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)(?:\s|&nbsp;|\{#[^}]*\})*$/

/** Drops the **bold** / *italic* / _underline_ wrapping off a heading title. */
function unemphasise(title: string): string {
  return title.replace(/(\*\*|__|\*|_)/g, "").trim()
}

/** Same list the URL importer strips, so both paths store the same shape. */
const TRACKING_PARAMS = /^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$|igshid$|ref_src$)/

function clean(raw: string): string {
  try {
    // Google Docs escapes some punctuation on the way out, leaving things like
    // `…/#recipejump\\` in the href. A backslash is not valid in a URL anyway,
    // so dropping them is both safe and what was meant.
    const url = new URL(raw.replace(/\\/g, ""))
    for (const key of [...url.searchParams.keys()]) {
      if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key)
    }
    return url.toString()
  } catch {
    return raw
  }
}

type DocEntry = { level: number; title: string; url: string }

function parseDoc(markdown: string): { entries: DocEntry[]; histogram: Map<number, number> } {
  const all: DocEntry[] = []

  for (const line of markdown.split(/\r?\n/)) {
    const match = HEADING.exec(line.trim())
    if (!match) continue
    all.push({ level: match[1].length, title: unemphasise(match[2]), url: clean(match[3]) })
  }

  const histogram = new Map<number, number>()
  for (const entry of all) histogram.set(entry.level, (histogram.get(entry.level) ?? 0) + 1)

  return { entries: all, histogram }
}

async function main() {
  const path = process.argv[2] ?? "Recipes.md"
  const markdown = readFileSync(resolve(path), "utf8")

  const { entries, histogram } = parseDoc(markdown)

  console.log(`Read ${path}`)
  console.log("\nLinked headings by level:")
  for (const [level, count] of [...histogram].sort((a, b) => a[0] - b[0])) {
    console.log(`  ${"#".repeat(level).padEnd(6)} ${count}`)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase env. Run via `npm run backfill:sources`, which passes --env-file=.env.local.",
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)
  const { data, error } = await supabase
    .from("recipes")
    .select("id, title, source_url")
    .order("title")

  if (error) throw new Error(`Could not read recipes: ${error.message}`)
  const recipes = data ?? []

  // The Doc's recipe headings and its section headings (DRINKS, ASIAN…) are at
  // different levels, and which level is which depends on how Google Docs
  // exported it. Rather than assume "##", keep the level whose count is closest
  // to the number of recipes — and print the histogram above either way, so a
  // wrong guess is visible rather than silent.
  let level = 2
  let best = Infinity
  for (const [candidate, count] of histogram) {
    const distance = Math.abs(count - recipes.length)
    if (distance < best) {
      best = distance
      level = candidate
    }
  }

  const seen = new Set<string>()
  const duplicates: string[] = []
  const docEntries = entries.filter((entry) => {
    if (entry.level !== level) return false
    const key = entry.title.toLowerCase()
    if (seen.has(key)) {
      duplicates.push(entry.title)
      return false
    }
    seen.add(key)
    return true
  })

  console.log(
    `\nUsing level ${"#".repeat(level)} — ${docEntries.length} linked recipes against ${recipes.length} in the database.`,
  )
  if (duplicates.length) {
    console.log(`Skipped ${duplicates.length} repeated title(s): ${duplicates.join(", ")}`)
  }

  /*
   * Global one-to-one assignment.
   *
   * This deliberately does not use the app's findBestMatch. That answers "what
   * is the best candidate for THIS title" and knows nothing about the other
   * titles, so two database rows can both claim the same Doc entry — "Teriyaki
   * Chicken" and "Chicken Teriyaki Stir-Fry" are the kind of pair that does it.
   * Scoring the whole cross product with the same titleSimilarity underneath,
   * then assigning greedily from the top, means the strongest pairing wins and
   * neither side can be used twice. Getting this wrong is the single most
   * likely way for a backfill to quietly credit the wrong publisher.
   */
  const pairs: Array<{ recipeIndex: number; docIndex: number; score: number }> = []
  recipes.forEach((recipe, recipeIndex) => {
    docEntries.forEach((entry, docIndex) => {
      const score = titleSimilarity(recipe.title, entry.title)
      if (score >= REVIEW_FLOOR) pairs.push({ recipeIndex, docIndex, score })
    })
  })
  pairs.sort((a, b) => b.score - a.score)

  const takenRecipe = new Set<number>()
  const takenDoc = new Set<number>()
  const assigned: Array<{ recipe: (typeof recipes)[number]; entry: DocEntry; score: number }> = []
  const contested: string[] = []

  for (const pair of pairs) {
    if (takenRecipe.has(pair.recipeIndex) || takenDoc.has(pair.docIndex)) {
      // Something better already claimed one side. Worth reporting: it is where
      // a near-miss would have gone wrong.
      if (pair.score >= AUTO_APPLY) {
        contested.push(
          `  "${recipes[pair.recipeIndex].title}" ~ "${docEntries[pair.docIndex].title}" (${pair.score.toFixed(3)}) — already assigned`,
        )
      }
      continue
    }
    takenRecipe.add(pair.recipeIndex)
    takenDoc.add(pair.docIndex)
    assigned.push({
      recipe: recipes[pair.recipeIndex],
      entry: docEntries[pair.docIndex],
      score: pair.score,
    })
  }

  const auto = assigned.filter((a) => a.score >= AUTO_APPLY)
  const review = assigned.filter((a) => a.score < AUTO_APPLY)
  const unmatched = recipes.filter((_, index) => !takenRecipe.has(index))
  const unusedDoc = docEntries.filter((_, index) => !takenDoc.has(index))

  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14)
  const outPath = resolve(`supabase/migrations/${stamp}_backfill_source_urls.sql`)

  const sql = [
    "-- Generated by scripts/backfill-source-urls.ts from the source Google Doc.",
    "--",
    "-- `and source_url is null` makes every statement idempotent and means a",
    "-- rerun can never overwrite a URL entered by hand in the admin form.",
    `-- ${auto.length} of ${recipes.length} recipes matched at or above ${AUTO_APPLY}.`,
    "",
    ...auto.map(
      ({ recipe, entry }) =>
        `update public.recipes set source_url = '${entry.url.replace(/'/g, "''")}' where id = '${recipe.id}' and source_url is null;`,
    ),
    "",
  ].join("\n")

  writeFileSync(outPath, sql, "utf8")

  const pct = ((auto.length / recipes.length) * 100).toFixed(1)
  console.log(`\n── Report ─────────────────────────────`)
  console.log(`Auto-applied (>= ${AUTO_APPLY}):  ${auto.length}  (${pct}% coverage)`)
  console.log(`Needs review (${REVIEW_FLOOR}–${AUTO_APPLY}): ${review.length}`)
  console.log(`Unmatched recipes:          ${unmatched.length}`)
  console.log(`Doc entries never used:     ${unusedDoc.length}`)

  if (review.length) {
    console.log(`\nReview these by hand — NOT written to the migration:`)
    for (const { recipe, entry, score } of review) {
      console.log(`  ${score.toFixed(3)}  DB "${recipe.title}"`)
      console.log(`         DOC "${entry.title}"  ${entry.url}`)
    }
  }

  if (contested.length) {
    console.log(`\nCollisions resolved by taking the stronger pairing:`)
    console.log(contested.join("\n"))
  }

  if (unmatched.length) {
    console.log(`\nNo source found for:`)
    for (const recipe of unmatched) console.log(`  ${recipe.title}`)
  }

  console.log(
    `\nPartial coverage is the expected outcome: the Doc leaves plenty of recipes`,
  )
  console.log(`unlinked, and a blank source is a real answer rather than a failure.`)
  console.log(`\nWrote ${outPath}`)
  console.log(`Review it, then apply with the Supabase MCP's apply_migration.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
