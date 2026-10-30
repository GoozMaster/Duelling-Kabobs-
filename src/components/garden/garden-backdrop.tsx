import s from "./garden-backdrop.module.css"

/**
 * The vegan menu's sunny garden, fixed behind the whole page.
 *
 * Drawn in the site's own manner (flat fills, heavy ink keyline, nothing
 * blurred) as one SVG, so it is sharp at any size and weighs almost nothing.
 * Motion is all CSS and all slow: clouds drift, the sun's rays turn, the
 * sunflowers and tomato vines sway, and a couple of butterflies and a bee
 * wander through. It is a server component with no script at all.
 *
 * Fixed at z-index -1 and click-through, so the cards above behave as they do
 * on every other page.
 */

const INK = "#16233f"
const W = 1440
const H = 900

const line = {
  stroke: INK,
  strokeWidth: 4,
  strokeLinejoin: "round",
  strokeLinecap: "round",
} as const

function Cloud({ x, y, k = 1, cls }: { x: number; y: number; k?: number; cls: string }) {
  return (
    <g className={`${s.cloud} ${cls}`}>
      <g transform={`translate(${x} ${y}) scale(${k})`}>
        <path
          d="M0 40 C-6 14 28 4 44 20 C54 -6 100 -4 108 24 C132 14 152 38 136 56 C140 74 116 80 104 74 L18 74 C-8 74 -12 50 0 40Z"
          fill="#ffffff"
        />
        <path d="M18 74 C-8 74 -12 50 0 40 C4 58 30 62 60 62 C100 62 128 66 136 56 C140 74 116 80 104 74Z" fill="#dbeefc" />
      </g>
    </g>
  )
}

function Carrot({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} {...line} strokeWidth={3}>
      <path d="M-4 0 C-14 -20 -12 -34 -6 -40 C-2 -50 6 -50 8 -40 C14 -34 14 -20 4 0Z" fill="#6fbf5f" />
      <path d="M-5 -2 Q0 -10 5 -2 Q0 -6 -5 -2Z" fill="#f08a24" />
      <path d="M0 -6 L-3 -32M0 -6 L5 -34M0 -6 L-9 -28" fill="none" stroke="#2f7d4f" strokeWidth={2.5} />
      <path d="M-13 0 Q0 -22 13 0Z" fill="#f08a24" />
      <path d="M-8 -4 l4 5M2 -8 l4 8" stroke={INK} strokeWidth={2} fill="none" />
    </g>
  )
}

function Cabbage({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} {...line} strokeWidth={3}>
      <path d="M-30 0 C-34 -30 -16 -46 0 -46 C16 -46 34 -30 30 0Z" fill="#8fd17f" />
      <path d="M-30 -2 C-24 -14 -10 -16 0 -16 C10 -16 24 -14 30 -2" fill="#b9e6a8" />
      <path d="M0 -46 C-8 -34 -6 -22 0 -16M0 -46 C8 -34 6 -22 0 -16" fill="none" strokeWidth={2.5} />
    </g>
  )
}

function Pumpkin({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} {...line} strokeWidth={3}>
      <path d="M-4 -40 C-2 -50 4 -52 8 -56" fill="none" stroke="#2f7d4f" strokeWidth={6} />
      <ellipse cx={0} cy={-20} rx={34} ry={22} fill="#f5842a" />
      <path d="M-14 -40 C-24 -24 -20 -8 -12 0M14 -40 C24 -24 20 -8 12 0M0 -42 C-6 -26 -6 -8 0 0" fill="none" strokeWidth={2.5} />
    </g>
  )
}

function Eggplant({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} {...line} strokeWidth={3}>
      <path d="M0 0 C-22 -4 -26 -30 -14 -46 C-8 -54 6 -54 12 -44 C22 -30 20 -4 0 0Z" fill="#6b3fa0" />
      <path d="M-10 -44 L-16 -54 L-4 -50 L0 -60 L6 -50 L16 -54 L10 -44Z" fill="#4c9a54" />
      <path d="M-8 -34 Q-12 -22 -8 -12" fill="none" stroke="#a98ad6" strokeWidth={3} />
    </g>
  )
}

function Tomato({ x, y, k = 1, delay = 0 }: { x: number; y: number; k?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path d="M0 0 L0 -120" stroke="#8a5a2b" strokeWidth={5} strokeLinecap="round" />
      <g className={s.sway} style={{ animationDelay: `${delay}s` }}>
        <g {...line} strokeWidth={3}>
          <path d="M0 -20 C-34 -28 -40 -64 -14 -70 C-30 -92 4 -108 14 -88 C40 -98 48 -64 22 -50 C34 -34 14 -14 0 -20Z" fill="#4fae5a" />
          <circle cx={-18} cy={-46} r={12} fill="#e8402f" />
          <circle cx={16} cy={-72} r={11} fill="#e8402f" />
          <circle cx={14} cy={-36} r={10} fill="#f0583f" />
          <path d="M-18 -58 l-4 -5 l8 2z" fill="#2f7d4f" strokeWidth={2} />
        </g>
      </g>
    </g>
  )
}

