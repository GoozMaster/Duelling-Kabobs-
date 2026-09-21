import Link from "next/link"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

/**
 * The one recipe tile.
 *
 * This markup existed twice — on the browse grid and in the What can I make?
 * results — and the copies had drifted: the results cards had lost their focus
 * ring entirely, so keyboard users could tab through them with nothing on
 * screen telling them where they were. Extracting the card fixes that by
 * construction rather than by remembering to fix it in two places.
 *
 * No "use client" and no server-only import, so it compiles into both graphs:
 * the browse grid renders it from a client component, every other caller from
 * the server.
 */

type Props = {
  id: string
  title: string
  cuisine: string | null
  /** Rendered in the badge row beside the cuisine — a count, a status badge. */
  meta?: ReactNode
  /** Rendered on its own line below the badges. */
  note?: ReactNode
  /** md is the browse grid's roomier card; sm is the denser results card. */
  size?: "sm" | "md"
}

const base =
  "border-border bg-card hover:-translate-y-0.5 focus-visible:ring-ring/50 flex h-full flex-col rounded-[var(--sk-radius-md)] border-2 shadow-[var(--sk-shadow-press)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] hover:shadow-[var(--sk-shadow-sticker)] focus-visible:ring-[3px] focus-visible:outline-none"

// The browse grid pushes its badge row to the bottom so cards in a row line up
// regardless of title length. The results card has a third line and shouldn't.
const sizes = {
  md: "justify-between gap-3 p-4",
  sm: "gap-2 p-3",
} as const

export function RecipeCard({ id, title, cuisine, meta, note, size = "md" }: Props) {
  return (
    <Link href={`/recipes/${id}`} className={`${base} ${sizes[size]}`}>
      <span className="font-medium">{title}</span>
      <span className="flex flex-wrap items-center gap-2">
        {cuisine && <Badge variant="outline">{cuisine}</Badge>}
        {meta}
      </span>
      {note}
    </Link>
  )
}
