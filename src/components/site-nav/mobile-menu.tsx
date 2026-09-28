"use client"

import { ChevronDownIcon, MenuIcon } from "lucide-react"
import Link from "next/link"
import { Fragment, useState } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
 *
 * Recipes and See What's in Stock are collapsed headings: tapping one shows
 * its links, tapping it again hides them, and both start collapsed every time
 * the menu opens. A heading is itself a menu item, so arrow keys reach it, and
 * selecting it is prevented from closing the menu.
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

const heading = `${item} flex items-center justify-between gap-3`

// Indented so the links read as belonging to the heading above them.
const child = `${item} pl-6`

export function MobileMenu() {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set())

  function toggle(label: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setExpanded(new Set())
      }}
    >
      <DropdownMenuTrigger className={s.trigger}>
        <MenuIcon className={s.menuIcon} aria-hidden />
        Menu
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" collisionPadding={12} className={menu}>
        {groups.map((group, index) => {
          const key = group.label ?? group.items[0].href
          const open = group.label ? expanded.has(group.label) : true

          return (
            <Fragment key={key}>
              {index > 0 && <DropdownMenuSeparator className="mx-1 bg-[var(--sk-outline)]/30" />}

              {group.label && (
                <DropdownMenuItem
                  className={heading}
                  aria-expanded={open}
                  onSelect={(event) => {
                    event.preventDefault()
                    toggle(group.label!)
                  }}
                >
                  {group.label}
                  <ChevronDownIcon
                    aria-hidden
                    className={`size-3.5 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
                  />
                </DropdownMenuItem>
              )}

              {open &&
                group.items.map(({ href, label }) => (
                  <DropdownMenuItem key={href} asChild className={group.label ? child : item}>
                    <Link href={href}>{label}</Link>
                  </DropdownMenuItem>
                ))}
            </Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
