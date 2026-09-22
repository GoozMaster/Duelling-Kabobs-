import s from "./pot-search.module.css"

/**
 * The waiting state for "What can I make?".
 *
 * A pot on a flame with its lid rattling and steam going up — the subject of
 * the page rather than a generic spinner, and drawn in the same flat fills and
 * hard keylines as everything else on the site.
 *
 * No JavaScript: every part of it is a CSS animation on inline SVG, so it
 * costs nothing to mount and cannot get stuck running after the results have
 * arrived. The caption changes with what is being looked up.
 */
export function PotSearch({ count }: { count: number }) {
  return (
    <div className={s.stage} role="status" aria-live="polite">
      {/* The flame sits in its own band below the pot rather than overlapping
          it — 113 is where the body ends, so nothing starts before 118. */}
      <svg className={s.pot} viewBox="0 0 120 152" aria-hidden="true">
        {/* steam, drawn first so the lid sits in front of it */}
        <circle className={s.puff} cx="46" cy="40" r="9" />
        <circle className={`${s.puff} ${s.puff2}`} cx="62" cy="42" r="7" />
        <circle className={`${s.puff} ${s.puff3}`} cx="74" cy="40" r="8" />

        {/* handles, behind the body so they read as attached to its far side */}
        <path className={s.handle} d="M22 84 q-12 0 -12 12" />
        <path className={s.handle} d="M98 84 q12 0 12 12" />

        <path
          className={s.body}
          d="M20 72 h80 l-6 34 a8 8 0 0 1 -8 7 h-52 a8 8 0 0 1 -8 -7 z"
        />

        <g className={s.lid}>
          <path d="M16 72 q44 -16 88 0 z" />
        </g>
        <circle className={s.knob} cx="60" cy="60" r="6" />

        <path
          className={s.flame}
          d="M60 150 c-9 0 -16 -6 -16 -15 c0 -7 4 -11 7 -16 c1 4 2 6 4 7 c-2 -8 2 -14 9 -18 c-1 7 1 10 4 14 c3 4 5 7 5 13 c0 9 -5 15 -13 15 z"
        />
      </svg>

      <p className={s.caption}>Checking the shelves…</p>
      <p className={s.sub}>
        {count === 0
          ? "Matching 126 recipes against your staples"
          : `Matching 126 recipes against your ${count} ${count === 1 ? "ingredient" : "ingredients"} and staples`}
      </p>
    </div>
  )
}
