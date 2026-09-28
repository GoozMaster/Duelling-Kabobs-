"use client"

import { ChevronDownIcon } from "lucide-react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import s from "./site-nav.module.css"

/**
 * The only client component in the nav.
 *
 * Everything else — the wordmark, its image, the two plain links — stays on the
 * server. Scoping the boundary this tightly keeps next/image out of the client
 * graph entirely for the sake of one menu.
 *
 * Each item wraps a real <Link> rather than using onSelect, so the three
 * destinations prefetch, open in a new tab on middle-click, and show a URL on
 * hover. A menu whose items are not links is a menu you cannot bookmark.
 */

const items = [
  { href: "/recipes", label: "All recipes" },
  { href: "/recipes/by-cuisine", label: "By cuisine" },
  { href: "/recipes/surprise", label: "Surprise me" },
]

// Utilities rather than module classes: DropdownMenuContent and DropdownMenuItem
// already carry shadcn's own, and tailwind-merge resolves these against them by
// dropping the losers. A module class would merely tie on specificity.
const menu =
  "w-auto min-w-44 rounded-[var(--sk-radius-md)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] p-1 shadow-[var(--sk-shadow-pop)] ring-0"

const item =
  "cursor-pointer rounded-[var(--sk-radius-sm)] px-3 py-2 text-[13px] font-semibold tracking-[0.06em] text-[var(--sk-ink)] uppercase focus:bg-[var(--sk-yellow)] focus:text-[var(--sk-on-yellow)]"

export function RecipesMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={s.trigger}>
        Recipes
        <ChevronDownIcon className={s.chevron} aria-hidden />
      </DropdownMenuTrigger>

      {/* align="end" because the nav sits top-right; the component's own
          default of "start" would hang the panel off the right edge. */}
      <DropdownMenuContent align="end" className={menu}>
        {items.map(({ href, label }) => (
          <DropdownMenuItem key={href} asChild className={item}>
            <Link href={href}>{label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
