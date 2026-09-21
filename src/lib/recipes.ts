import type { Tables } from "@/lib/supabase/database.types"

export type Recipe = Tables<"recipes">
export type Ingredient = Tables<"ingredients">

/**
 * One editable ingredient line.
 *
 * `key` is a client-side identity for React lists and reordering only — it is
 * never persisted. Row order in the array *is* the `sort_order`, which is why
 * save_recipe() rebuilds the rows from the array index rather than trusting a
 * number carried along in the payload.
 */
export type DraftIngredient = {
  key: string
  name: string
  groupLabel: string
  required: boolean
  substitution: string
}

/**
 * The shape every intake mode produces.
 *
 * The point of a single draft type is that URL import and CSV upload do not get
 * their own save path — they build one of these and hand it to the same form
 * the admin types into. Whatever the manual form can express, an import can be
 * corrected into before it is saved.
 */
export type DraftRecipe = {
  id: string | null
  title: string
  instructions: string
  cuisine: string | null
  needsReview: boolean
  /** Where it came from. Null when unknown, which is a real answer here. */
  sourceUrl: string | null
  ingredients: DraftIngredient[]
}

export function newIngredientKey(): string {
  return `ing-${Math.random().toString(36).slice(2, 10)}`
}

export function emptyIngredient(): DraftIngredient {
  return {
    key: newIngredientKey(),
    name: "",
    groupLabel: "",
    required: true,
    substitution: "",
  }
}

export function emptyDraft(): DraftRecipe {
  return {
    id: null,
    title: "",
    instructions: "",
    cuisine: null,
    needsReview: false,
    sourceUrl: null,
    ingredients: [emptyIngredient()],
  }
}

/** Builds a draft from a saved recipe, for edit mode. */
export function draftFromRecipe(
  recipe: Recipe,
  ingredients: Ingredient[],
): DraftRecipe {
  return {
    id: recipe.id,
    title: recipe.title,
    instructions: recipe.instructions,
    cuisine: recipe.cuisine,
    needsReview: recipe.needs_review,
    sourceUrl: recipe.source_url,
    ingredients:
      ingredients.length > 0
        ? ingredients
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((row) => ({
              key: row.id,
              name: row.name,
              groupLabel: row.group_label ?? "",
              required: row.required,
              substitution: row.substitution ?? "",
            }))
        : [emptyIngredient()],
  }
}

export type SourceLink = { href: string | null; label: string }

/**
 * Turns a stored source into something safe to render.
 *
 * Two things make this more than a formatting helper:
 *
 * SCHEME GUARD. source_url is free text an admin typed, and the detail page is
 * the one page anonymous visitors are meant to see. A stored `javascript:...`
 * dropped into an href would be stored XSS, so anything that is not http or
 * https comes back with href: null and renders as plain text. Rejecting by
 * allowlist rather than blocking `javascript:` by name — `data:`, `vbscript:`
 * and their encoded spellings are the same problem wearing a different hat.
 *
 * LABEL. A 120-character URL in a header wrecks the layout, so the link is
 * labelled with its host. The full URL is still in the href and on hover.
 *
 * Non-URL text (a cookbook name, "Mum") is legitimate provenance and survives
 * as a plain label rather than being thrown away.
 */
export function sourceLink(raw: string | null): SourceLink | null {
  const value = raw?.trim()
  if (!value) return null

  let parsed: URL
  try {
    parsed = new URL(value)
  } catch {
    return { href: null, label: value }
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { href: null, label: value }
  }

  return { href: parsed.toString(), label: parsed.hostname.replace(/^www\./, "") }
}

/** The payload shape save_recipe() expects in its jsonb argument. */
export function ingredientsPayload(ingredients: DraftIngredient[]) {
  return ingredients
    .filter((row) => row.name.trim() !== "")
    .map((row) => ({
      name: row.name.trim(),
      group_label: row.groupLabel.trim() || null,
      required: row.required,
      substitution: row.substitution.trim() || null,
    }))
}

/**
 * Groups ingredients for display, preserving the order each group first
 * appears in. Used by the form preview and, later, by Recipe Detail.
 */
export function groupIngredients<T extends { groupLabel?: string | null }>(
  ingredients: T[],
): Array<{ label: string | null; items: T[] }> {
  const groups: Array<{ label: string | null; items: T[] }> = []

  for (const item of ingredients) {
    const label = item.groupLabel?.trim() || null
    const existing = groups.find((group) => group.label === label)
    if (existing) {
      existing.items.push(item)
    } else {
      groups.push({ label, items: [item] })
    }
  }

  return groups
}
