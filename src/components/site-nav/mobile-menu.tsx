"use client"

import { MenuIcon } from "lucide-react"
import Link from "next/link"
import { Fragment } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { recipeItems } from "./recipes-menu"
import s from "./site-nav.module.css"
import { stockEverything, stockSections } from "./stock-menu"

/**
 * The phone header: one Menu button holding every link and both dropdowns.
 *
 * At 640px and under the separate links do not fit beside the wordmark, and
 * wrapping them stacked the bar four rows tall. CSS swaps this in for them
 * (see `.mobileMenu` in the stylesheet), so the desktop header is untouched.
 *
 * The link lists are imported from the desktop menus rather than restated, so
 * the two headers cannot drift apart.
 */

type Group = { label?: string; items: { href: string; label: string }[] }

const groups: Group[] = [
  { items: [{ href: "/what-can-i-make", label: "What can I make?" }] },
  { label: "Recipes", items: recipeItems },
  { label: "See what's in stock", items: [stockEverything, ...stockSections] },
  { items: [{ href: "/login", label: "Log in" }] },
]

// The same panel and item utilities as the desktop dropdowns. The max height
// uses Radix's measured free space, so on a short screen the panel scrolls
// instead of running off the bottom.
const menu =
  "w-auto min-w-56 max-h-[var(--radix-dropdown-menu-content-available-height)] overflow-y-auto rounded-[var(--sk-radius-md)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] p-1 shadow-[var(--sk-shadow-pop)] ring-0"

const item =
  "cursor-pointer rounded-[var(--sk-radius-sm)] px-3 py-2 text-[13px] font-semibold tracking-[0.06em] text-[var(--sk-ink)] uppercase focus:bg-[var(--sk-yellow)] focus:text-[var(--sk-on-yellow)]"

const heading =
  "px-3 pt-2 pb-1 text-[11px] font-semibold tracking-[0.08em] text-[var(--sk-ink-muted)] uppercase"

export function MobileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={s.trigger}>
        <MenuIcon className={s.menuIcon} aria-hidden />
        Menu
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" collisionPadding={12} className={menu}>
        {groups.map((group, index) => (
          <Fragment key={group.label ?? group.items[0].href}>
            {index > 0 && <DropdownMenuSeparator className="mx-1 bg-[var(--sk-outline)]/30" />}
            {group.label && <DropdownMenuLabel className={heading}>{group.label}</DropdownMenuLabel>}
            {group.items.map(({ href, label }) => (
              <DropdownMenuItem key={href} asChild className={item}>
                <Link href={href}>{label}</Link>
              </DropdownMenuItem>
            ))}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
