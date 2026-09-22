"use client"

import { useState } from "react"

import s from "./cooking-animation.module.css"

/**
 * The waiting state for "What can I make?".
 *
 * Five scenes, one shown at random per lookup. Each is the subject of the page
 * — something being cooked — rather than a spinner, and each is drawn in the
 * site's own language: flat fills, hard keylines, no blur anywhere.
 *
 * NO JAVASCRIPT DRIVES THE MOTION. Every scene is CSS animation over inline
 * SVG, so mounting one costs nothing and none of them can still be running
 * after the results have arrived. The only state here is which scene to show.
 *
 * Captions vary with the scene because that is where the charm is; the line
 * under it does not, because that is where the information is.
 */

type Scene = {
  caption: string
  art: () => React.ReactElement
}

function Pot() {
  return (
    <svg className={s.art} viewBox="0 0 120 152" aria-hidden="true">
      {/* steam first, so the lid passes in front of it */}
      <circle className={`${s.puff} ${s.paper} ${s.ln} ${s.thin}`} cx="46" cy="40" r="9" />
      <circle
        className={`${s.puff} ${s.puffB} ${s.paper} ${s.ln} ${s.thin}`}
        cx="62"
        cy="42"
        r="7"
      />
      <circle
        className={`${s.puff} ${s.puffC} ${s.paper} ${s.ln} ${s.thin}`}
        cx="74"
        cy="40"
        r="8"
      />

      <path className={`${s.none} ${s.ln}`} d="M22 84 q-12 0 -12 12" />
      <path className={`${s.none} ${s.ln}`} d="M98 84 q12 0 12 12" />

      <path
        className={`${s.brick} ${s.ln}`}
        d="M20 72 h80 l-6 34 a8 8 0 0 1 -8 7 h-52 a8 8 0 0 1 -8 -7 z"
      />

      <g className={s.lid}>
        <path className={`${s.sand} ${s.ln}`} d="M16 72 q44 -16 88 0 z" />
      </g>
      <circle className={`${s.gold} ${s.ln} ${s.thin}`} cx="60" cy="60" r="6" />

      <path
        className={`${s.flame} ${s.yellow} ${s.ln} ${s.thin}`}
        d="M60 150 c-9 0 -16 -6 -16 -15 c0 -7 4 -11 7 -16 c1 4 2 6 4 7 c-2 -8 2 -14 9 -18 c-1 7 1 10 4 14 c3 4 5 7 5 13 c0 9 -5 15 -13 15 z"
      />
    </svg>
  )
}

function Wok() {
  return (
    <svg className={s.art} viewBox="0 0 150 130" aria-hidden="true">
      {/* The noodles are drawn above the pan and thrown as one group. */}
      <g className={s.noodles}>
        <path className={`${s.none} ${s.ln} ${s.thin}`} d="M52 52 q10 -18 24 -8" />
        <path className={`${s.none} ${s.ln} ${s.thin}`} d="M64 46 q14 -16 28 -4" />
        <path className={`${s.none} ${s.ln} ${s.thin}`} d="M78 50 q12 -14 22 -2" />
        <circle className={`${s.basil} ${s.ln} ${s.thin}`} cx="60" cy="40" r="5" />
        <circle className={`${s.brick} ${s.ln} ${s.thin}`} cx="88" cy="34" r="5" />
      </g>

      <g className={s.wok}>
        {/* handle */}
        <path className={`${s.none} ${s.ln}`} d="M120 66 l22 -12" />
        {/* the pan: a shallow bowl, rim line on top */}
        <path className={`${s.brick} ${s.ln}`} d="M22 66 a53 34 0 0 0 98 0 z" />
        <path className={`${s.none} ${s.ln}`} d="M22 66 h98" />
      </g>

      <path
        className={`${s.flame} ${s.yellow} ${s.ln} ${s.thin}`}
        d="M71 128 c-8 0 -14 -5 -14 -13 c0 -6 4 -10 6 -14 c1 3 2 5 4 6 c-2 -7 2 -12 8 -16 c-1 6 1 9 4 12 c3 4 4 6 4 12 c0 8 -4 13 -12 13 z"
      />
    </svg>
  )
}

