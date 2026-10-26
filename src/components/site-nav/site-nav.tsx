import Image from "next/image"
import Link from "next/link"

import { scenes } from "@/components/home/logos"

import { recipeItems, stockEverything, stockSections } from "./links"
import s from "./site-nav.module.css"
import { StaggeredMenu, type StaggeredMenuItem } from "./staggered-menu"

/**
 * The shared header.
 *
 * A sticky bar with the wordmark on the left and one Menu toggle on the right,
 * at every width. The toggle opens a side panel (see staggered-menu.tsx) that
 * holds every destination, so there is a single navigation to keep honest
 * instead of a desktop row plus a phone dropdown.
 *
 * The wordmark is the way home. It is rendered here, on the server, and handed
 * to the menu as a prop, which keeps next/image out of the client graph.
 *
 * Deliberately not in the root layout: on the home page it has to sit after
 * <Overture /> so the intro is never overlaid by a sticky bar. Every page
 * renders it itself instead; the admin routes get it from admin/layout.tsx.
 */

const items: StaggeredMenuItem[] = [
  { label: "What can I make?", href: "/what-can-i-make" },
  { label: "Recipes", links: recipeItems },
  { label: "What's in stock", links: [stockEverything, ...stockSections] },
  // Admin sign-in. Only one account exists and it is not self-serve, so this
  // is a link for the site owner rather than a call to action.
  { label: "Log in", href: "/login" },
]

export function SiteNav() {
  return (
    <StaggeredMenu
      items={items}
      logo={
        <Link className={s.mark} href="/">
          <span className={s.disc}>
            <Image src={scenes.downWithHungerMark} alt="" width={40} height={40} />
          </span>
          DOWN WITH HUNGER
        </Link>
      }
    />
  )
}
