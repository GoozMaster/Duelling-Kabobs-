"use client"

import { useEffect, useRef } from "react"

import s from "./christmas-backdrop.module.css"

/**
 * The Christmas menu's night scene, fixed behind the whole page.
 *
 * Two layers, deliberately split. The landscape is a hand-built SVG in the
 * site's own drawing manner (flat fills, heavy ink keyline, nothing blurred),
 * so it stays razor sharp at any size and costs no image weight. The snow is a
 * canvas on top of it, because several hundred flakes with their own drift are
 * far cheaper to paint than to animate as DOM nodes, and because a canvas has
 * no loop seam: the snow never visibly restarts the way a rendered video clip
 * would.
 *
 * Everything sits at z-index -1 and ignores the pointer, so the cards and text
 * above it behave exactly as on every other page.
 */

const INK = "#16233f"
const W = 1440
const H = 900

/** A tiered pine with a snow cap on each tier, base centred on (x, y). */
function Pine({ x, y, size, fill = "#1f5c3a" }: { x: number; y: number; size: number; fill?: string }) {
  const w = size * 0.5
  const tiers = [0, 1, 2].map((i) => {
    const top = y - size * (0.42 + i * 0.3)
    const bottom = y - size * i * 0.26 - size * 0.04
    const half = w * (1 - i * 0.26)
    return { top, bottom, half }
  })
  return (
    <g stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <rect x={x - size * 0.045} y={y - size * 0.1} width={size * 0.09} height={size * 0.12} fill="#5b3a22" />
      {tiers.map((t, i) => (
        <g key={i}>
          <path d={`M${x} ${t.top} L${x + t.half} ${t.bottom} L${x - t.half} ${t.bottom}Z`} fill={fill} />
          <path
            d={`M${x} ${t.top} L${x + t.half * 0.52} ${t.top + (t.bottom - t.top) * 0.52} Q${x + t.half * 0.2} ${t.top + (t.bottom - t.top) * 0.4} ${x} ${t.top + (t.bottom - t.top) * 0.5} Q${x - t.half * 0.2} ${t.top + (t.bottom - t.top) * 0.4} ${x - t.half * 0.52} ${t.top + (t.bottom - t.top) * 0.52}Z`}
            fill="#ffffff"
          />
        </g>
      ))}
    </g>
  )
}

/** Deterministic stars, so server and client markup agree. */
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 127.1) * 43758.5453
  const b = Math.sin(i * 311.7) * 12543.2111
  const r = (n: number) => n - Math.floor(n)
  // Rounded so the server and the browser serialise the same digits; raw
  // floats differ in the last places and trip a hydration warning.
  const round = (n: number) => Math.round(n * 10) / 10
  return {
    x: round(r(a) * W),
    y: round(r(b) * 420 + 10),
    r: round(1 + r(a * 7.3) * 2.2),
    delay: round(r(b * 3.1) * 5),
    dur: round(2.6 + r(a * 1.9) * 3),
  }
})

const LIGHT_COLOURS = ["#ffd90f", "#e4694f", "#57c4ce", "#ffffff"]
const TREE_LIGHTS = [
  [-26, -150], [20, -170], [-6, -120], [34, -110], [-40, -92], [8, -72], [-18, -52], [42, -42], [-52, -28],
] as const

