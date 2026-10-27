"use client"

import { gsap } from "gsap"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react"

import type { MenuLink } from "./links"
import s from "./site-nav.module.css"

/**
 * The site's navigation: a sticky bar and a panel that opens from the right.
 *
 * Adapted from React Bits' StaggeredMenu. Opening sweeps the coloured
 * pre-layers in one after another, then the panel, then slides each label up in
 * sequence. What changed from the original:
 *
 * - Items are real next/link links, and a group (Recipes, What's in stock)
 *   shows its links under its heading instead of nesting a dropdown.
 * - The bar stays visible and the panel opens beneath it, so the toggle is
 *   always there to close with.
 * - Open/closed is React state and the animation follows it, rather than the
 *   handlers driving GSAP directly. Escape, click-away, a link click and a
 *   route change all just set that state.
 * - Accessibility: Escape closes, focus moves into the panel and comes back to
 *   the toggle, Tab is trapped between bar and panel, the page cannot scroll
 *   behind it, and reduced motion skips the animation.
 * - No item numbering and no socials; neither belongs on this site.
 */

export type StaggeredMenuItem =
  | { label: string; href: string }
  | { label: string; links: MenuLink[] }
  /** A server action, posted as a form, for things a link must not do (sign out). */
  | { label: string; action: () => Promise<void> }

export interface StaggeredMenuProps {
  /** Rendered at the left of the bar. Passed in so it can stay a server component. */
  logo: ReactNode
  items: StaggeredMenuItem[]
  /** Pre-layers, back to front, that sweep in ahead of the panel. */
  colors?: string[]
  closeOnClickAway?: boolean
}

const PANEL_ID = "site-menu-panel"
const FOCUSABLE = "a[href], button:not([disabled])"

