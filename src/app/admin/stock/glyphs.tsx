import type { CSSProperties, ReactNode } from "react"

import type { StockEntry, StockGroup, StockZone } from "@/lib/stock"
import { GROUP_DAIRY } from "@/lib/stock"

import s from "./stock.module.css"

/**
 * The little jars, cans and cartons that stand on the shelves.
 *
 * One glyph is one real item, so a sparse fridge looks sparse. Each carries a
 * <title>, so hovering a jar tells you which one it is.
 */
export type GlyphKind =
  | "jar"
  | "spice"
  | "can"
  | "box"
  | "bottle"
  | "bag"
  | "produce"
  | "carton"
  | "eggs"
  | "block"
  | "tray"
  | "fish"
  | "shrimp"
  | "tub"
  | "frozenBag"

/** Width and height in viewBox units, so the shelf packer can plan ahead. */
const SIZE: Record<GlyphKind, [number, number]> = {
  jar: [15, 20],
  spice: [9, 15],
  can: [13, 17],
  box: [16, 25],
  bottle: [9, 30],
  bag: [18, 20],
  produce: [13, 13],
  carton: [15, 28],
  eggs: [30, 11],
  block: [20, 10],
  tray: [30, 12],
  fish: [36, 13],
  shrimp: [22, 14],
  tub: [20, 16],
  frozenBag: [24, 22],
}

const CATEGORY_GLYPH: Record<string, GlyphKind> = {
  "Grains & Rice": "bag",
  "Pasta & Noodles": "box",
  "Flours & Baking Staples": "bag",
  "Nuts & Seeds": "jar",
  "Legumes & Beans": "can",
  "Dried Herbs & Spices": "spice",
  "Seasoning Blends, Rubs & Soup Bases": "spice",
  Oils: "bottle",
  Vinegars: "bottle",
  "Sauces, Pastes & Condiments": "jar",
  "Broths, Stocks & Bouillon": "box",
  "Wine & Cooking Wine": "bottle",
  "Canned & Jarred Goods": "can",
  "Dairy, Milk Alternatives & Creams": "can",
  "Sweeteners & Baking Sweets": "jar",
  "Fresh Aromatics": "produce",
  "Extracts & Flavored Waters": "bottle",
  "Specialty / International Pantry": "jar",
}

function coldGlyph(entry: StockEntry, zone: StockZone): GlyphKind {
  const name = entry.item.name.toLowerCase()

  if (/salmon|fish|cod|tuna|tilapia/.test(name)) return "fish"
  if (/shrimp|prawn|scallop/.test(name)) return "shrimp"
  if (/chicken|beef|steak|pork|lamb|turkey|sausage|bacon|meat|mince/.test(name)) {
    return zone === "freezer" ? "frozenBag" : "tray"
  }
  if (/egg/.test(name)) return "eggs"
  if (/milk|cream|juice|kefir|buttermilk/.test(name)) return "carton"
  if (/butter|cheese|tofu|paneer/.test(name)) return "block"
  if (/yogurt|yoghurt|ice cream|hummus|dip|sorbet/.test(name)) return "tub"
  if (/sauce|dressing|mustard|ketchup|mayo|wine|beer|soda/.test(name)) return "bottle"
  if (
    /apple|lemon|lime|orange|tomato|pepper|onion|berry|berries|grape|avocado|cucumber|carrot|herb|cilantro|parsley|mint|lettuce|spinach|kale|greens|pea|corn/.test(
      name,
    )
  ) {
    return zone === "freezer" ? "frozenBag" : "produce"
  }
  return zone === "freezer" ? "frozenBag" : entry.group === GROUP_DAIRY ? "block" : "tub"
}

export function glyphKind(entry: StockEntry, zone: StockZone): GlyphKind {
  if (zone === "pantry") return CATEGORY_GLYPH[entry.group] ?? "jar"
  return coldGlyph(entry, zone)
}

/** Stable per-name colour, so the same jar is the same colour every visit. */
function tone(name: string): string {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return s[`t${Math.abs(hash) % 6}`]
}

