"use client"

import {
  memo,
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"

/**
 * Drift Wall, adapted from React Bits.
 *
 * Kept from the original: tilted 3D columns of tiles drifting vertically, every
 * column its own speed and alternating direction, each track repeated enough
 * times to wrap seamlessly, offsets driven from one requestAnimationFrame loop
 * and written straight to the DOM (no React render per frame).
 *
 * Changed:
 *  - a tile renders whatever `renderTile` returns instead of an `image` URL;
 *  - the hover / focus / link behaviour is gone — the wall is aria-hidden and
 *    nothing in it is focusable, but pressing a tile calls `onSelect`, even
 *    while the wall is drifting or spinning;
 *  - the fade mask, dimming and overlay are gone, so tiles stay fully legible;
 *  - an imperative `spinTo(id)`: every column accelerates hard, then brakes, and
 *    the column holding `id` is steered so that tile stops on the centre line.
 */

export interface DriftWallHandle {
  /** Spin every column and stop with `id` highlighted at the centre. Resolves when everything has stopped. */
  spinTo(id: string): Promise<void>
  /** No motion: put `id` at the centre and highlight it. */
  jumpTo(id: string): void
}

export interface DriftWallProps<T extends { id: string }> {
  items: T[]
  renderTile: (item: T) => ReactNode
  ref?: Ref<DriftWallHandle>
  tileWidth?: number
  tileHeight?: number
  gap?: number
  /** Degrees. */
  tilt?: number
  turn?: number
  perspective?: number
  depth?: number
  /** Plane scale, so the tilted plane still covers the frame. */
  zoom?: number
  /** Resting drift in px per second. */
  speed?: number
  /** 0..1 — how much column speeds differ. */
  variance?: number
  /** Pointer tilt strength; 0 turns it off. */
  parallax?: number
  /** Called with a tile's id when it is pressed and released on, even mid-spin. */
  onSelect?: (id: string) => void
  className?: string
  style?: CSSProperties
}

type Mode = "drift" | "spin" | "brake" | "rest"

interface ColState {
  mode: Mode
  v: number // signed px/s while drifting or spinning
  spinStart: number
  brakeAfter: number // seconds of full speed before this column may brake
  brakeMs: number // free-brake duration for columns that are not aiming at anything
  target: number | null // offset to stop on, for the winner's column only
  b: { t0: number; dur: number; o1: number; dir: number; dist: number } | null
}

const SPIN_SPEED = 2800 // px/s at full tilt, before the per-column factor
const BRAKE_MIN = 1.2 // seconds — window the winner column may brake over
const BRAKE_MAX = 2.0

const frac = (n: number) => n - Math.floor(n)
const mod = (n: number, m: number) => ((n % m) + m) % m

/** Deterministic spread in [-1, 1] — the same on server and client. */
const spread = (index: number) => frac(index * 0.6180339887 + 0.35) * 2 - 1

function usePrefersReduced() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(q.matches)
    update()
    q.addEventListener("change", update)
    return () => q.removeEventListener("change", update)
  }, [])
  return reduced
}

/** Memoised so lighting up one tile does not re-render the other few hundred. */
const Slot = memo(function Slot<T extends { id: string }>({
  item,
  active,
  renderTile,
  height,
  pad,
}: {
  item: T
  active: boolean
  renderTile: (item: T) => ReactNode
  height: number
  pad: number
}) {
  return (
    <div
      data-tile-id={item.id}
      data-active={active ? "true" : undefined}
      style={{
        height,
        padding: pad,
        boxSizing: "border-box",
        flex: "none",
        transformStyle: "preserve-3d",
      }}
    >
      {renderTile(item)}
    </div>
  )
}) as <T extends { id: string }>(p: {
  item: T
  active: boolean
  renderTile: (item: T) => ReactNode
  height: number
  pad: number
}) => ReactNode