function Pizza() {
  return (
    <svg className={s.art} viewBox="0 0 150 130" aria-hidden="true">
      {/* crust, then cheese inset, then toppings */}
      <circle className={`${s.sand} ${s.ln}`} cx="75" cy="72" r="50" />
      <circle className={`${s.gold} ${s.ln} ${s.thin}`} cx="75" cy="72" r="40" />
      <circle className={`${s.brick} ${s.ln} ${s.thin}`} cx="58" cy="56" r="7" />
      <circle className={`${s.brick} ${s.ln} ${s.thin}`} cx="94" cy="62" r="7" />
      <circle className={`${s.brick} ${s.ln} ${s.thin}`} cx="66" cy="90" r="7" />
      <circle className={`${s.brick} ${s.ln} ${s.thin}`} cx="98" cy="94" r="6" />
      <circle className={`${s.basil} ${s.ln} ${s.thin}`} cx="78" cy="74" r="5" />

      {/* the cut, revealed under the blade as it passes */}
      <path className={`${s.cut} ${s.none} ${s.ln} ${s.thin}`} d="M75 20 v104" />

      <g className={s.cutter}>
        {/* handle, then the wheel spinning at its own centre */}
        <path className={`${s.none} ${s.ln}`} d="M75 18 v-14" />
        <g className={s.wheel} style={{ transformBox: "fill-box" }}>
          <circle className={`${s.paper} ${s.ln} ${s.thin}`} cx="75" cy="26" r="11" />
          <path className={`${s.none} ${s.ln} ${s.thin}`} d="M75 17 v18 M66 26 h18" />
        </g>
      </g>
    </svg>
  )
}

function Taco() {
  return (
    <svg className={s.art} viewBox="0 0 150 120" aria-hidden="true">
      {/* the beats sit outside the shell, timed to its lean */}
      <path
        className={`${s.beat} ${s.none} ${s.ln} ${s.thin}`}
        d="M20 44 q-8 10 0 20"
      />
      <path
        className={`${s.beat} ${s.beatB} ${s.none} ${s.ln} ${s.thin}`}
        d="M130 44 q8 10 0 20"
      />

      <g className={s.taco}>
        {/* filling first so the shell's front wall overlaps it */}
        <circle className={`${s.basil} ${s.ln} ${s.thin}`} cx="54" cy="52" r="9" />
        <circle className={`${s.brick} ${s.ln} ${s.thin}`} cx="75" cy="48" r="10" />
        <circle className={`${s.yellow} ${s.ln} ${s.thin}`} cx="96" cy="52" r="9" />

        {/* shell: a U, drawn as an arc bulging down, with the rim across the top */}
        <path className={`${s.sand} ${s.ln}`} d="M38 56 a37 40 0 0 0 74 0 z" />
        <path className={`${s.none} ${s.ln}`} d="M38 56 h74" />
      </g>
    </svg>
  )
}