export type Shelf = { left: number; right: number; floor: number }

export type PlacedGlyph = {
  entry: StockEntry
  kind: GlyphKind
  x: number
  y: number
}

const GAP = 2.5

/**
 * Packs glyphs onto shelves left to right, and says how many did not fit.
 *
 * When a zone holds more than the shelves can show — the pantry holds 250 —
 * the picks are dealt round-robin across groups first, so every category gets
 * at least a jar on the shelf before any category gets a tenth. They are then
 * put back in group order, so the shelves still read as sorted.
 */
export function packShelves(
  groups: StockGroup[],
  zone: StockZone,
  shelves: Shelf[],
): { placed: PlacedGlyph[]; overflow: number } {
  const total = groups.reduce((sum, group) => sum + group.entries.length, 0)
  const room = shelves.reduce((sum, shelf) => sum + (shelf.right - shelf.left), 0) * 0.94

  const chosen = new Set<StockEntry>()
  let used = 0
  const deepest = Math.max(0, ...groups.map((group) => group.entries.length))
  for (let round = 0; round < deepest; round++) {
    for (const group of groups) {
      const entry = group.entries[round]
      if (!entry) continue
      const width = SIZE[glyphKind(entry, zone)][0] + GAP
      // Skip rather than stop: a narrow spice jar may still fit where a box did not.
      if (used + width > room) continue
      chosen.add(entry)
      used += width
    }
  }

  const placed: PlacedGlyph[] = []
  let shelfIndex = 0
  let x = shelves[0]?.left ?? 0

  for (const group of groups) {
    for (const entry of group.entries) {
      if (!chosen.has(entry)) continue
      const kind = glyphKind(entry, zone)
      const [width] = SIZE[kind]

      while (shelfIndex < shelves.length && x + width > shelves[shelfIndex].right) {
        shelfIndex++
        x = shelves[shelfIndex]?.left ?? 0
      }
      if (shelfIndex >= shelves.length) break

      placed.push({ entry, kind, x, y: shelves[shelfIndex].floor })
      x += width + GAP
    }
  }

  return { placed, overflow: total - placed.length }
}

