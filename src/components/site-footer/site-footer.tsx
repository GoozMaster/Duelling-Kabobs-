import Link from "next/link"

import s from "./site-footer.module.css"

/**
 * The shared footer, which exists for one line: the way in to Dueling Kebabs.
 *
 * That page is deliberately left out of the nav — it is an easter egg, not a
 * destination — so the link is quiet and sits where only people who read to
 * the bottom will find it. It renders on every page that has <SiteNav />;
 * /login and the admin routes have their own chrome and skip both.
 */
export function SiteFooter() {
  return (
    <footer className={s.footer}>
      <Link className={s.egg} href="/dueling-kebabs">
        Psst — we opened one for real. Sort of.
      </Link>
    </footer>
  )
}
