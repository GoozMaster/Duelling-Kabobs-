"use client"

import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo"
import type { GeoPermissibleObjects, GeoProjection } from "d3-geo"
import { useEffect, useRef } from "react"
import { feature } from "topojson-client"
import type { Topology } from "topojson-specification"

import { usePrefersReducedMotion } from "@/components/home/use-scroll-frame"
import { GLOBE_FACES, type GlobeFace, cuisineForCountry } from "@/lib/cuisine-geography"

/**
 * Makes the server-rendered globe turn.
 *
 * Strictly an enhancement. The globe is already a complete, working, keyboard
 * navigable picture before this file loads — real <a> elements with real hrefs,
 * drawn on the server. This rewrites their `d` attributes in place rather than
 * re-rendering anything, so if it never loads, or the fetch fails, or the
 * visitor has asked for reduced motion, what they are left with is the working
 * version rather than a broken one.
 *
 * The 108KB topology is fetched from public/ on first interaction rather than
 * imported. Importing it would put it in the page bundle for everyone,
 * including the people who never touch the globe and the ones who opted out of
 * motion entirely; fetching it makes it a separate, cacheable request paid for
 * only by the people who actually turn the thing.
 */

const IDLE_SPEED = 3 // degrees per second — a drift, not a carousel
const DRAG_SCALE = 0.35 // pixels to degrees

type Layer = {
  projection: GeoProjection
  render: (shape: GeoPermissibleObjects) => string
  land: GeoPermissibleObjects
  graticule: GeoPermissibleObjects
  countries: Map<string, GeoPermissibleObjects>
}

/** Matches the server's rounding so taking over cannot shift anything. */
function roundedContext() {
  let d = ""
  return {
    beginPath() {},
    moveTo(x: number, y: number) {
      d += `M${x.toFixed(2)},${y.toFixed(2)}`
    },
    lineTo(x: number, y: number) {
      d += `L${x.toFixed(2)},${y.toFixed(2)}`
    },
    arc() {},
    closePath() {
      d += "Z"
    },
    result() {
      const out = d
      d = ""
      return out
    },
  }
}

