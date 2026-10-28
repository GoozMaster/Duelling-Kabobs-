import Image from "next/image"
import Link from "next/link"

import { signOut } from "@/app/login/actions"
import { scenes } from "@/components/home/logos"
import { isAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

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

const baseItems: StaggeredMenuItem[] = [
  { label: "What can I make?", href: "/what-can-i-make", accent: true },
  { label: "Recipes", links: recipeItems },
  { label: "What's in stock", links: [stockEverything, ...stockSections] },
]

export async function SiteNav() {
  // Admin sign-in. Only one account exists and it is not self-serve, so this
  // is for the site owner rather than a call to action. Once signed in it turns
  // into Log out so it is clear a session is open.
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const signedIn = isAdmin(data.user?.email)

  const items: StaggeredMenuItem[] = [
    ...baseItems,
    signedIn
      ? { label: "Log out", action: signOut }
      : { label: "Log in", href: "/login" },
  ]

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
