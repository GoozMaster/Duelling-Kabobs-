import type { Tables } from "@/lib/supabase/database.types"

export type PantryItem = Tables<"pantry_items">

export type PantrySection = "staple" | "standing_protein" | "fridge" | "freezer"

/**
 * The four sections, in display order. `section` is constrained to exactly
 * these values by a CHECK constraint on the table.
 */
export const PANTRY_SECTIONS = [
  {
    key: "staple",
    label: "Staples",
    blurb: "Shelf-stable and always assumed on hand once added.",
  },
  {
    key: "standing_protein",
    label: "Standing Proteins",
    blurb: "The proteins you keep stocked. Also always assumed on hand.",
  },
  {
    key: "fridge",
    label: "Fridge",
    blurb: "What is actually in there right now.",
  },
  {
    key: "freezer",
    label: "Freezer",
    blurb: "What is actually in there right now.",
  },
] as const satisfies ReadonlyArray<{
  key: PantrySection
  label: string
  blurb: string
}>

/**
 * The fixed staple categories, in the order the source inventory lists them.
 *
 * Deliberately a constant rather than `select distinct category`: a category
 * whose last item you delete must still be offered the next time you add
 * something, and a list derived from the rows would simply vanish.
 *
 * Only staples carry a category — a CHECK constraint enforces that the other
 * three sections leave it null.
 */
export const STAPLE_CATEGORIES = [
  "Base",
  "Grains & Rice",
  "Pasta & Noodles",
  "Flours & Baking Staples",
  "Nuts & Seeds",
  "Legumes & Beans",
  "Dried Herbs & Spices",
  "Seasoning Blends, Rubs & Soup Bases",
  "Oils",
  "Vinegars",
  "Sauces, Pastes & Condiments",
  "Broths, Stocks & Bouillon",
  "Wine & Cooking Wine",
  "Canned & Jarred Goods",
  "Dairy, Milk Alternatives & Creams",
  "Sweeteners & Baking Sweets",
  "Fresh Aromatics",
  "Extracts & Flavored Waters",
  "Specialty / International Pantry",
] as const

/**
 * Salt, pepper, butter, milk, eggs, water, oil. The "What can I make?" matcher
 * treats these as always available, so they are never reported as a missing
 * ingredient. That is the whole reason they carry a category of their own
 * rather than sitting uncategorised.
 */
export const BASE_STAPLE_CATEGORY = "Base"

export function isPantrySection(value: unknown): value is PantrySection {
  return PANTRY_SECTIONS.some((section) => section.key === value)
}

export function isStapleCategory(value: unknown): boolean {
  return STAPLE_CATEGORIES.some((category) => category === value)
}

export function sectionLabel(key: PantrySection): string {
  return PANTRY_SECTIONS.find((section) => section.key === key)?.label ?? key
}