function Kebabs() {
  /** Three cubes per skewer, alternating, drawn once and reused. */
  const cubes = (y: number) => (
    <>
      <rect
        className={`${s.brick} ${s.ln} ${s.thin}`}
        x="44"
        y={y - 9}
        width="18"
        height="18"
        rx="4"
      />
      <rect
        className={`${s.basil} ${s.ln} ${s.thin}`}
        x="66"
        y={y - 9}
        width="18"
        height="18"
        rx="4"
      />
      <rect
        className={`${s.gold} ${s.ln} ${s.thin}`}
        x="88"
        y={y - 9}
        width="18"
        height="18"
        rx="4"
      />
    </>
  )

  return (
    <svg className={s.art} viewBox="0 0 150 130" aria-hidden="true">
      {/* smoke, behind everything */}
      <circle className={`${s.puff} ${s.paper} ${s.ln} ${s.thin}`} cx="52" cy="34" r="7" />
      <circle
        className={`${s.puff} ${s.puffC} ${s.paper} ${s.ln} ${s.thin}`}
        cx="98"
        cy="32"
        r="6"
      />

      {/* two skewers, each turning on its own beat */}
      <g className={s.skewer} style={{ transformBox: "fill-box" }}>
        <path className={`${s.none} ${s.ln} ${s.thin}`} d="M30 54 h90" />
        {cubes(54)}
      </g>
      <g className={`${s.skewer} ${s.skewerB}`} style={{ transformBox: "fill-box" }}>
        <path className={`${s.none} ${s.ln} ${s.thin}`} d="M30 82 h90" />
        {cubes(82)}
      </g>

      {/* the grill body, with coals behind its bars */}
      <path
        className={`${s.sand} ${s.ln}`}
        d="M26 96 h98 l-8 24 a6 6 0 0 1 -6 4 h-70 a6 6 0 0 1 -6 -4 z"
      />
      <ellipse className={`${s.coal} ${s.ln} ${s.thin}`} cx="52" cy="108" rx="9" ry="6" />
      <ellipse
        className={`${s.coal} ${s.coalB} ${s.ln} ${s.thin}`}
        cx="75"
        cy="111"
        rx="10"
        ry="6"
      />
      <ellipse
        className={`${s.coal} ${s.coalC} ${s.ln} ${s.thin}`}
        cx="98"
        cy="108"
        rx="9"
        ry="6"
      />
      {/* legs */}
      <path className={`${s.none} ${s.ln}`} d="M40 124 l-8 6 M110 124 l8 6" />
    </svg>
  )
}

const SCENES: Scene[] = [
  { caption: "Checking the shelves…", art: Pot },
  { caption: "Tossing the options…", art: Wok },
  { caption: "Slicing it down…", art: Pizza },
  { caption: "Shaking out ideas…", art: Taco },
  { caption: "Over the coals…", art: Kebabs },
]

/**
 * The scene shown last, kept at module scope so it survives the component
 * being unmounted between lookups — which it is every time, since the loader
 * only exists while a search is in flight. Without it, a run of two or three
 * searches would land on the same scene often enough to look like a bug rather
 * than a coincidence.
 */
let previous = -1

function pickScene(): number {
  if (SCENES.length < 2) return 0
  let next = previous
  while (next === previous) next = Math.floor(Math.random() * SCENES.length)
  previous = next
  return next
}

export function CookingAnimation({ count }: { count: number }) {
  /*
   * Chosen once per mount, in an initialiser rather than during render, so a
   * re-render never swaps the scene mid-animation.
   *
   * THIS COMPONENT MUST NOT BE SERVER-RENDERED. A random value picked during
   * render is picked twice — once on the server, once on the client — and the
   * two disagree, which React reports as a hydration failure. That is fine
   * where it is used: the loader exists only while a client-side transition is
   * pending, so the server never renders it at all. Rendering it from a server
   * component, as a scratch page briefly did, fails immediately and loudly.
   *
   * Deferring the pick to an effect instead would trade the constraint for a
   * frame of the wrong scene on every single lookup, which is worse for a
   * thing that is often only on screen for a few hundred milliseconds.
   */
  const [index] = useState(pickScene)
  const scene = SCENES[index]
  const Art = scene.art

  return (
    <div className={s.stage} role="status" aria-live="polite">
      <Art />
      <p className={s.caption}>{scene.caption}</p>
      <p className={s.sub}>
        {count === 0
          ? "Matching 126 recipes against your staples"
          : `Matching 126 recipes against your ${count} ${count === 1 ? "ingredient" : "ingredients"} and staples`}
      </p>
    </div>
  )
}
