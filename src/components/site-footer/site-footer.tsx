import Link from "next/link"

import s from "./site-footer.module.css"

/**
 * The shared footer: the name again, the main ways in, and the one quiet link
 * to Dueling Kebabs.
 *
 * That page is deliberately left out of the nav — it is an easter egg, not a
 * destination — so its link stays small and sits where only people who read
 * to the bottom will find it. The footer renders on every page that has
 * <SiteNav />; /login and the admin routes have their own chrome and skip both.
 */
const links = [
  { href: "/what-can-i-make", label: "What can I make?" },
  { href: "/recipes", label: "All recipes" },
  { href: "/recipes/by-cuisine", label: "Recipes by cuisine" },
  { href: "/recipes/surprise", label: "Surprise me" },
  { href: "/stock", label: "What's in stock" },
]

export function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={`page-wrap ${s.inner}`}>
        <div className={s.brand}>
          <Link href="/" className={s.name}>
            DOWN WITH HUNGER
          </Link>
          <p className={s.line}>Recipes for whatever is already in the kitchen.</p>
        </div>
        <nav aria-label="Footer" className={s.links}>
          {links.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <Link className={s.egg} href="/dueling-kebabs">
          Psst — we opened one for real. Sort of.
        </Link>
      </div>
    </footer>
  )
}
