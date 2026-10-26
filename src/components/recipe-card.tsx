import Link from "next/link"
import type { ReactNode } from "react"

import { CuisineArt } from "@/components/cuisine-art"

/**
 * The one recipe tile.
 *
 * This markup existed twice — on the browse grid and in the What can I make?
 * results — and the copies had drifted: the results cards had lost their focus
 * ring entirely, so keyboard users could tab through them with nothing on
 * screen telling them where they were. Extracting the card fixes that by
 * construction rather than by remembering to fix it in two places.
 *
 * Each tile leads with its cuisine's picture, so a page of 127 titles has
 * something to scan by besides the words.
 *
 * No "use client" and no server-only import, so it compiles into both graphs:
 * the browse grid renders it from a client component, every other caller from
 * the server.
 */

type Props = {
  id: string
  title: string
  cuisine: string | null
  /** Rendered beside the cuisine name — a count, a status badge. */
  meta?: ReactNode
  /** Rendered on its own line below. */
  note?: ReactNode
  /** md is the browse grid's roomier card; sm is the denser results card. */
  size?: "sm" | "md"
}

const base =
  "group grid h-full grid-cols-[auto_minmax(0,1fr)] items-start gap-4 rounded-[var(--sk-radius-lg)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] text-[var(--sk-ink)] shadow-[var(--sk-shadow-press)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--sk-shadow-sticker)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"

const sizes = {
  md: { card: "p-4", disc: "size-14", px: 56 },
  sm: { card: "p-4", disc: "size-12", px: 48 },
} as const

export function RecipeCard({ id, title, cuisine, meta, note, size = "md" }: Props) {
  const s = sizes[size]

  return (
    <Link href={`/recipes/${id}`} className={`${base} ${s.card}`}>
      <span
        className={`${s.disc} shrink-0 overflow-hidden rounded-full border-[3px] border-[var(--sk-outline)]`}
      >
        <CuisineArt name={cuisine ?? "Other"} px={s.px} />
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className="text-[17px] leading-snug font-semibold text-balance">{title}</span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px]">
          {cuisine && <span>{cuisine}</span>}
          {meta}
        </span>
        {note}
      </span>
    </Link>
  )
}
