import Image from "next/image"
import Link from "next/link"

import { scenes } from "@/components/home/logos"

import s from "./site-footer.module.css"

/**
 * The shared footer: the name again, and the link to Dueling Kebabs.
 *
 * That page is deliberately left out of the nav — it is an easter egg, not a
 * destination — so it is reached from here, with its own artwork. The footer
 * renders on every page that has <SiteNav />; /login and the admin routes have
 * their own chrome and skip both.
 */
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
        <Link className={s.egg} href="/dueling-kebabs">
          <Image
            src={scenes.duellingKebabs}
            alt=""
            width={96}
            height={96}
            className={s.eggArt}
          />
          <span>Psst...check out our restaurant concept.</span>
        </Link>
      </div>
    </footer>
  )
}