function Sunflower({ x, y, k = 1, delay = 0 }: { x: number; y: number; k?: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <g className={s.sway} style={{ animationDelay: `${delay}s` }}>
        <path d="M0 0 C-6 -90 6 -170 0 -250" fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" />
        <path d="M0 0 C-6 -90 6 -170 0 -250" fill="none" stroke="#4fae5a" strokeWidth={6} strokeLinecap="round" />
        <path d="M-2 -90 C-34 -106 -48 -90 -52 -74 C-30 -66 -12 -74 -2 -90Z" fill="#4fae5a" {...line} strokeWidth={3} />
        <path d="M2 -140 C34 -154 50 -138 54 -122 C32 -114 12 -122 2 -140Z" fill="#4fae5a" {...line} strokeWidth={3} />
        <g transform="translate(0 -262)">
          {Array.from({ length: 14 }, (_, i) => (
            <ellipse
              key={i}
              cx={0}
              cy={-40}
              rx={11}
              ry={22}
              fill="#ffd90f"
              {...line}
              strokeWidth={3}
              transform={`rotate(${i * (360 / 14)})`}
            />
          ))}
          <circle r={28} fill="#7a4a24" {...line} strokeWidth={4} />
          <circle r={16} fill="#5b3a22" />
        </g>
      </g>
    </g>
  )
}

function FruitTree({
  x,
  y,
  k = 1,
  fruit,
  leaf = "#5cb85c",
}: {
  x: number
  y: number
  k?: number
  fruit: string
  leaf?: string
}) {
  const fruits = [[-46, -150], [20, -176], [58, -132], [-8, -118], [-70, -108], [34, -96]]
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path d="M-12 0 L-8 -90 L8 -90 L12 0Z" fill="#8a5a2b" {...line} />
      <g {...line}>
        <circle cx={-48} cy={-120} r={52} fill={leaf} />
        <circle cx={50} cy={-124} r={54} fill={leaf} />
        <circle cx={0} cy={-170} r={60} fill={leaf} />
        <circle cx={0} cy={-110} r={56} fill={leaf} stroke="none" />
      </g>
      {fruits.map(([fx, fy], i) => (
        <g key={i}>
          <circle cx={fx} cy={fy} r={11} fill={fruit} {...line} strokeWidth={3} />
          <path d={`M${fx} ${fy - 10} q3 -6 7 -7`} fill="none" stroke="#2f7d4f" strokeWidth={3} strokeLinecap="round" />
        </g>
      ))}
    </g>
  )
}

function Butterfly({ cls, colour }: { cls: string; colour: string }) {
  return (
    <g className={`${s.flyer} ${cls}`}>
      <g className={s.flap} {...line} strokeWidth={2.5}>
        <ellipse cx={-9} cy={-3} rx={10} ry={13} fill={colour} transform="rotate(-20 -9 -3)" />
        <ellipse cx={9} cy={-3} rx={10} ry={13} fill={colour} transform="rotate(20 9 -3)" />
        <ellipse cx={-7} cy={10} rx={6} ry={8} fill="#ffd90f" transform="rotate(-10 -7 10)" />
        <ellipse cx={7} cy={10} rx={6} ry={8} fill="#ffd90f" transform="rotate(10 7 10)" />
      </g>
      <rect x={-1.8} y={-8} width={3.6} height={24} rx={1.8} fill={INK} />
    </g>
  )
}

const FENCE = Array.from({ length: 30 }, (_, i) => 20 + i * 50)

