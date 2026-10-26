import Image from "next/image"
import type { ReactNode } from "react"

import { badgeForCuisine } from "@/components/home/logos"

/**
 * The picture for a cuisine, filling whatever disc the caller draws around it.
 *
 * Four cuisines have raster badges. The rest used to show their initial in the
 * display face, which read as a missing image the moment it sat beside a drawn
 * one — "A", "D", "B" in a row of chefs. These are drawn instead, in the
 * badges' own manner: flat fills, a heavy ink keyline, nothing blurred.
 *
 * The ink is literal hex rather than --sk-outline for the same reason the
 * raster badges never re-theme: the drawing carries its own ground, so in
 * Night Kitchen a cream keyline would vanish into it.
 */

const INK = "#16233f"

type Drawing = { ground: string; body: ReactNode }

const line = {
  stroke: INK,
  strokeWidth: 3.5,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const

const DRAWINGS: Record<string, Drawing> = {
  American: {
    ground: "#f8ddd6",
    body: (
      <>
        <path d="M22 70h56v5a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6z" fill="#f5a623" {...line} />
        <rect x="18" y="58" width="64" height="12" rx="6" fill="#7a3f1d" {...line} />
        <path d="M24 58h52l-6 9-7-6-7 8-7-8-7 7-7-7z" fill="#ffd90f" {...line} />
        <path
          d="M18 56c4 5 8 5 11 0 4 5 8 5 11 0 4 5 8 5 11 0 4 5 8 5 11 0 4 5 8 5 11 0z"
          fill="#2f7d4f"
          {...line}
        />
        <path d="M20 54c0-18 13-28 30-28s30 10 30 28z" fill="#f5a623" {...line} />
        <g fill="#fdf6e3">
          <ellipse cx="38" cy="38" rx="2.4" ry="1.5" transform="rotate(-20 38 38)" />
          <ellipse cx="51" cy="33" rx="2.4" ry="1.5" />
          <ellipse cx="63" cy="40" rx="2.4" ry="1.5" transform="rotate(20 63 40)" />
          <ellipse cx="46" cy="45" rx="2.4" ry="1.5" transform="rotate(-10 46 45)" />
        </g>
      </>
    ),
  },
  Breads: {
    ground: "#d8eff1",
    body: (
      <>
        <path
          d="M16 70c-3-20 8-34 34-36 26 2 37 16 34 36 0 5-4 8-9 8H25c-5 0-9-3-9-8z"
          fill="#d98a3a"
          {...line}
        />
        <path d="M30 52c3-6 6-9 10-10M46 50c3-6 6-9 10-10M62 52c2-5 4-7 7-8" fill="none" {...line} />
        <path d="M22 70h56" fill="none" stroke="#f5c27a" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  Desserts: {
    ground: "#ffd90f",
    body: (
      <>
        <path d="M30 58h40l-6 24H36z" fill="#8ecae6" {...line} />
        <path d="M43 60l2 20M50 60v20M57 60l-2 20" fill="none" {...line} strokeWidth={2.5} />
        <path
          d="M25 58c-3-8 3-14 11-14 0-9 7-15 14-15s14 6 14 15c8 0 14 6 11 14z"
          fill="#f6a5c0"
          {...line}
        />
        <path d="M36 50c4-3 9-3 14 0s10 3 14 0" fill="none" {...line} strokeWidth={2.5} />
        <path d="M50 24c1-5 4-8 8-9" fill="none" {...line} />
        <circle cx="50" cy="26" r="6" fill="#a8382b" {...line} />
      </>
    ),
  },
  Drinks: {
    ground: "#dcf0e2",
    body: (
      <>
        <path d="M56 46 70 14" fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
        <path d="M56 46 70 14" fill="none" stroke="#a8382b" strokeWidth="4" strokeLinecap="round" />
        <path d="M33 30h34l-4 52H37z" fill="#ffffff" {...line} />
        <path d="M34.5 44h31l-3 38h-25z" fill="#f5a623" />
        <path d="M33 30h34l-4 52H37z" fill="none" {...line} />
        <path d="M35 44h30" fill="none" {...line} strokeWidth={2.5} />
        <circle cx="67" cy="31" r="10" fill="#ffd90f" {...line} />
        <path d="M67 23v16M59 31h16M61.5 25.5l11 11M72.5 25.5l-11 11" stroke="#f5a623" strokeWidth="2" />
        <circle cx="67" cy="31" r="10" fill="none" {...line} />
      </>
    ),
  },
  Latin: {
    ground: "#d8eff1",
    body: (
      <>
        <path d="M24 50c4-8 9-8 12-3 3-7 9-7 12-1 3-6 9-6 12 0 3-5 9-4 12 3l-48 9z" fill="#2f7d4f" {...line} />
        <circle cx="38" cy="49" r="5" fill="#a8382b" {...line} strokeWidth={3} />
        <circle cx="60" cy="48" r="5" fill="#a8382b" {...line} strokeWidth={3} />
        <path d="M44 52c2-4 6-5 9-2" fill="none" stroke="#ffd90f" strokeWidth="4" strokeLinecap="round" />
        <path d="M16 56a34 30 0 0 0 68 0z" fill="#f5a623" {...line} />
        <g fill="#d98a3a">
          <circle cx="34" cy="68" r="2" />
          <circle cx="50" cy="74" r="2" />
          <circle cx="64" cy="67" r="2" />
        </g>
      </>
    ),
  },
  Indian: {
    ground: "#edcf9d",
    body: (
      <>
        <path d="M38 34c-4-5 4-8 0-14M50 32c-4-5 4-8 0-14M62 34c-4-5 4-8 0-14" fill="none" {...line} strokeWidth={3} />
        <path d="M16 50h68c-1 18-16 30-34 30S17 68 16 50z" fill="#1f7a84" {...line} />
        <ellipse cx="50" cy="50" rx="34" ry="8" fill="#f5a623" {...line} />
        <path d="M44 48c4-5 10-5 14 0-4 3-10 3-14 0z" fill="#2f7d4f" {...line} strokeWidth={2.5} />
        <circle cx="34" cy="50" r="2.4" fill="#a8382b" />
        <circle cx="66" cy="49" r="2.4" fill="#a8382b" />
      </>
    ),
  },
  Other: {
    ground: "#dcf0e2",
    body: (
      <>
        <circle cx="50" cy="52" r="26" fill="#ffffff" {...line} />
        <circle cx="50" cy="52" r="17" fill="none" {...line} strokeWidth={2.5} />
        <path d="M14 30v14a5 5 0 0 0 10 0V30M19 30v14M19 49v32" fill="none" {...line} />
        <path d="M82 81V30c-6 4-8 12-8 22h8" fill="#d8eff1" {...line} />
      </>
    ),
  },
}

export function hasCuisineArt(name: string): boolean {
  return Boolean(badgeForCuisine(name) ?? DRAWINGS[name])
}

/**
 * Fills its parent. The parent owns the disc: its size, keyline and clip.
 * `px` is the rendered size, used only to pick the raster's resolution.
 */
export function CuisineArt({ name, px }: { name: string; px: number }) {
  const badge = badgeForCuisine(name)

  if (badge) {
    return (
      <Image
        src={badge}
        alt=""
        width={px}
        height={px}
        // Eager: several callers roll or slide these in from off-screen, and a
        // lazy loader would leave an empty ring for the first half of it.
        loading="eager"
        className="block size-full object-cover"
      />
    )
  }

  const drawing = DRAWINGS[name] ?? DRAWINGS.Other

  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className="block size-full">
      <rect width="100" height="100" fill={drawing.ground} />
      {drawing.body}
    </svg>
  )
}
