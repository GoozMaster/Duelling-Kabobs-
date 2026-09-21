"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import { scenes } from "@/components/home/logos"
import { usePrefersReducedMotion } from "@/components/home/use-scroll-frame"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import s from "./spinner.module.css"

type Recipe = { id: string; title: string; cuisine: string | null }

/* Geometry. Declared once here and handed to CSS as custom properties below,
   so the tile width the maths uses and the tile width the browser paints can
   never drift apart. */
const TILE_W = 200
const GAP = 16
const DECK = 40
const REPEATS = 5
const SPIN_MS = 7000

/**
 * Parks the strip at its origin with no animation, so a measurement taken
 * straight afterwards is from a known position.
 *
 * The `offsetWidth` read is the whole point: without a forced style flush the
 * browser coalesces this write with the animated one that follows into a single
 * style change, and a single change animates nothing — the strip teleports to
 * the end instead of spinning.
 */
function parkAtOrigin(el: HTMLElement) {
  el.style.transition = "none"
  el.style.transform = "translate3d(0, 0, 0)"
  void el.offsetWidth
}

/** Fisher-Yates. `sort(() => Math.random() - 0.5)` is measurably biased. */
function shuffled<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/**
 * Builds one spin: the winner, the strip of tiles it sits in, and which tile in
 * that strip is the one to stop on.
 *
 * The winner is chosen FIRST and everything else derived from it. The tempting
 * alternative — spin freely, then read off whatever ended up in the middle —
 * cannot guarantee a tile is centred at all, and turns "which recipe did I get"
 * into a question the code has to answer by looking.
 */
function buildSpin(recipes: Recipe[]) {
  const winner = recipes[Math.floor(Math.random() * recipes.length)]

  // The winner plus up to 39 others, so the strip is varied without being the
  // whole collection: at blur speed nobody reads 126 distinct titles, and 630
  // DOM nodes translating is real work for no gain.
  const others = shuffled(recipes.filter((r) => r.id !== winner.id)).slice(0, DECK - 1)
  const deck = shuffled([winner, ...others])
  const winnerIndex = deck.findIndex((r) => r.id === winner.id)

  const strip = Array.from({ length: REPEATS }, () => deck).flat()

  // Land on the winner's copy in the LAST repetition. That guarantees a long
  // run-up, and guarantees there are still tiles either side of it at rest, so
  // the strip never reveals that it ends.
  const landingIndex = winnerIndex + (REPEATS - 1) * DECK

  return { winner, strip, landingIndex }
}

/**
 * How far the strip must travel for the winning tile to sit under the marker.
 *
 * Measured off the real boxes rather than predicted from TILE_W and GAP. The
 * arithmetic version worked on paper and was wrong in practice: it needed the
 * viewport's width at the moment the spin was built, and on the first spin that
 * reading came back near zero — the reel then overshot by however wide the page
 * happened to be. Measuring cannot disagree with the layout, because it is the
 * layout.
 *
 * getBoundingClientRect returns the visual box, and the tiles are scaled to
 * 0.9. That is harmless here: scaling is about the centre, and the centre is
 * the only thing this reads.
 */
function distanceToCentre(strip: HTMLElement, viewport: HTMLElement, index: number) {
  const tile = strip.children[index]
  if (!tile) return 0

  const tileBox = tile.getBoundingClientRect()
  const viewBox = viewport.getBoundingClientRect()
  const delta =
    tileBox.left + tileBox.width / 2 - (viewBox.left + viewBox.width / 2)

  // Nudge it off dead centre. A reel that stops perfectly aligned every time
  // reads as a lookup; ±30px on a 200px tile is unmistakably still the same
  // tile, but it lands like an object rather than snapping to a slot.
  return delta + (Math.random() - 0.5) * TILE_W * 0.3
}

type SpinState = {
  strip: Recipe[]
  landingIndex: number
}

