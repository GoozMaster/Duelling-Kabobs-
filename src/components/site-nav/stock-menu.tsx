"use client"

import { ChevronDownIcon } from "lucide-react"
import Link from "next/link"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import s from "./site-nav.module.css"

/**
 * The way into What's in Stock, from any page.
 *
 * Deliberately its own component rather than a generalised RecipesMenu, so
 * the recipe menu stays exactly as it is. It borrows that menu's trigger
 * styles and panel utilities so the two read as a pair.
 *
 * The stock page is public and view-only for everyone but the admin. The
 * hashes are the section ids on /stock; arriving on one scrolls it into view,
 * which is what swings its door open.
 */

export const stockEverything = { href: "/stock", label: "Everything" }

export const stockSections = [
  { href: "/stock#pantry", label: "Pantry" },
  { href: "/stock#fridge", label: "Fridge" },
  { href: "/stock#freezer", label: "Freezer" },
]

// Same utilities as RecipesMenu; see the note there on why they are not
// module classes.
const menu =
  "w-auto min-w-44 rounded-[var(--sk-radius-md)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] p-1 shadow-[var(--sk-shadow-pop)] ring-0"

const item =
  "cursor-pointer rounded-[var(--sk-radius-sm)] px-3 py-2 text-[13px] font-semibold tracking-[0.06em] text-[var(--sk-ink)] uppercase focus:bg-[var(--sk-yellow)] focus:text-[var(--sk-on-yellow)]"

export function StockMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={s.trigger}>
        See what&apos;s in stock
        <ChevronDownIcon className={s.chevron} aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={menu}>
        <DropdownMenuItem asChild className={item}>
          <Link href={stockEverything.href}>{stockEverything.label}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mx-1 bg-[var(--sk-outline)]/30" />
        {stockSections.map(({ href, label }) => (
          <DropdownMenuItem key={href} asChild className={item}>
            <Link href={href}>{label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