export default function DriftWall<T extends { id: string }>({
  items,
  renderTile,
  ref,
  tileWidth = 220,
  tileHeight = 92,
  gap = 16,
  tilt = 12,
  turn = -6,
  perspective = 1200,
  depth = 100,
  zoom = 1.14,
  speed = 34,
  variance = 0.45,
  parallax = 0.5,
  onSelect,
  className,
  style,
}: DriftWallProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const trackRefs = useRef<(HTMLDivElement | null)[]>([])
  const offsets = useRef<number[]>([])
  const cols = useRef<ColState[]>([])
  const clock = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const damped = useRef({ x: 0, y: 0 })
  const settle = useRef<{ id: string; resolve: () => void } | null>(null)

  const reduced = usePrefersReduced()
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [activeId, setActiveId] = useState<string | null>(null)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) =>
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height }),
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Narrow frames get smaller tiles rather than fewer columns of cramped ones.
  const narrow = size.w > 0 && size.w < 640
  const k = narrow ? 0.74 : size.w >= 1000 ? 1.1 : 1
  const th = Math.round(tileHeight * k)
  const g = Math.round(gap * k)
  const unit = th + g
  // The turned plane projects right-heavy (empty strip on the left, last column
  // clipped on the right), so it is nudged left to sit centred in the frame.
  const shift = narrow ? -20 : -12

  // Exactly as many columns as fit, stretched to span the frame. Every column
  // centre therefore lands inside the frame, so whichever column holds the
  // winner, the winner is on screen — spare off-screen columns would hide it.
  const columnCount =
    size.w > 0 ? Math.max(2, Math.round(size.w / (zoom * (tileWidth * k + g)))) : 0
  const colW = columnCount > 0 ? size.w / (columnCount * zoom) : 0

  const columnItems = useMemo(() => {
    const out: T[][] = Array.from({ length: columnCount }, () => [])
    items.forEach((item, i) => out[i % columnCount]?.push(item))
    return out
  }, [items, columnCount])

  const meta = useMemo(
    () =>
      columnItems.map((col) => {
        const n = Math.max(1, col.length)
        const copyHeight = n * unit
        // Enough copies that, wherever the offset wraps, the tilted plane is covered.
        const copies = Math.max(2, Math.ceil((size.h * 1.8) / copyHeight) + 1)
        // Tile j sits at base + j*unit; base centres the stack on the plane's origin.
        const base = (-copies * copyHeight + copyHeight) / 2
        return { copyHeight, copies, base }
      }),
    [columnItems, unit, size.h],
  )

  const baseV = useMemo(
    () => columnItems.map((_, c) => speed * (1 + variance * spread(c)) * (c % 2 === 0 ? 1 : -1)),
    [columnItems, speed, variance],
  )

  const spinV = useMemo(
    () => baseV.map((v, c) => SPIN_SPEED * (1 + 0.25 * spread(c)) * Math.sign(v || 1)),
    [baseV],
  )

  /**
   * The offset that puts item `index` of a column at the vertical centre of the
   * FRAME. The plane is rotated about X after Y and pushed back by `depth`, so
   * the point that projects to the centre is not plane-y 0: it drifts with the
   * column's x. Solving y*cos(tilt) + (x*sin(turn) + depth*cos(turn))*sin(tilt) = 0
   * for y gives the aim below; without it the winner sits ~30px off centre.
   */
  const offsetFor = useCallback(
    (c: number, index: number) => {
      const m = meta[c]
      const x = (c - (meta.length - 1) / 2) * colW
      const rad = Math.PI / 180
      const aim = -(x * Math.sin(turn * rad) + depth * Math.cos(turn * rad)) * Math.tan(tilt * rad)
      return mod(m.base + index * unit + unit / 2 - aim, m.copyHeight)
    },
    [meta, unit, colW, turn, tilt, depth],
  )

  const locate = useCallback(
    (id: string) => {
      for (let c = 0; c < columnItems.length; c++) {
        const index = columnItems[c].findIndex((it) => it.id === id)
        if (index >= 0) return { c, index }
      }
      return null
    },
    [columnItems],
  )

  const writePlane = useCallback(
    (px: number, py: number) => {
      const plane = planeRef.current
      if (!plane) return
      plane.style.transform =
        `translateX(${shift}px) scale(${zoom}) rotateX(${tilt + py}deg) rotateY(${turn + px}deg) translateZ(${-depth}px)`
    },
    [zoom, tilt, turn, depth, shift],
  )

  const writeTracks = useCallback(() => {
    for (let c = 0; c < trackRefs.current.length; c++) {
      const el = trackRefs.current[c]
      if (el) el.style.transform = `translate3d(0, ${-(offsets.current[c] ?? 0)}px, 0)`
    }
  }, [])

  // (Re)seed every column whenever the layout changes. A spin in flight is
  // abandoned; the caller's fallback timer owns that case.
  useLayoutEffect(() => {
    offsets.current = meta.map((m, c) => m.copyHeight * frac(c * 0.37))
    cols.current = meta.map(() => ({
      mode: "drift",
      v: 0,
      spinStart: 0,
      brakeAfter: 0,
      brakeMs: 0,
      target: null,
      b: null,
    }))
    settle.current = null
    writePlane(0, 0)
    writeTracks()
  }, [meta, writePlane, writeTracks])

  useEffect(() => {
    if (reduced || columnCount === 0) return
    let raf = 0
    let last: number | null = null

    const frame = (ts: number) => {
      if (last === null) last = ts
      const dt = Math.min(0.05, Math.max(0, ts - last) / 1000)
      last = ts
      clock.current += dt
      const now = clock.current

      const maxTilt = parallax * 8
      const damp = 1 - Math.exp(-dt / 0.12)
      damped.current.x += (pointer.current.x * maxTilt - damped.current.x) * damp
      damped.current.y += (-pointer.current.y * maxTilt - damped.current.y) * damp
      writePlane(damped.current.x, damped.current.y)

      let spinning = false
      for (let c = 0; c < cols.current.length; c++) {
        const st = cols.current[c]
        const m = meta[c]
        if (!st || !m) continue
        const ch = m.copyHeight
        let o = offsets.current[c] ?? 0

        if (st.mode === "drift" || st.mode === "spin") {
          const goal = st.mode === "drift" ? baseV[c] : spinV[c]
          st.v += (goal - st.v) * (1 - Math.exp(-dt / (st.mode === "spin" ? 0.14 : 0.3)))
          o += st.v * dt
        }

        if (st.mode === "spin") {
          spinning = true
          const speedNow = Math.abs(st.v)
          if (now - st.spinStart >= st.brakeAfter && speedNow > 200) {
            const dir = Math.sign(st.v)
            let dist: number | null = null
            let dur = 0
            if (st.target === null) {
              dur = st.brakeMs
              dist = (speedNow * dur) / 3
            } else {
              // Distance still to travel to reach the target, plus whole laps.
              const need = mod(dir * (st.target - o), ch)
              for (let lap = 0; lap < 4 && dist === null; lap++) {
                const d = need + lap * ch
                const t = (3 * d) / speedNow
                if (t >= BRAKE_MIN && t <= BRAKE_MAX) {
                  dist = d
                  dur = t
                }
              }
            }
            if (dist !== null) {
              st.mode = "brake"
              st.b = { t0: now, dur, o1: o, dir, dist }
            }
          }
        } else if (st.mode === "brake" && st.b) {
          spinning = true
          const u = Math.min(1, (now - st.b.t0) / st.b.dur)
          // Velocity falls as (1-u)^2, so position is this cubic: it starts at
          // the speed the column already had and ends at exactly `dist`.
          o = st.b.o1 + st.b.dir * st.b.dist * (1 - (1 - u) ** 3)
          if (u >= 1) {
            if (st.target !== null) o = st.target
            st.mode = "rest"
            st.v = 0
            st.b = null
          }
        }

        offsets.current[c] = mod(o, ch)
      }
      writeTracks()

      if (!spinning && settle.current) {
        const done = settle.current
        settle.current = null
        setActiveId(done.id)
        done.resolve()
      }
      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [meta, baseV, spinV, reduced, columnCount, parallax, writePlane, writeTracks])

  useImperativeHandle(
    ref,
    () => ({
      spinTo(id) {
        const hit = locate(id)
        if (!hit || reduced) {
          if (hit) {
            offsets.current[hit.c] = offsetFor(hit.c, hit.index)
            writeTracks()
          }
          setActiveId(id)
          return Promise.resolve()
        }
        setActiveId(null)
        return new Promise<void>((resolve) => {
          settle.current?.resolve()
          settle.current = { id, resolve }
          cols.current.forEach((st, c) => {
            st.mode = "spin"
            st.spinStart = clock.current
            st.b = null
            const isWinner = c === hit.c
            st.target = isWinner ? offsetFor(c, hit.index) : null
            st.brakeAfter = isWinner ? 0.6 : 0.4 + 0.5 * frac(c * 0.7548 + 0.2)
            st.brakeMs = 1.1 + 0.8 * frac(c * 0.5698 + 0.1)
          })
        })
      },
      jumpTo(id) {
        const hit = locate(id)
        if (hit) {
          offsets.current[hit.c] = offsetFor(hit.c, hit.index)
          writeTracks()
        }
        setActiveId(id)
      },
    }),
    [locate, offsetFor, reduced, writeTracks],
  )

  // A tile moves under the pointer while spinning, so press and release can land
  // on different tiles and a per-tile click would be lost. Remember the tile
  // under the press; the click that bubbles to the wall acts on that one.
  const pressed = useRef<string | null>(null)
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const tile = (e.target as HTMLElement).closest<HTMLElement>("[data-tile-id]")
    pressed.current = tile?.dataset.tileId ?? null
  }
  const onClick = () => {
    const id = pressed.current
    pressed.current = null
    if (id) onSelect?.(id)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || parallax <= 0) return
    const r = containerRef.current?.getBoundingClientRect()
    if (!r) return
    pointer.current = { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }
  }

  return (
    <div
      ref={containerRef}
      className={className}
      aria-hidden="true"
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onPointerLeave={() => (pointer.current = { x: 0, y: 0 })}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        perspective: `${perspective}px`,
        perspectiveOrigin: "50% 50%",
        ...style,
      }}
    >
      <div
        ref={planeRef}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {columnItems.map((col, c) => {
          const m = meta[c]
          return (
            <div
              key={c}
              style={{
                position: "absolute",
                top: 0,
                left: (c - (columnItems.length - 1) / 2) * colW - colW / 2,
                width: colW,
                height: 0,
                transformStyle: "preserve-3d",
              }}
            >
              <div
                ref={(el) => {
                  trackRefs.current[c] = el
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: m.base,
                  width: colW,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
              >
                {Array.from({ length: m.copies }, (_, copy) =>
                  col.map((item) => (
                    <Slot
                      key={`${copy}-${item.id}`}
                      item={item}
                      active={activeId === item.id}
                      renderTile={renderTile}
                      height={unit}
                      pad={g / 2}
                    />
                  )),
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
