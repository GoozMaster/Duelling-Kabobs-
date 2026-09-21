import * as cheerio from "cheerio"

import {
  type DraftRecipe,
  emptyIngredient,
  newIngredientKey,
} from "@/lib/recipes"

/**
 * schema.org/Recipe extraction from JSON-LD. No LLM, no third-party API — just
 * structured markup the publisher already put on the page.
 *
 * The shapes below are what real sites actually emit, which is messier than the
 * schema.org examples suggest:
 *   - the Recipe is often not top level, but one node inside an `@graph` array
 *   - a page may carry several ld+json blocks, only one of which is the recipe
 *   - `@type` may be an array, e.g. ["Recipe", "NewsArticle"]
 *   - instructions may be a plain string, an array of strings, an array of
 *     HowToStep, or HowToSection objects that wrap steps another level down
 *   - `recipeIngredient` is sometimes spelled `ingredients` (the retired name)
 */

type Json = unknown

/**
 * Campaign parameters, dropped before a URL is stored.
 *
 * They describe how *we* arrived, not where the recipe is, and they are the
 * difference between a source line reading "smittenkitchen.com" and one
 * carrying somebody's ad-attribution trail around for the life of the row.
 */
const TRACKING_PARAMS = /^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$|igshid$|ref_src$)/

function stripTracking(url: URL): string {
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key)
  }
  return url.toString()
}

function asArray(value: Json): Json[] {
  if (value === null || value === undefined) return []
  return Array.isArray(value) ? value : [value]
}

function isObject(value: Json): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function typeIncludesRecipe(node: Record<string, Json>): boolean {
  return asArray(node["@type"]).some(
    (type) => typeof type === "string" && type.toLowerCase() === "recipe",
  )
}

/** Depth-first walk for the first node that declares itself a Recipe. */
function findRecipeNode(value: Json, depth = 0): Record<string, Json> | null {
  if (depth > 8) return null

  for (const candidate of asArray(value)) {
    if (!isObject(candidate)) continue
    if (typeIncludesRecipe(candidate)) return candidate

    // @graph is the common wrapper; other nested objects are worth a look too,
    // since some CMSs bury the recipe under a `mainEntity`.
    for (const key of ["@graph", "mainEntity", "mainEntityOfPage", "itemListElement"]) {
      const found = findRecipeNode(candidate[key], depth + 1)
      if (found) return found
    }
  }

  return null
}

function plainText(value: Json): string {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return String(value)
  return ""
}

/** Flattens HowToStep / HowToSection trees into numbered lines. */
function collectSteps(value: Json, depth = 0): string[] {
  if (depth > 5) return []

  const steps: string[] = []

  for (const node of asArray(value)) {
    if (typeof node === "string") {
      const text = node.trim()
      if (text) steps.push(text)
      continue
    }

    if (!isObject(node)) continue

    // A HowToSection holds its steps under itemListElement; recurse rather than
    // reading its own `text`, which is usually just the section heading.
    if (node.itemListElement) {
      const name = plainText(node.name)
      const nested = collectSteps(node.itemListElement, depth + 1)
      if (name && nested.length > 0) steps.push(`${name}:`)
      steps.push(...nested)
      continue
    }

    const text = plainText(node.text) || plainText(node.name)
    if (text) steps.push(text)
  }

  return steps
}

export type UrlImportResult = {
  draft: DraftRecipe
  /** Null when structured markup was found; a reason when it was not. */
  notice: string | null
  sourceCuisine: string | null
}

/**
 * Parses a fetched HTML document. Never throws on unrecognised input — a page
 * without markup yields an empty draft and a notice, because the spec is
 * explicit that this always lands in an editable form rather than failing.
 */
