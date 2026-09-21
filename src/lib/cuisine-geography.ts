/**
 * Which countries stand for which cuisine on the globe.
 *
 * Hardcoded here rather than stored in the database, for the same reason
 * `cuisineBadges` in components/home/logos.ts is hardcoded: this is
 * presentation vocabulary bound to one particular map file's feature ids, not
 * user data. It changes when the *map* changes, never when the recipes do, so
 * a table and a join would be machinery in service of nothing.
 *
 * Ids are ISO 3166-1 numeric codes as world-atlas' countries-110m.json spells
 * them — STRINGS, because several carry a leading zero ("032" Argentina, "068"
 * Bolivia) that a number would eat. Every entry below was resolved against the
 * real feature list rather than written from memory; adding one means checking
 * it is actually in the 110m file, since small nations (Singapore, Hong Kong,
 * most of the Caribbean) are absent or sub-pixel at this resolution.
 *
 * ONE COUNTRY, ONE CUISINE. Italy and France are Mediterranean in life but
 * have their own cuisines in this collection, so precedence is written down
 * rather than left to whichever rule happens to run first.
 *
 * Countries not listed are not a gap. They render as plain land: real
 * geography the globe draws but does not claim.
 */

export type CuisineCountry = {
  /** ISO 3166-1 numeric, as a string. */
  id: string
  /** Carried so the table can be reviewed without a codebook. */
  name: string
  cuisine: string
}

export const CUISINE_COUNTRIES: CuisineCountry[] = [
  { id: "380", name: "Italy", cuisine: "Italian" },

  { id: "250", name: "France", cuisine: "French" },

  // The United States only. Canada reading as "American cuisine" adds nothing
  // and is a small unnecessary argument to pick.
  { id: "840", name: "United States of America", cuisine: "American" },

  { id: "156", name: "China", cuisine: "Asian" },
  { id: "392", name: "Japan", cuisine: "Asian" },
  { id: "410", name: "South Korea", cuisine: "Asian" },
  { id: "158", name: "Taiwan", cuisine: "Asian" },
  { id: "704", name: "Vietnam", cuisine: "Asian" },
  { id: "764", name: "Thailand", cuisine: "Asian" },
  { id: "116", name: "Cambodia", cuisine: "Asian" },
  { id: "418", name: "Laos", cuisine: "Asian" },
  { id: "104", name: "Myanmar", cuisine: "Asian" },
  { id: "458", name: "Malaysia", cuisine: "Asian" },
  { id: "360", name: "Indonesia", cuisine: "Asian" },
  { id: "608", name: "Philippines", cuisine: "Asian" },

  // India alone rather than the whole subcontinent: the cuisine has one recipe
  // in it, and a five-country blob would claim a great deal on that evidence.
  { id: "356", name: "India", cuisine: "Indian" },

  { id: "300", name: "Greece", cuisine: "Mediterranean" },
  { id: "792", name: "Turkey", cuisine: "Mediterranean" },
  { id: "196", name: "Cyprus", cuisine: "Mediterranean" },
  { id: "422", name: "Lebanon", cuisine: "Mediterranean" },
  { id: "376", name: "Israel", cuisine: "Mediterranean" },
  { id: "760", name: "Syria", cuisine: "Mediterranean" },
  // Spain and Portugal go Mediterranean, not Latin: "Latin" in this collection
  // means Latin *America*.
  { id: "724", name: "Spain", cuisine: "Mediterranean" },
  { id: "620", name: "Portugal", cuisine: "Mediterranean" },
  { id: "504", name: "Morocco", cuisine: "Mediterranean" },
  { id: "788", name: "Tunisia", cuisine: "Mediterranean" },

  { id: "484", name: "Mexico", cuisine: "Latin" },
  { id: "320", name: "Guatemala", cuisine: "Latin" },
  { id: "340", name: "Honduras", cuisine: "Latin" },
  { id: "222", name: "El Salvador", cuisine: "Latin" },
  { id: "558", name: "Nicaragua", cuisine: "Latin" },
  { id: "188", name: "Costa Rica", cuisine: "Latin" },
  { id: "591", name: "Panama", cuisine: "Latin" },
  { id: "192", name: "Cuba", cuisine: "Latin" },
  { id: "214", name: "Dominican Rep.", cuisine: "Latin" },
  { id: "170", name: "Colombia", cuisine: "Latin" },
  { id: "862", name: "Venezuela", cuisine: "Latin" },
  { id: "218", name: "Ecuador", cuisine: "Latin" },
  { id: "604", name: "Peru", cuisine: "Latin" },
  { id: "068", name: "Bolivia", cuisine: "Latin" },
  { id: "076", name: "Brazil", cuisine: "Latin" },
  { id: "152", name: "Chile", cuisine: "Latin" },
  { id: "032", name: "Argentina", cuisine: "Latin" },
  { id: "858", name: "Uruguay", cuisine: "Latin" },
  { id: "600", name: "Paraguay", cuisine: "Latin" },

  // Drinks, Breads, Desserts and Other have no geography at all. That is not an
  // omission — it is why the tile row under the globe is the complete way in
  // and the globe is the pretty one.
]

const BY_ID = new Map(CUISINE_COUNTRIES.map((row) => [row.id, row]))

export function cuisineForCountry(id: string | number | undefined): string | null {
  return id === undefined ? null : (BY_ID.get(String(id))?.cuisine ?? null)
}

/**
 * The faces the globe can be turned to.
 *
 * Rotation is navigation rather than a gesture: each face is a link, so the
 * back button and a shared URL both work, which is the same reasoning the
 * cuisine filter chips are built on. The drag enhancement layers on top of
 * these without replacing them.
 */
export const GLOBE_FACES = {
  old: { label: "Old World", rotate: [-10, -20] as [number, number] },
  americas: { label: "Americas", rotate: [85, -15] as [number, number] },
  pacific: { label: "Pacific", rotate: [-115, -15] as [number, number] },
}

export type GlobeFace = keyof typeof GLOBE_FACES

export function isGlobeFace(value: string | undefined): value is GlobeFace {
  return value !== undefined && value in GLOBE_FACES
}

/**
 * Flat cel fills, one per geographic cuisine.
 *
 * Picked from the Springfield palette so no two adjacent regions collide:
 * Mediterranean and Italian share a border, as do Italian and French, so those
 * three are deliberately far apart in hue.
 */
export const CUISINE_FILL: Record<string, string> = {
  Italian: "var(--sk-basil)",
  French: "var(--sk-teal)",
  Asian: "var(--sk-brick)",
  Indian: "var(--sk-gold)",
  Mediterranean: "var(--sk-yellow)",
  American: "var(--sk-teal)",
  Latin: "var(--sk-brick)",
}