/** Draws one glyph with its bottom-left corner at (x, y). */
export function Glyph({ glyph, index }: { glyph: PlacedGlyph; index: number }) {
  const { kind, x, y, entry } = glyph
  const [w, h] = SIZE[kind]
  const t = tone(entry.item.name)
  const top = y - h

  let body: ReactNode
  switch (kind) {
    case "jar":
      body = (
        <>
          <rect className={t} x={x} y={top + 4} width={w} height={h - 4} rx={3} />
          <rect className={s.lid} x={x + 1.5} y={top} width={w - 3} height={5} rx={1.5} />
          <rect className={s.label} x={x + 2} y={top + 9} width={w - 4} height={6} rx={1} />
        </>
      )
      break
    case "spice":
      body = (
        <>
          <rect className={s.glass} x={x} y={top + 4} width={w} height={h - 4} rx={2} />
          <rect className={t} x={x + 1} y={top + 8} width={w - 2} height={h - 9} rx={1.5} />
          <rect className={s.lid} x={x + 0.5} y={top} width={w - 1} height={4.5} rx={1} />
        </>
      )
      break
    case "can":
      body = (
        <>
          <rect className={t} x={x} y={top} width={w} height={h} rx={2} />
          <rect className={s.label} x={x} y={top + 5} width={w} height={7} />
          <line className={s.rim} x1={x} x2={x + w} y1={top + 2} y2={top + 2} />
        </>
      )
      break
    case "box":
      body = (
        <>
          <rect className={t} x={x} y={top} width={w} height={h} rx={1.5} />
          <rect className={s.label} x={x + 2.5} y={top + 7} width={w - 5} height={9} rx={1} />
        </>
      )
      break
    case "bottle":
      body = (
        <path
          className={t}
          d={`M${x + 3} ${top} h${w - 6} v7 q3 2 3 6 v${h - 14} q0 1 -1 1 h${-(w - 2)} q-1 0 -1 -1 v${-(h - 14)} q0 -4 3 -6 z`}
        />
      )
      break
    case "bag":
      body = (
        <>
          <path
            className={t}
            d={`M${x + 1} ${top + 4} l2 -4 l2 4 l2 -4 l2 4 l2 -4 l2 4 l2 -4 l2 4 L${x + w} ${y - 3} Q${x + w} ${y} ${x + w - 3} ${y} H${x + 3} Q${x} ${y} ${x} ${y - 3} Z`}
          />
          <rect className={s.label} x={x + 4} y={top + 8} width={w - 8} height={6} rx={1} />
        </>
      )
      break
    case "produce":
      body = (
        <>
          <circle className={t} cx={x + w / 2} cy={y - h / 2} r={w / 2} />
          <path className={s.leaf} d={`M${x + w / 2} ${top + 1} q3 -4 6 -2 q-3 3 -6 2 z`} />
        </>
      )
      break
    case "carton":
      body = (
        <>
          <path className={s.carton} d={`M${x} ${top + 8} l${w / 2} -8 l${w / 2} 8 v${h - 8} h${-w} z`} />
          <rect className={t} x={x + 2} y={top + 13} width={w - 4} height={9} rx={1} />
        </>
      )
      break
    case "eggs":
      body = (
        <>
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} className={s.egg} cx={x + 4.5 + i * 7} cy={top + 3} rx={3.2} ry={4} />
          ))}
          <rect className={s.eggTray} x={x} y={top + 4} width={w} height={h - 4} rx={2} />
        </>
      )
      break
    case "block":
      body = (
        <>
          <rect className={s.butter} x={x} y={top} width={w} height={h} rx={1.5} />
          <line className={s.rim} x1={x + w * 0.35} x2={x + w * 0.35} y1={top} y2={y} />
        </>
      )
      break
    case "tray":
      body = (
        <>
          <rect className={s.meatTray} x={x} y={top + 3} width={w} height={h - 3} rx={2} />
          <ellipse className={s.meat} cx={x + w / 2} cy={top + 6} rx={w / 2 - 4} ry={4} />
        </>
      )
      break
    case "fish":
      body = (
        <>
          <path
            className={s.salmon}
            d={`M${x} ${y - h / 2} q${w * 0.4} ${-h * 0.8} ${w * 0.78} 0 l${w * 0.22} ${-h / 2.4} v${h / 1.2} l${-w * 0.22} ${-h / 2.4} q${-w * 0.38} ${h * 0.8} ${-w * 0.78} 0 z`}
          />
          <circle className={s.eye} cx={x + 5} cy={y - h / 2 - 1} r={1.2} />
        </>
      )
      break
    case "shrimp":
      body = (
        <path
          className={s.shrimp}
          d={`M${x + 4} ${y - 1} A${w / 2 - 4} ${h - 2} 0 0 1 ${x + w - 1} ${y - 1} H${x + w - 6} A${w / 2 - 8} ${h - 7} 0 0 0 ${x + 9} ${y - 1} Z M${x + 4} ${y - 1} l-4 -3 l1 5 z`}
        />
      )
      break
    case "tub":
      body = (
        <>
          <path className={t} d={`M${x} ${top + 4} h${w} l-2 ${h - 4} h${-(w - 4)} z`} />
          <rect className={s.lid} x={x - 1} y={top} width={w + 2} height={4.5} rx={1.5} />
        </>
      )
      break
    case "frozenBag":
      body = (
        <>
          <path
            className={s.freezerBag}
            d={`M${x} ${top + 4} h${w} l-1 ${h - 6} q0 2 -2 2 h${-(w - 6)} q-2 0 -2 -2 z`}
          />
          <rect className={t} x={x + 1} y={top} width={w - 2} height={4} rx={1} />
          <rect className={s.label} x={x + 4} y={top + 9} width={w - 8} height={6} rx={1} />
        </>
      )
      break
  }

  return (
    <g className={s.glyph} style={{ "--i": index } as CSSProperties}>
      <title>{entry.item.name}</title>
      {body}
    </g>
  )
}
