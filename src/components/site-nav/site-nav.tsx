import Image from "next/image"
import Link from "next/link"

import { badges } from "@/components/home/logos"

import { NavMenu, type NavMenuItem } from "./nav-menu"
import s from "./site-nav.module.css"

const recipeItems: NavMenuItem[] = [
  { href: "/recipes", label: "All recipes" },
  { href: "/recipes/by-cuisine", label: "By cuisine" },
  { href: "/recipes/surprise", label: "Surprise me" },
]

/**
 * The stock page is admin-only, like the pantry it reads, so a visitor who
 * picks one of these lands on the sign-in page instead. The hashes are the
 * section ids on /admin/stock; arriving on one scrolls it into view, which is
 * what swings its door open.
 */
const stockItems: NavMenuItem[] = [
  { href: "/admin/stock", label: "Everything", separatorAfter: true },
  { href: "/admin/stock#pantry", label: "Pantry" },
  { href: "/admin/stock#fridge", label: "Fridge" },
  { href: "/admin/stock#freezer", label: "Freezer" },
]

/**
 * The shared header.
 *
 * This used to be inlined in the home page, which was the only page that had a
 * nav at all — everywhere else carried a one-off "← Dueling Kebabs" link. Now
 * that Recipes is a menu with three destinations, having it reachable from one
 * page only would mean getting to the globe or the spinner required going home
 * first. Its stylesheet moved out of home.module.css with it, unchanged.
 *
 * The wordmark is the way home now that the ad-hoc back links are gone. It is
 * styled by `.nav .mark`, which out-specifies the `.nav a` rule that would
 * otherwise shrink it to a 13px nav item.
 *
 * Deliberately not in the root layout: on the home page it has to sit after
 * <Overture /> so the intro is never overlaid by a sticky bar. Every page
 * renders it itself instead; the admin routes get it from admin/layout.tsx.
 */
export function SiteNav() {
  return (
    <nav className={s.nav}>
      <Link className={s.mark} href="/">
        <span className={s.disc}>
          <Image src={badges.italian} alt="" width={34} height={34} />
        </span>
        DUELING KEBABS
      </Link>
      <span className={s.spacer} />
      <span className={s.navLinks}>
        <Link href="/what-can-i-make">What can I make?</Link>
        <NavMenu label="Recipes" items={recipeItems} />
        <NavMenu label="See what's in stock" items={stockItems} />
        {/* Admin sign-in. Only one account exists and it is not self-serve, so
            this is a link for the site owner rather than a call to action. */}
        <Link href="/login">Log in</Link>
      </span>
    </nav>
  )
}