export function ChristmasBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")

    type Flake = { x: number; y: number; r: number; v: number; sway: number; freq: number; phase: number; a: number }
    let flakes: Flake[] = []
    let width = 0
    let height = 0
    let raf = 0
    let last = 0
    let time = 0

    const make = (layer: 0 | 1 | 2, anywhere: boolean): Flake => {
      const [rMin, rMax, vMin, vMax, a] =
        layer === 0 ? [1, 1.8, 18, 34, 0.55] : layer === 1 ? [1.9, 3, 42, 70, 0.8] : [3.2, 5.4, 86, 130, 0.95]
      return {
        x: Math.random() * width,
        y: anywhere ? Math.random() * height : -10 - Math.random() * 40,
        r: rMin + Math.random() * (rMax - rMin),
        v: vMin + Math.random() * (vMax - vMin),
        sway: 8 + Math.random() * 22 + layer * 6,
        freq: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        a,
      }
    }

    const layerOf = (i: number, n: number): 0 | 1 | 2 => (i < n * 0.5 ? 0 : i < n * 0.85 ? 1 : 2)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // Density follows the screen, so a phone is not a blizzard and a wide
      // monitor is not bare.
      const count = Math.round(Math.min(260, Math.max(70, (width * height) / 7500)))
      flakes = Array.from({ length: count }, (_, i) => make(layerOf(i, count), true))
      draw()
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const wind = Math.sin(time * 0.17) * 22 + 12
      for (const f of flakes) {
        const x = f.x + Math.sin(time * f.freq + f.phase) * f.sway + wind * (f.r / 4)
        ctx.globalAlpha = f.a
        ctx.fillStyle = f.r > 3.2 ? "#f1f7ff" : "#ffffff"
        ctx.beginPath()
        ctx.arc(x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      time += dt
      const wind = Math.sin(time * 0.17) * 22 + 12
      flakes.forEach((f, i) => {
        f.y += f.v * dt
        f.x += wind * (f.r / 4) * dt * 0.4
        if (f.y - f.r > height || f.x > width + 80 || f.x < -80) {
          flakes[i] = make(f.r < 1.85 ? 0 : f.r < 3.1 ? 1 : 2, false)
        }
      })
      draw()
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      cancelAnimationFrame(raf)
      if (reduced.matches || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const onVisibility = () => (document.hidden ? cancelAnimationFrame(raf) : start())

    resize()
    start()
    window.addEventListener("resize", resize)
    document.addEventListener("visibilitychange", onVisibility)
    reduced.addEventListener("change", start)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVisibility)
      reduced.removeEventListener("change", start)
    }
  }, [])

  return (
    <div className={s.backdrop} aria-hidden="true">
      <svg
        className={s.scene}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="xmas-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0c1630" />
            <stop offset="0.55" stopColor="#1b2d5e" />
            <stop offset="1" stopColor="#3d5f9e" />
          </linearGradient>
          <radialGradient id="xmas-moonglow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffd90f" stopOpacity="0.28" />
            <stop offset="1" stopColor="#ffd90f" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill="url(#xmas-sky)" />

        {STARS.map((st, i) => (
          <circle
            key={i}
            className={s.star}
            cx={st.x}
            cy={st.y}
            r={st.r}
            fill="#fdf6e3"
            style={{ animationDelay: `${st.delay}s`, animationDuration: `${st.dur}s` }}
          />
        ))}

        {/* The moon: yellow with the site's keyline, like a sticker. */}
        <g className={s.moon}>
          <circle cx={860} cy={190} r={190} fill="url(#xmas-moonglow)" />
          <circle cx={860} cy={190} r={64} fill="#ffd90f" stroke={INK} strokeWidth={5} />
          <g fill="#f5a623" opacity={0.55}>
            <circle cx={842} cy={176} r={11} />
            <circle cx={880} cy={206} r={8} />
            <circle cx={858} cy={216} r={5} />
          </g>
        </g>

        {/* Far ridge: pale and unkeylined, so it recedes. */}
        <path
          d={`M0 600 C140 540 260 560 380 590 C520 625 640 520 790 540 C950 562 1060 610 1200 560 C1300 525 1380 540 ${W} 560 L${W} ${H} L0 ${H}Z`}
          fill="#8fa9d6"
        />
        <g opacity={0.9}>
          <Pine x={120} y={610} size={86} fill="#2c5a52" />
          <Pine x={186} y={600} size={64} fill="#2c5a52" />
          <Pine x={1260} y={575} size={80} fill="#2c5a52" />
          <Pine x={1330} y={568} size={60} fill="#2c5a52" />
        </g>

        {/* Mid hill, with the cottage on it. */}
        <path
          d={`M0 700 C160 650 300 640 450 672 C610 706 700 650 860 650 C1040 650 1130 720 1290 690 C1360 676 1410 664 ${W} 668 L${W} ${H} L0 ${H}Z`}
          fill="#d6e4f5"
          stroke={INK}
          strokeWidth={4}
        />

        <g stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
          {/* chimney */}
          <rect x={668} y={560} width={26} height={52} fill="#7a3f2b" />
          <rect x={662} y={553} width={38} height={14} rx={3} fill="#ffffff" />
          {/* walls */}
          <rect x={560} y={612} width={178} height={96} fill="#a8382b" />
          {/* roof, with its snow */}
          <path d="M540 616 L649 548 L758 616Z" fill="#3a2a2c" />
          <path d="M541 616 L649 548 L757 616 Q735 626 713 612 Q690 628 664 612 Q640 626 616 612 Q590 628 565 612 Q552 622 541 616Z" fill="#ffffff" />
          {/* door */}
          <rect x={632} y={650} width={34} height={58} rx={4} fill="#5b3a22" />
          <circle cx={657} cy={682} r={2.5} fill="#ffd90f" stroke="none" />
          {/* windows */}
          <g className={s.window}>
            <rect x={578} y={640} width={34} height={32} rx={3} fill="#ffd90f" />
            <path d="M595 640v32M578 656h34" fill="none" strokeWidth={3} />
          </g>
          <g className={s.window} style={{ animationDelay: "-1.7s" }}>
            <rect x={688} y={640} width={34} height={32} rx={3} fill="#ffd90f" />
            <path d="M705 640v32M688 656h34" fill="none" strokeWidth={3} />
          </g>
          {/* wreath */}
          <circle cx={649} cy={582} r={13} fill="none" stroke="#2f7d4f" strokeWidth={9} />
          <circle cx={649} cy={582} r={13} fill="none" strokeWidth={2} opacity={0.5} />
          <circle cx={649} cy={570} r={4} fill="#a8382b" strokeWidth={2.5} />
        </g>
        {/* chimney smoke */}
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            className={s.smoke}
            cx={681}
            cy={548}
            r={9 + i * 2}
            fill="#e8eef9"
            style={{ animationDelay: `${i * -2.4}s` }}
          />
        ))}

        <Pine x={450} y={690} size={120} />
        <Pine x={520} y={700} size={84} />
        <Pine x={800} y={668} size={96} />
        <Pine x={868} y={676} size={70} />
        <Pine x={1090} y={702} size={110} />

        {/* Near bank and the decorated tree. */}
        <path
          d={`M0 780 C180 745 340 760 520 790 C700 820 820 770 1000 772 C1180 774 1290 820 1440 780 L${W} ${H} L0 ${H}Z`}
          fill="#ffffff"
          stroke={INK}
          strokeWidth={4}
        />
        <path
          d={`M0 840 C220 820 420 850 640 850 C860 850 1080 818 1260 836 C1340 844 1400 842 ${W} 834 L${W} ${H} L0 ${H}Z`}
          fill="#eef4fc"
        />

        <g transform="translate(1180 800)">
          <Pine x={0} y={0} size={230} />
          <path
            d="M0 -232 L5.5 -219 L19 -217 L9 -207 L12 -194 L0 -201 L-12 -194 L-9 -207 L-19 -217 L-5.5 -219Z"
            fill="#ffd90f"
            stroke={INK}
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
          {TREE_LIGHTS.map(([lx, ly], i) => (
            <circle
              key={i}
              className={s.light}
              cx={lx}
              cy={ly}
              r={6.5}
              fill={LIGHT_COLOURS[i % LIGHT_COLOURS.length]}
              stroke={INK}
              strokeWidth={2.5}
              style={{ animationDelay: `${(i % 4) * -0.7}s` }}
            />
          ))}
        </g>

        {/* A few drifts catching the light in the foreground. */}
        <g fill="#ffffff" stroke={INK} strokeWidth={3} strokeLinecap="round">
          <path d="M60 868 q40 -22 90 0Z" />
          <path d="M300 880 q30 -14 70 0Z" />
          <path d="M980 872 q46 -20 100 0Z" />
        </g>
      </svg>
      <canvas ref={canvasRef} className={s.snow} />
    </div>
  )
}
