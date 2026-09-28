import type { PantryItem, PantrySection } from "@/lib/pantry"
import { BASE_STAPLE_CATEGORY, STAPLE_CATEGORIES } from "@/lib/pantry"

/**
 * "What's in stock" looks at the same `pantry_items` rows as My Pantry, but
 * sorts them by where they physically live rather than by how the matcher
 * treats them. The four storage sections fold into three places:
 *
 *   - Pantry  — every staple, bar the three Base staples that live cold.
 *   - Fridge  — the fridge list, the fresh standing proteins, butter/milk/eggs.
 *   - Freezer — the freezer list and the standing proteins sold frozen.
 *
 * This is display only. Nothing is moved between sections, so the recipe
 * matcher's idea of "always on hand" is untouched.
 */
export type StockZone = "pantry" | "fridge" | "freezer"

export type StockEntry = {
  item: PantryItem
  /** The heading the item is listed under inside its zone. */
  group: string
  /** Standing proteins are assumed on hand, so they get flagged in the list. */
  standing: boolean
}

export type StockZoneInfo = {
  key: StockZone
  label: string
  /** Where the quick-add form writes. */
  addSection: PantrySection
  blurb: string
}

export const STOCK_ZONES = [
  {
    key: "pantry",
    label: "Pantry",
    addSection: "staple",
    blurb: "Shelf-stable staples, grouped the way the chef skill keeps them.",
  },
  {
    key: "fridge",
    label: "Fridge",
    addSection: "fridge",
    blurb: "Fresh proteins, dairy and whatever else is chilling right now.",
  },
  {
    key: "freezer",
    label: "Freezer",
    addSection: "freezer",
    blurb: "The frozen standing proteins plus anything else you've stashed.",
  },
] as const satisfies ReadonlyArray<StockZoneInfo>

/** Base staples that are kept cold, so they are shown in the fridge. */
const COLD_BASE_STAPLES = new Set(["butter", "milk", "eggs"])

/**
 * Tap water is a Base staple so the matcher never calls it missing, but it is
 * not something you have "in stock", and a jug of it on the pantry shelf reads
 * as a mistake.
 */
const HIDDEN_BASE_STAPLES = new Set(["water"])

export const GROUP_STANDING = "Standing proteins"
export const GROUP_DAIRY = "Dairy & eggs"
export const GROUP_FRIDGE = "Also in the fridge"
export const GROUP_FREEZER = "Also in the freezer"

function zoneFor(item: PantryItem): { zone: StockZone; group: string } | null {
  const name = item.name.trim().toLowerCase()

  switch (item.section) {
    case "staple":
      if (item.category === BASE_STAPLE_CATEGORY) {
        if (HIDDEN_BASE_STAPLES.has(name)) return null
        if (COLD_BASE_STAPLES.has(name)) return { zone: "fridge", group: GROUP_DAIRY }
      }
      return { zone: "pantry", group: item.category ?? "Uncategorised" }
    case "standing_protein":
      // The skill names its frozen proteins "Frozen …"; the rest are fresh.
      return {
        zone: name.startsWith("frozen") ? "freezer" : "fridge",
        group: GROUP_STANDING,
      }
    case "fridge":
      return { zone: "fridge", group: GROUP_FRIDGE }
    case "freezer":
      return { zone: "freezer", group: GROUP_FREEZER }
    default:
      return null
  }
}

/** Order the groups appear in, per zone. Unknown groups sort last. */
const GROUP_ORDER: Record<StockZone, readonly string[]> = {
  pantry: STAPLE_CATEGORIES,
  fridge: [GROUP_STANDING, GROUP_DAIRY, GROUP_FRIDGE],
  freezer: [GROUP_STANDING, GROUP_FREEZER],
}

export type StockGroup = { name: string; entries: StockEntry[] }

export type Stock = Record<StockZone, { entries: StockEntry[]; groups: StockGroup[] }>

export function buildStock(items: PantryItem[]): Stock {
  const byZone: Record<StockZone, StockEntry[]> = { pantry: [], fridge: [], freezer: [] }

  for (const item of items) {
    const placed = zoneFor(item)
    if (!placed) continue
    byZone[placed.zone].push({
      item,
      group: placed.group,
      standing: item.section === "standing_protein",
    })
  }

  const stock = {} as Stock

  for (const zone of Object.keys(byZone) as StockZone[]) {
    const order = GROUP_ORDER[zone]
    const rank = (group: string) => {
      const index = order.indexOf(group)
      return index === -1 ? order.length : index
    }

    const entries = byZone[zone].sort(
      (a, b) => rank(a.group) - rank(b.group) || a.item.name.localeCompare(b.item.name),
    )

    const groups: StockGroup[] = []
    for (const entry of entries) {
      const last = groups.at(-1)
      if (last?.name === entry.group) last.entries.push(entry)
      else groups.push({ name: entry.group, entries: [entry] })
    }

    stock[zone] = { entries, groups }
  }

  return stock
}

/** One plain-English line summing up a zone, for the text summary. */
export function describeZone(zone: StockZone, groups: StockGroup[]): string {
  const total = groups.reduce((sum, group) => sum + group.entries.length, 0)
  if (total === 0) return "Empty."

  if (zone === "pantry") {
    const deepest = [...groups]
      .sort((a, b) => b.entries.length - a.entries.length)
      .slice(0, 2)
      .map((group) => `${group.name} (${group.entries.length})`)
    return `${groups.length} categories, deepest in ${deepest.join(" and ")}.`
  }

  const standing = groups.find((group) => group.name === GROUP_STANDING)?.entries ?? []
  const other = total - standing.length
  const parts: string[] = []
  if (standing.length > 0) {
    parts.push(`${standing.length} standing ${standing.length === 1 ? "protein" : "proteins"}`)
  }
  if (other > 0) parts.push(`${other} other ${other === 1 ? "item" : "items"}`)
  return `${parts.join(" and ")}.`.replace(/^./, (c) => c.toUpperCase())
}
