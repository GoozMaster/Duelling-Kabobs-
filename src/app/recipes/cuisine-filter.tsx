"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

type Props = {
  counts: Array<{ name: string; count: number }>
  total: number
  active: string | null
}

const base =
  "border-border inline-flex items-center gap-1.5 rounded-[var(--sk-radius-pill)] border-2 px-3 py-1 text-sm transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)]"

const idle = "bg-card hover:-translate-y-0.5 shadow-[var(--sk-shadow-press)]"
const selected = "bg-primary text-primary-foreground shadow-[var(--sk-shadow-sticker)]"
const empty = "bg-card text-muted-foreground opacity-50"

/**
 * The filter chips toggle cuisine selection. Click to select, click again to
 * revert to "All". Links handle the initial navigation and work with the back
 * button; the client-side toggle happens in the click handler.
 */
export function CuisineFilter({ counts, total, active }: Props) {
  const router = useRouter()

  const handleCuisineClick = (e: React.MouseEvent<HTMLAnchorElement>, name: string) => {
    // If clicking an already-selected cuisine, go back to "All"
    if (active === name) {
      e.preventDefault()
      router.push("/recipes")
    }
  }

  return (
    <nav aria-label="Filter by cuisine" className="flex flex-wrap gap-2">
      <Link
        href="/recipes"
        aria-current={active ? undefined : "page"}
        className={`${base} ${active ? idle : selected}`}
      >
        All
        <span className="text-xs opacity-70">{total}</span>
      </Link>

      {counts.map(({ name, count }) => {
        const isActive = active === name

        // A cuisine with no recipes still shows, greyed and unlinked. The list
        // is a fixed vocabulary; a chip disappearing because its last recipe
        // was deleted is more confusing than one reading 0.
        if (count === 0) {
          return (
            <span key={name} className={`${base} ${empty}`} aria-disabled="true">
              {name}
              <span className="text-xs opacity-70">0</span>
            </span>
          )
        }

        return (
          <Link
            key={name}
            href={`/recipes?cuisine=${encodeURIComponent(name)}`}
            aria-current={isActive ? "page" : undefined}
            className={`${base} ${isActive ? selected : idle}`}
            onClick={(e) => handleCuisineClick(e, name)}
          >
            {name}
            <span className="text-xs opacity-70">{count}</span>
          </Link>
        )
      })}
    </nav>
  )
}