export function GlobeDrag({ face }: { face: GlobeFace }) {
  const reduced = usePrefersReducedMotion()
  const rotation = useRef<[number, number]>([...GLOBE_FACES[face].rotate])

  useEffect(() => {
    // Undecided or opted out: do nothing at all, and in particular do not
    // fetch 108KB on behalf of someone who will never see it move.
    if (reduced !== false) return

    const svg = document.querySelector<SVGSVGElement>("svg[data-globe]")
    if (!svg) return

    const size = Number(svg.dataset.size ?? 640)
    let layer: Layer | null = null
    let frame = 0
    let last = 0
    let dragging = false
    let paused = false
    let loading = false
    let stopped = false

    const paint = () => {
      if (!layer) return

      layer.projection.rotate(rotation.current)

      const graticuleEl = svg.querySelector<SVGPathElement>('[data-layer="graticule"]')
      const landEl = svg.querySelector<SVGPathElement>('[data-layer="land"]')
      if (graticuleEl) graticuleEl.setAttribute("d", layer.render(layer.graticule))
      if (landEl) landEl.setAttribute("d", layer.render(layer.land))

      for (const anchor of svg.querySelectorAll<SVGAElement>("[data-country]")) {
        const shape = layer.countries.get(anchor.dataset.country ?? "")
        const pathEl = anchor.querySelector("path")
        if (!shape || !pathEl) continue

        const d = layer.render(shape)
        pathEl.setAttribute("d", d)

        // A country on the far side draws nothing. Leaving it in place would
        // leave a focusable zero-area link in the tab order, so it goes fully
        // out of the document until it comes back round.
        if (d) {
          anchor.removeAttribute("hidden")
          anchor.setAttribute("tabindex", "0")
        } else {
          anchor.setAttribute("hidden", "")
          anchor.setAttribute("tabindex", "-1")
        }
      }
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const elapsed = now - (last || now)
      last = now

      if (paused || dragging || !layer) return

      rotation.current = [
        rotation.current[0] + (IDLE_SPEED * elapsed) / 1000,
        rotation.current[1],
      ]
      paint()
    }

    const load = async () => {
      if (layer || loading) return
      loading = true

      try {
        const response = await fetch("/world-110m.json")
        if (!response.ok) return

        const topology = (await response.json()) as Topology
        if (stopped) return

        const projection = geoOrthographic()
          .rotate(rotation.current)
          .fitSize([size, size], { type: "Sphere" })

        const ctx = roundedContext()
        const drawer = geoPath(projection, ctx)

        const fc = feature(topology, topology.objects.countries) as unknown as {
          features: Array<{ id?: string | number }>
        }

        const countries = new Map<string, GeoPermissibleObjects>()
        for (const f of fc.features) {
          if (cuisineForCountry(f.id)) {
            countries.set(String(f.id), f as unknown as GeoPermissibleObjects)
          }
        }

        layer = {
          projection,
          render: (shape) => {
            drawer(shape)
            return ctx.result()
          },
          land: feature(topology, topology.objects.land) as unknown as GeoPermissibleObjects,
          graticule: geoGraticule10(),
          countries,
        }

        frame = requestAnimationFrame(tick)
      } finally {
        loading = false
      }
    }

    // Idle spin should not start the moment the page loads — a globe that
    // begins turning under a cursor already resting on a country is a globe
    // that moves the link out from under it. It starts once the visitor shows
    // any intent to interact with the page.
    const wake = () => void load()

    let startX = 0
    let startRotation: [number, number] = [0, 0]

    const onPointerDown = (event: PointerEvent) => {
      void load()
      dragging = true
      startX = event.clientX
      startRotation = [...rotation.current]
      // Capture keeps the drag alive when the pointer leaves the circle, but it
      // throws if the pointer is already gone. Losing capture degrades to a
      // drag that stops at the edge; letting it throw would abandon the drag
      // half-initialised with the cursor stuck on "grabbing".
      try {
        svg.setPointerCapture(event.pointerId)
      } catch {
        // Not capturable; the drag still works inside the element.
      }
      svg.style.cursor = "grabbing"
    }

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return
      rotation.current = [
        startRotation[0] + (event.clientX - startX) * DRAG_SCALE,
        startRotation[1],
      ]
      paint()
    }

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      try {
        svg.releasePointerCapture(event.pointerId)
      } catch {
        // Already released, or never captured.
      }
      svg.style.cursor = ""
    }

    // Pause whenever someone is reading or aiming: under the pointer, holding
    // keyboard focus inside the globe, or with the tab in the background.
    const pause = () => {
      paused = true
    }
    const resume = () => {
      paused = false
    }
    const onVisibility = () => {
      paused = document.hidden
    }

    svg.style.cursor = "grab"
    svg.addEventListener("pointerdown", onPointerDown)
    svg.addEventListener("pointermove", onPointerMove)
    svg.addEventListener("pointerup", onPointerUp)
    svg.addEventListener("pointercancel", onPointerUp)
    svg.addEventListener("pointerenter", pause)
    svg.addEventListener("pointerleave", resume)
    svg.addEventListener("focusin", pause)
    svg.addEventListener("focusout", resume)
    document.addEventListener("visibilitychange", onVisibility)

    window.addEventListener("pointerdown", wake, { once: true })
    window.addEventListener("keydown", wake, { once: true })
    window.addEventListener("scroll", wake, { once: true, passive: true })

    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      svg.style.cursor = ""
      svg.removeEventListener("pointerdown", onPointerDown)
      svg.removeEventListener("pointermove", onPointerMove)
      svg.removeEventListener("pointerup", onPointerUp)
      svg.removeEventListener("pointercancel", onPointerUp)
      svg.removeEventListener("pointerenter", pause)
      svg.removeEventListener("pointerleave", resume)
      svg.removeEventListener("focusin", pause)
      svg.removeEventListener("focusout", resume)
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pointerdown", wake)
      window.removeEventListener("keydown", wake)
      window.removeEventListener("scroll", wake)
    }
  }, [reduced])

  return null
}
