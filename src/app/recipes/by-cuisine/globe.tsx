import { geoGraticule10, geoOrthographic, geoPath } from "d3-geo"
import type { GeoPermissibleObjects } from "d3-geo"
import { feature } from "topojson-client"
import type { Topology } from "topojson-specification"
import topo from "world-atlas/countries-110m.json"

import {
  CUISINE_FILL,
  GLOBE_FACES,
  type GlobeFace,
  cuisineForCountry,
} from "@/lib/cuisine-geography"
import type { CuisineCount } from "@/lib/recipe-browse"

import { GlobeDrag } from "./globe-drag"
import { GlobeKeys } from "./globe-keys"

import s from "./by-cuisine.module.css"

const SIZE = 640

/**
 * Rounds every coordinate d3 emits to two decimals.
 *
 * geoPath writes full-precision floats, which is a lot of bytes for sub-pixel
 * detail nobody can see. Rounding also means the drag enhancement recomputing
 * this same default frame in the browser produces character-identical path
 * data, so taking over cannot nudge anything by a fraction of a pixel.
 *
 * Mirrors the technique in components/home/sunburst.tsx, where the same trick
 * is used on hand-written trigonometry.
 */
function roundedContext() {
  let d = ""
  return {
    beginPath() {
      // geoPath calls this once per shape; the accumulated string is cleared by
      // result() instead, so each draw() call starts empty either way.
    },
    moveTo(x: number, y: number) {
      d += `M${x.toFixed(2)},${y.toFixed(2)}`
    },
    lineTo(x: number, y: number) {
      d += `L${x.toFixed(2)},${y.toFixed(2)}`
    },
    arc() {
      // geoPath only calls arc() for point geometry, which nothing here uses.
    },
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

const topology = topo as unknown as Topology
const countries = feature(topology, topology.objects.countries) as unknown as {
  features: Array<{ id?: string | number; properties: { name: string } }>
}
const land = feature(topology, topology.objects.land) as unknown as GeoPermissibleObjects

type Props = {
  face: GlobeFace
  counts: CuisineCount[]
}

export function Globe({ face, counts }: Props) {
  const byCuisine = new Map(counts.map((c) => [c.name, c.count]))

  const projection = geoOrthographic()
    .rotate(GLOBE_FACES[face].rotate)
    .fitSize([SIZE, SIZE], { type: "Sphere" })

  const ctx = roundedContext()
  const path = geoPath(projection, ctx)

  const draw = (shape: unknown): string => {
    path(shape as GeoPermissibleObjects)
    return ctx.result()
  }

  const graticule = draw(geoGraticule10())
  const landPath = draw(land)

  // Only countries that both map to a cuisine AND have recipes in it are drawn
  // as regions. A cuisine the admin created but has not filled yet would
  // otherwise be a live link to an empty page — the same rule the filter chips
  // apply by greying a zero rather than hiding it.
  //
  // Countries on the far side are rendered too, with an empty path. They have
  // to exist in the DOM for the drag enhancement to be able to turn them into
  // view, but an empty path is a zero-area link — a keyboard trap on an
  // invisible object — so `hidden` takes them out of both the tab order and
  // the picture until they are actually facing us.
  const regions = countries.features.flatMap((f) => {
    const cuisine = cuisineForCountry(f.id)
    if (!cuisine) return []

    const count = byCuisine.get(cuisine) ?? 0
    if (count === 0) return []

    const d = draw(f as unknown as GeoPermissibleObjects)

    return [{ id: String(f.id), name: f.properties.name, cuisine, count, d }]
  })

  const sphere = draw({ type: "Sphere" })

  return (
    <div className={s.stage}>
      {/* The data- attributes are the contract the drag enhancement reads. It
          rewrites these paths in place rather than re-rendering anything, which
          is what lets the no-JS version above be the real one. */}
      <svg
        className={s.globe}
        data-globe=""
        data-size={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label="A globe. Countries are coloured by the cuisine they belong to; the list below it covers every cuisine, including the ones with no country."
      >
        <path d={sphere} className={s.ocean} />
        <path d={graticule} className={s.graticule} data-layer="graticule" />
        <path d={landPath} className={s.land} data-layer="land" />

        {regions.map((region) => (
          <a
            key={region.id}
            href={`/recipes?cuisine=${encodeURIComponent(region.cuisine)}`}
            className={s.region}
            data-cuisine={region.cuisine}
            data-country={region.id}
            hidden={!region.d}
            tabIndex={region.d ? 0 : -1}
          >
            <title>{`${region.name} — ${region.cuisine}, ${region.count} ${
              region.count === 1 ? "recipe" : "recipes"
            }`}</title>
            <path d={region.d} style={{ fill: CUISINE_FILL[region.cuisine] }} />
          </a>
        ))}
      </svg>

      <GlobeDrag face={face} />
      <GlobeKeys />

      {/* The hover/focus readout.
          One caption per cuisine, all rendered and all hidden, revealed by the
          :has() rules in the stylesheet. Doing it in CSS rather than with a
          mouseenter handler keeps the whole globe free of JavaScript and — the
          part that actually matters — gives keyboard users the identical
          readout on focus, which a pointer-only tooltip never would. */}
      <div className={s.readout} aria-hidden="true">
        {counts
          .filter(({ count }) => count > 0)
          .map(({ name, count }) => (
            <span key={name} className={s.caption} data-cap={name}>
              {name} — {count} {count === 1 ? "recipe" : "recipes"}
            </span>
          ))}
        <span className={s.captionIdle}>Point at a country, or pick from below.</span>
      </div>
    </div>
  )
}