export function Spinner({ recipes }: { recipes: Recipe[] }) {
  const reduced = usePrefersReducedMotion()

  const viewportRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const [spin, setSpin] = useState<SpinState | null>(null)
  const [winner, setWinner] = useState<Recipe | null>(null)
  const [running, setRunning] = useState(false)

  /** Chooses a recipe. Pure state — the DOM work is the layout effect below. */
  const start = useCallback(() => {
    // Reduced motion still gets a random recipe — the spin is the decoration,
    // the pick is the feature.
    if (reduced) {
      setWinner(buildSpin(recipes).winner)
      return
    }

    setWinner(null)
    setRunning(true)
    setSpin(buildSpin(recipes))
  }, [recipes, reduced])

  /**
   * Drives the reel for whichever spin is current.
   *
   * useLayoutEffect, not requestAnimationFrame: the tiles have to be committed
   * before one can be measured, and a layout effect is exactly "after commit,
   * before paint" without needing a frame to be painted at all. rAF does not
   * run in a hidden or backgrounded tab, so hanging the start off it left the
   * reel frozen at rest with no result for anyone who opened this in a tab
   * they were not looking at.
   *
   * Two style writes separated by a forced reflow, not by a frame. Without the
   * reflow in parkAtOrigin the browser coalesces them and the strip teleports;
   * with it, they are a start and an end and the transition runs.
   */
  useLayoutEffect(() => {
    if (!spin) return

    const el = stripRef.current
    const viewportEl = viewportRef.current
    if (!el || !viewportEl) return

    let cancelled = false

    const launch = () => {
      if (cancelled) return false

      // Refuse to measure a collapsed layout.
      //
      // This effect can run during a pass where the whole frame reports a
      // content width of zero — observed in a backgrounded tab, where the
      // frame measured 8px, exactly its two 4px borders. Measuring then still
      // yields a plausible-looking number, because the tile's own position is
      // right and only the viewport's half-width is missing, so the reel
      // overshoots by precisely half a screen and parks the winner against the
      // left edge. A zero here is not a small error to tolerate; it is the
      // wrong moment to be asking.
      if (viewportEl.getBoundingClientRect().width < 1) return false

      // Always travel from the origin. Besides making the measurement
      // straightforward, it removes the failure where "spin again" animates
      // the strip *backwards* for seven seconds from wherever it stopped.
      parkAtOrigin(el)
      const offset = distanceToCentre(el, viewportEl, spin.landingIndex)

      el.style.transition = `transform ${SPIN_MS}ms var(--sk-ease-reel)`
      el.style.transform = `translate3d(${-offset}px, 0, 0)`
      return true
    }

    if (launch()) return

    // Not measurable yet — keep asking until it is.
    //
    // A timer rather than a ResizeObserver, for the same reason the auto-start
    // uses one: an observer needs a rendering opportunity to deliver, and a
    // hidden tab does not give one, so the reel would sit at rest forever in
    // exactly the case that produced the bad measurement in the first place.
    // Timers fire regardless.
    const poll = window.setInterval(() => {
      if (launch()) window.clearInterval(poll)
    }, 120)

    return () => {
      cancelled = true
      window.clearInterval(poll)
    }
  }, [spin])

  // Settle handling. transitionend is the accurate signal but does not reliably
  // fire in a backgrounded tab, which would leave the page spinning forever
  // with no result. The timer is the floor; whichever arrives first wins, and
  // the ref makes sure the second one is a no-op.
  useEffect(() => {
    if (!running || !spin) return

    let done = false
    const settle = () => {
      if (done) return
      done = true
      setRunning(false)
      setWinner(spin.strip[spin.landingIndex])
    }

    const el = stripRef.current
    const timer = window.setTimeout(settle, SPIN_MS + 80)
    el?.addEventListener("transitionend", settle)

    return () => {
      window.clearTimeout(timer)
      el?.removeEventListener("transitionend", settle)
    }
  }, [running, spin])

  // First spin once the motion preference is known.
  //
  // Not during render: a winner chosen while rendering would differ between the
  // server's HTML and the client's first pass, and React would flag a hydration
  // mismatch. Not synchronously in the effect body either — that is a cascading
  // render, and the frame callback is the honest place for it since the spin is
  // driven by the frame scheduler anyway.
  //
  // A zero timer rather than a frame, for the same reason as the layout effect:
  // timers still fire in a backgrounded tab and frames do not.
  //
  // Clearing the timer is the whole cleanup, and that is deliberate: a ref
  // guarding "only ever once" is wrong under StrictMode, which mounts, cleans
  // up and mounts again. The ref would be set by the first pass, the pending
  // work cancelled by the cleanup, and the second pass would find the ref
  // already set and never spin at all. Scheduling per run and cancelling per
  // cleanup survives that, and `start` only changes identity when `recipes` or
  // `reduced` do — neither of which happens after mount.
  useEffect(() => {
    if (reduced === null) return

    const timer = window.setTimeout(start, 0)
    return () => window.clearTimeout(timer)
  }, [reduced, start])

  // Undecided: render the strip at rest and start nothing. Rendering nothing
  // until the media query resolves would flash an empty page on every load.
  const idle = reduced === null

  const stripRecipes = spin?.strip ?? recipes.slice(0, DECK)

  return (
    <div className={s.stage} style={{ "--tile": `${TILE_W}px`, "--gap": `${GAP}px` } as React.CSSProperties}>
      <div className={s.frame}>
        {/* The clip loops because it is five seconds and the spin is seven;
            freezing on its last frame for two seconds reads as a stall. Muted
            and aria-hidden — the Overture gives this footage its meaningful
            description in the one place it carries meaning. */}
        {reduced ? (
          <Image className={s.still} src={scenes.duellingKebabs} alt="" priority />
        ) : (
          <video
            className={s.video}
            src="/dueling-kebabs.mp4"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
        )}

        {/* Flat scrim over the footage. Legibility must not depend on which
            frame happens to be showing, so this is opaque enough to carry text
            over the clip's brightest moment, and deepens once the reel stops so
            the result owns the screen. */}
        <div className={`${s.scrim} ${winner ? s.scrimDeep : ""}`} />

        {!reduced && (
          <div className={s.viewport} ref={viewportRef}>
            <div className={s.marker} aria-hidden="true" />
            <div
              // The transform is owned entirely by restartTransition. Setting it
              // from JSX would both read a ref during render and let React
              // clobber the position mid-spin on an unrelated re-render.
              className={s.strip}
              ref={stripRef}
            >
              {stripRecipes.map((recipe, index) => (
                <div
                  key={`${recipe.id}-${index}`}
                  className={`${s.tile} ${
                    winner && spin && index === spin.landingIndex ? s.tileWon : ""
                  }`}
                >
                  <span className={s.tileTitle}>{recipe.title}</span>
                  {recipe.cuisine && <span className={s.tileCuisine}>{recipe.cuisine}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announced politely so a screen reader hears the result without the
            seven seconds of reel being narrated. */}
        <div className={s.result} role="status" aria-live="polite">
          {winner ? (
            <div className={s.card}>
              <span className={s.cardKicker}>Tonight you are making</span>
              <span className={s.cardTitle}>{winner.title}</span>
              {winner.cuisine && <Badge variant="outline">{winner.cuisine}</Badge>}
              <div className={s.cardActions}>
                <Button asChild>
                  <Link href={`/recipes/${winner.id}`}>Cook this</Link>
                </Button>
                <Button variant="outline" className="border-border border-2" onClick={start}>
                  Spin again
                </Button>
              </div>
            </div>
          ) : (
            <p className={s.status}>
              {idle ? "Ready when you are." : running ? "Spinning…" : ""}
            </p>
          )}
        </div>
      </div>

      {idle && (
        <div className="flex justify-center">
          <Button onClick={start}>Spin</Button>
        </div>
      )}
    </div>
  )
}
