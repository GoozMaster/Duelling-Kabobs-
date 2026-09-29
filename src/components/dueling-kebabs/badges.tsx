import s from "./badges.module.css"

/**
 * The two menu marks, drawn flat in the cartoon-cel manner: one heavy ink
 * keyline of even weight, flat fills, no gradients. Each sits in a cream disc
 * with a gold ring so it reads on the burgundy menu and the cream pages alike.
 *
 * The SVGs themselves are always aria-hidden; the disc carries the meaning.
 */

const INK = "#1c0a0e"

type BadgeProps = { label?: string; size?: "sm" | "lg" }

/**
 * With a label the disc is an image with that name; without one (the legend,
 * where the text beside it says the same thing) it is hidden outright.
 */
function discProps(label?: string) {
  return label ? { role: "img", "aria-label": label } : { "aria-hidden": true }
}

/** House specialty, or it brings the heat. Wiggles on a loop. */
export function MustacheBadge({ label, size = "sm" }: BadgeProps) {
  return (
    <span className={`${s.disc} ${s[size]}`} {...discProps(label)}>
      <svg className={s.mustache} viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M32 29
             C28 22 20 21 15 26
             C12 29 8 30 5 26
             C3 32 7 38 14 38
             C21 38 26 35 32 35
             C38 35 43 38 50 38
             C57 38 61 32 59 26
             C56 30 52 29 49 26
             C44 21 36 22 32 29 Z"
          fill="#3a2418"
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* a highlight along each wing, the one concession to volume */}
        <path
          d="M18 29 C22 27 26 28 29 31 M46 29 C42 27 38 28 35 31"
          fill="none"
          stroke="#8a5a3c"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

/** Vegetarian. The deep V stands for vegetables; nobody believes this. */
export function VNeckBadge({ label, size = "sm" }: BadgeProps) {
  return (
    <span className={`${s.disc} ${s[size]}`} {...discProps(label)}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path
          d="M24 11 L32 33 L40 11
             L50 15 L58 25 L51 32 L46 28
             L46 55 L18 55 L18 28 L13 32 L6 25 L14 15 Z"
          fill="#141014"
          stroke={INK}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* the collar's rib, in the only colour a black tee has */}
        <path
          d="M26.5 12 L32 27 L37.5 12"
          fill="none"
          stroke="#4a4048"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
