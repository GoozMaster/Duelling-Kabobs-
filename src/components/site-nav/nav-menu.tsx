"use client"

import { ChevronDownIcon } from "lucide-react"
import Link from "next/link"
import { Fragment } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import s from "./site-nav.module.css"

/**
 * A labelled dropdown of links — Recipes and See What's in Stock both use it.
 *
 * The only client component in the nav.
 *
 * Everything else — the wordmark, its image, the two plain links — stays on the
 * server. Scoping the boundary this tightly keeps next/image out of the client
 * graph entirely for the sake of one menu.
 *
 * Each item wraps a real <Link> rather than using onSelect, so the
 * destinations prefetch, open in a new tab on middle-click, and show a URL on
 * hover. A menu whose items are not links is a menu you cannot bookmark.
 */

export type NavMenuItem = {
  href: string
  label: string
  /** Draws a divider under this item, e.g. between "all" and its parts. */
  separatorAfter?: boolean
}

// Utilities rather than module classes: DropdownMenuContent and DropdownMenuItem
// already carry shadcn's own, and tailwind-merge resolves these against them by
// dropping the losers. A module class would merely tie on specificity.
const menu =
  "w-auto min-w-44 rounded-[var(--sk-radius-md)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] p-1 shadow-[var(--sk-shadow-pop)] ring-0"

const item =
  "cursor-pointer rounded-[var(--sk-radius-sm)] px-3 py-2 text-[13px] font-semibold tracking-[0.06em] text-[var(--sk-ink)] uppercase focus:bg-[var(--sk-yellow)] focus:text-[var(--sk-on-yellow)]"

export function NavMenu({ label, items }: { label: string; items: NavMenuItem[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={s.trigger}>
        {label}
        <ChevronDownIcon className={s.chevron} aria-hidden />
      </DropdownMenuTrigger>

      {/* align="end" because the nav sits top-right; the component's own
          default of "start" would hang the panel off the right edge. */}
      <DropdownMenuContent align="end" className={menu}>
        {items.map(({ href, label, separatorAfter }) => (
          <Fragment key={href}>
            <DropdownMenuItem asChild className={item}>
              <Link href={href}>{label}</Link>
            </DropdownMenuItem>
            {separatorAfter && <DropdownMenuSeparator className="mx-1 bg-[var(--sk-outline)]/30" />}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
