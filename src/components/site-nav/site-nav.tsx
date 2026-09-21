import Image from "next/image"
import Link from "next/link"

import { badges } from "@/components/home/logos"

import { RecipesMenu } from "./recipes-menu"
import s from "./site-nav.module.css"

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
 * <Overture /> so the intro is never overlaid by a sticky bar, and /login and
 * the admin routes have their own chrome.
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
        <RecipesMenu />
        {/* Admin sign-in. Only one account exists and it is not self-serve, so
            this is a link for the site owner rather than a call to action. */}
        <Link href="/login">Log in</Link>
      </span>
    </nav>
  )
}