export function StaggeredMenu({
  logo,
  items,
  colors = ["var(--sk-yellow)", "var(--sk-sky)"],
  closeOnClickAway = true,
}: StaggeredMenuProps) {
  const pathname = usePathname()
  const headingId = useId()

  const [open, setOpen] = useState(false)
  // A route change closes the menu. Done while rendering, not in an effect, so
  // the panel never paints open on the new page.
  const [seenPath, setSeenPath] = useState(pathname)
  if (seenPath !== pathname) {
    setSeenPath(pathname)
    setOpen(false)
  }

  const headerRef = useRef<HTMLElement>(null)
  const layersRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const plusHRef = useRef<HTMLSpanElement>(null)
  const plusVRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  // The state the DOM currently shows. Lets the animation effect ignore its
  // first run and Strict Mode's second one.
  const shownRef = useRef(false)

  // Park everything off-screen before first paint.
  useLayoutEffect(() => {
    const layers = layersRef.current
    const panel = panelRef.current
    if (!layers || !panel) return
    const surfaces = [...layers.querySelectorAll("[data-sm-layer]"), panel]
    const labels = panel.querySelectorAll("[data-sm-label]")
    gsap.set(surfaces, { xPercent: 100 })
    gsap.set(labels, { yPercent: 140, rotate: 10 })
    gsap.set(plusVRef.current, { rotate: 90 })
    return () => {
      timelineRef.current?.kill()
      gsap.killTweensOf([...surfaces, ...labels])
    }
  }, [])

  // Play the animation that matches `open`.
  useEffect(() => {
    if (shownRef.current === open) return
    shownRef.current = open

    const header = headerRef.current
    const layers = layersRef.current
    const panel = panelRef.current
    const toggle = toggleRef.current
    if (!header || !layers || !panel || !toggle) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const layerEls = Array.from(layers.querySelectorAll("[data-sm-layer]"))
    const surfaces = [...layerEls, panel]
    const labels = panel.querySelectorAll("[data-sm-label]")
    const hideLabels = () => gsap.set(labels, { yPercent: 140, rotate: 10 })

    timelineRef.current?.kill()
    gsap.killTweensOf([...surfaces, ...labels])

    // The toggle's own motion: the label scrolls and the plus turns to a cross.
    const t = reduce ? 0 : 0.5
    gsap.to(textRef.current, { yPercent: open ? -50 : 0, duration: t, ease: "power4.out", overwrite: true })
    gsap.to(plusHRef.current, { rotate: open ? 45 : 0, duration: t, ease: "power4.out", overwrite: true })
    gsap.to(plusVRef.current, { rotate: open ? -45 : 90, duration: t, ease: "power4.out", overwrite: true })

    if (open) {
      // Open directly under the bar, wherever it currently sits.
      layers.style.top = `${Math.max(0, header.getBoundingClientRect().bottom)}px`
      const wasHidden = getComputedStyle(layers).visibility === "hidden"
      gsap.set(layers, { visibility: "visible" })

      if (reduce) {
        gsap.set(surfaces, { xPercent: 0 })
        gsap.set(labels, { yPercent: 0, rotate: 0 })
      } else {
        if (wasHidden) hideLabels()
        const tl = gsap.timeline()
        layerEls.forEach((el, i) => {
          tl.to(el, { xPercent: 0, duration: 0.5, ease: "power4.out" }, i * 0.07)
        })
        const panelAt = layerEls.length * 0.07 + 0.01
        tl.to(panel, { xPercent: 0, duration: 0.6, ease: "power4.out" }, panelAt)
        tl.to(
          labels,
          { yPercent: 0, rotate: 0, duration: 0.8, ease: "power4.out", stagger: 0.05 },
          panelAt + 0.1,
        )
        timelineRef.current = tl
      }

      // preventScroll: the panel is still sliding in, and focusing something
      // inside a clipped, translated box would otherwise scroll the clip.
      panel.querySelector<HTMLElement>("a[href]")?.focus({ preventScroll: true })
      return
    }

    const finish = () => {
      hideLabels()
      gsap.set(layers, { visibility: "hidden" })
    }
    if (reduce) {
      gsap.set(surfaces, { xPercent: 100 })
      finish()
    } else {
      gsap.to(surfaces, { xPercent: 100, duration: 0.32, ease: "power3.in", onComplete: finish })
    }

    // Give focus back unless the person has already moved it somewhere else.
    const active = document.activeElement
    if (!active || active === document.body || panel.contains(active)) {
      toggle.focus({ preventScroll: true })
    }
  }, [open])

  // While open: no scrolling behind the panel, and keep the page from
  // shifting sideways when the scrollbar goes.
  useEffect(() => {
    if (!open) return
    const { overflow, paddingRight } = document.body.style
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = "hidden"
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
    }
  }, [open])

  // While open: Escape, a Tab trap, and click-away.
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        toggleRef.current?.focus({ preventScroll: true })
        setOpen(false)
        return
      }
      if (e.key !== "Tab") return
      const stops = [headerRef.current, panelRef.current].flatMap((root) =>
        root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)) : [],
      )
      if (!stops.length) return
      const first = stops[0]
      const last = stops[stops.length - 1]
      const active = document.activeElement as HTMLElement | null
      const lost = !active || !stops.includes(active)
      if (e.shiftKey && (active === first || lost)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || lost)) {
        e.preventDefault()
        first.focus()
      }
    }

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    if (closeOnClickAway) document.addEventListener("pointerdown", onPointerDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("pointerdown", onPointerDown)
    }
  }, [open, closeOnClickAway])

  // Only the exact page counts; a link with a hash can't be told apart from its
  // siblings on the same page.
  const isCurrent = (href: string) => !href.includes("#") && pathname === href

  // Every link closes the menu, including one to somewhere on the page we are
  // already on, which changes no route.
  const close = () => setOpen(false)

  const renderLink = (link: MenuLink, className: string) => (
    <Link
      className={className}
      href={link.href}
      aria-current={isCurrent(link.href) ? "page" : undefined}
      onClick={close}
    >
      <span data-sm-label className={s.label}>
        {link.label}
      </span>
    </Link>
  )

  return (
    <>
      <header ref={headerRef} className={s.nav}>
        <div className={`page-wrap ${s.inner}`}>
          {logo}
          <button
            ref={toggleRef}
            type="button"
            className={s.toggle}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={PANEL_ID}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={s.toggleText} aria-hidden="true">
              <span ref={textRef} className={s.toggleLines}>
                <span>Menu</span>
                <span>Close</span>
              </span>
            </span>
            <span className={s.icon} aria-hidden="true">
              <span ref={plusHRef} className={s.iconLine} />
              <span ref={plusVRef} className={s.iconLine} />
            </span>
          </button>
        </div>
      </header>

      <div ref={layersRef} className={s.layers}>
        {colors.map((color, i) => (
          <div key={i} data-sm-layer className={s.layer} style={{ background: color }} aria-hidden="true" />
        ))}

        <nav ref={panelRef} id={PANEL_ID} className={s.panel} aria-label="Site menu" inert={!open}>
          <ul className={s.list}>
            {items.map((item, i) => (
              <li key={item.label} className={s.entry}>
                {"links" in item ? (
                  <>
                    <span className={s.clip}>
                      <span id={`${headingId}-${i}`} data-sm-label className={`${s.label} ${s.heading}`}>
                        {item.label}
                      </span>
                    </span>
                    <ul className={s.sub} aria-labelledby={`${headingId}-${i}`}>
                      {item.links.map((link) => (
                        <li key={link.href} className={s.clip}>
                          {renderLink(link, s.subLink)}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : "action" in item ? (
                  <span className={s.clip}>
                    <form action={item.action}>
                      <button type="submit" className={`${s.bigLink} ${s.actionButton}`}>
                        <span data-sm-label className={s.label}>
                          {item.label}
                        </span>
                      </button>
                    </form>
                  </span>
                ) : (
                  <span className={s.clip}>{renderLink(item, s.bigLink)}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