export function GardenBackdrop() {
  return (
    <div className={s.backdrop} aria-hidden="true">
      <svg
        className={s.scene}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="garden-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5db8ee" />
            <stop offset="0.7" stopColor="#bfe7fa" />
            <stop offset="1" stopColor="#e6f6e4" />
          </linearGradient>
          <radialGradient id="garden-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fff6b0" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff6b0" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill="url(#garden-sky)" />

        {/* Sun: a glow, slowly turning rays, and a keylined disc. */}
        <circle cx={900} cy={170} r={230} fill="url(#garden-glow)" />
        <g className={s.rays}>
          <g transform="translate(900 170)">
            {Array.from({ length: 12 }, (_, i) => (
              <path
                key={i}
                d="M-12 -92 L0 -146 L12 -92Z"
                fill="#ffd90f"
                {...line}
                strokeWidth={3}
                transform={`rotate(${i * 30})`}
              />
            ))}
          </g>
        </g>
        <circle cx={900} cy={170} r={80} fill="#ffd90f" {...line} strokeWidth={5} />
        <circle cx={900} cy={170} r={58} fill="#ffe55c" />

        <Cloud x={120} y={150} k={1.1} cls={s.c1} />
        <Cloud x={520} y={80} k={0.8} cls={s.c2} />
        <Cloud x={1050} y={250} k={0.9} cls={s.c3} />

        {/* Far hills, pale and unkeylined so they recede. */}
        <path
          d={`M0 540 C150 480 290 500 420 540 C560 584 680 470 840 490 C1000 510 1100 570 1240 520 C1330 488 1390 496 ${W} 512 L${W} ${H} L0 ${H}Z`}
          fill="#a9dca0"
        />
        <path
          d={`M0 600 C180 560 330 580 480 612 C640 646 760 570 920 580 C1090 590 1200 640 1340 610 C1390 598 1420 596 ${W} 600 L${W} ${H} L0 ${H}Z`}
          fill="#84cc7e"
        />

        {/* Mid hill: orchard and fence. */}
        <path
          d={`M0 680 C200 636 360 650 520 676 C700 706 820 650 1000 654 C1160 658 1280 700 ${W} 668 L${W} ${H} L0 ${H}Z`}
          fill="#62bb5e"
          {...line}
        />
        <FruitTree x={250} y={668} k={0.78} fruit="#e8402f" />
        <FruitTree x={1130} y={676} k={0.7} fruit="#f5842a" leaf="#52ae5a" />
        <FruitTree x={660} y={690} k={0.5} fruit="#ffd33d" leaf="#6cc364" />

        {/* Picket fence along the foot of the hill. */}
        <g {...line} strokeWidth={3}>
          {FENCE.map((fx) => (
            <path key={fx} d={`M${fx - 11} 744 L${fx - 11} 712 L${fx} 700 L${fx + 11} 712 L${fx + 11} 744Z`} fill="#fdf6e3" />
          ))}
          <path d={`M0 722 L${W} 722M0 738 L${W} 738`} fill="none" />
        </g>

        {/* The vegetable beds: three rows, bigger as they come forward. */}
        <path
          d={`M0 748 L${W} 748 L${W} ${H} L0 ${H}Z`}
          fill="#8a5a2b"
          {...line}
          strokeWidth={4}
        />
        <g fill="#a06a35" opacity={0.9}>
          <rect x={0} y={770} width={W} height={26} />
          <rect x={0} y={826} width={W} height={32} />
        </g>

        {[60, 170, 280].map((cx, i) => <Carrot key={`c${i}`} x={cx} y={782} k={0.9} />)}
        <Cabbage x={420} y={788} k={0.8} />
        <Cabbage x={500} y={788} k={0.8} />
        <Tomato x={640} y={792} k={0.95} delay={-0.6} />
        <Tomato x={740} y={792} k={0.95} delay={-1.8} />
        <Eggplant x={860} y={786} k={0.95} />
        <Eggplant x={920} y={786} k={0.95} />
        <Pumpkin x={1040} y={790} k={0.9} />
        {[1180, 1270, 1360].map((cx, i) => <Carrot key={`d${i}`} x={cx} y={782} k={0.9} />)}

        <Pumpkin x={120} y={846} k={1.15} />
        <Cabbage x={250} y={850} k={1.2} />
        <Eggplant x={370} y={846} k={1.2} />
        <Tomato x={520} y={856} k={1.25} delay={-1.1} />
        {[660, 750, 840].map((cx, i) => <Carrot key={`e${i}`} x={cx} y={850} k={1.2} />)}
        <Cabbage x={980} y={850} k={1.2} />
        <Pumpkin x={1110} y={846} k={1.15} />
        <Tomato x={1250} y={856} k={1.25} delay={-2.4} />
        <Eggplant x={1370} y={846} k={1.2} />

        {/* Sunflowers frame the edges. */}
        <Sunflower x={70} y={760} k={1.05} delay={-0.4} />
        <Sunflower x={1370} y={756} k={1.1} delay={-2.2} />
        <Sunflower x={170} y={770} k={0.7} delay={-1.5} />

        {/* A little life moving through. */}
        <Butterfly cls={s.f1} colour="#f08acb" />
        <Butterfly cls={s.f2} colour="#57c4ce" />
        <g className={`${s.flyer} ${s.f3}`}>
          <ellipse cx={0} cy={0} rx={9} ry={7} fill="#ffd90f" {...line} strokeWidth={2.5} />
          <path d="M-3 -6 v12M3 -6 v12" stroke={INK} strokeWidth={2.5} />
          <ellipse cx={-4} cy={-9} rx={6} ry={4} fill="#ffffff" {...line} strokeWidth={2} className={s.flap} />
        </g>
      </svg>
    </div>
  )
}