export function extractRecipeFromHtml(
  html: string,
  knownCuisines: string[],
  fetchedUrl: string,
): UrlImportResult {
  const $ = cheerio.load(html)
  let recipe: Record<string, Json> | null = null

  $('script[type="application/ld+json"]').each((_, element) => {
    if (recipe) return

    const raw = $(element).contents().text().trim()
    if (!raw) return

    try {
      // Some publishers wrap JSON-LD in a CDATA section, which is legal in
      // XHTML and invalid JSON. It usually arrives commented out —
      // `//<![CDATA[ … //]]>` — so that the markers stay valid JavaScript for
      // an HTML parser as well. Both spellings occur in the wild.
      const cleaned = raw
        .replace(/^\s*(?:\/\/|\/\*)?\s*<!\[CDATA\[/, "")
        .replace(/\s*(?:\/\/|\/\*)?\s*\]\]>\s*(?:\*\/)?\s*$/, "")
        .trim()

      recipe = findRecipeNode(JSON.parse(cleaned))
    } catch {
      // One malformed block should not stop the others being tried.
    }
  })

  /**
   * Where to credit the recipe, best first.
   *
   * The JSON-LD node's own `url` is the publisher saying where this recipe
   * lives, which beats whatever route we arrived by; `rel=canonical` is the
   * same claim made about the page. Both are preferred over the fetched URL
   * because a recipe reached through a category listing, an AMP variant or a
   * share wrapper should still credit the canonical page.
   *
   * Falls back to the URL we actually fetched, which is never wrong, only
   * sometimes uglier.
   */
  const resolveSource = (node: Record<string, Json> | null): string => {
    const candidates = [
      node ? plainText(node.url) : "",
      $('link[rel="canonical"]').attr("href") ?? "",
    ]

    for (const candidate of candidates) {
      try {
        const url = new URL(candidate)
        if (url.protocol === "http:" || url.protocol === "https:") {
          return stripTracking(url)
        }
      } catch {
        // Relative or absent. The fetched URL below is always absolute.
      }
    }

    try {
      return stripTracking(new URL(fetchedUrl))
    } catch {
      return fetchedUrl
    }
  }

  const emptyResult = (notice: string): UrlImportResult => ({
    draft: {
      id: null,
      title: "",
      instructions: "",
      cuisine: null,
      needsReview: false,
      // A page with no structured markup still has a legitimate source.
      sourceUrl: resolveSource(null),
      ingredients: [emptyIngredient()],
    },
    notice,
    sourceCuisine: null,
  })

  if (!recipe) {
    const title = $("h1").first().text().trim() || $("title").text().trim()
    const result = emptyResult(
      "No structured recipe data on that page. Here is a blank form — the title has been filled in if one was obvious.",
    )
    result.draft.title = title
    return result
  }

  const node: Record<string, Json> = recipe

  const ingredientNames = [
    ...asArray(node.recipeIngredient),
    ...asArray(node.ingredients),
  ]
    .map(plainText)
    .filter(Boolean)

  const steps = collectSteps(node.recipeInstructions)

  // recipeCuisine is free text — "italian", "Southern Italian", anything. Match
  // case-insensitively against the list we have, and leave it blank rather than
  // guessing, so the admin picks. Imports do not silently create cuisines; only
  // CSV does that, and only because it is a bulk migration.
  const rawCuisine = asArray(node.recipeCuisine).map(plainText).filter(Boolean)[0] ?? null
  const matchedCuisine =
    knownCuisines.find(
      (name) => name.toLowerCase() === (rawCuisine ?? "").toLowerCase(),
    ) ?? null

  return {
    draft: {
      id: null,
      title: plainText(node.name) || plainText(node.headline),
      instructions: steps.join("\n"),
      cuisine: matchedCuisine,
      // The admin reviews in the form before saving, so this is not a
      // needs-review case the way a bulk CSV import is.
      needsReview: false,
      sourceUrl: resolveSource(node),
      ingredients:
        ingredientNames.length > 0
          ? ingredientNames.map((name) => ({
              key: newIngredientKey(),
              name,
              groupLabel: "",
              required: true,
              substitution: "",
            }))
          : [emptyIngredient()],
    },
    notice: null,
    sourceCuisine: rawCuisine && !matchedCuisine ? rawCuisine : null,
  }
}
