import { geoGraticule10, geoOrthographic, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import topo from "world-atlas/countries-110m.json";

import { cuisineForCountry } from "../../src/lib/cuisine-geography";
import { C } from "./theme";

/**
 * The by-cuisine globe, drawn the way src/app/recipes/by-cuisine/globe.tsx
 * draws it — sky ocean, sand land, faint graticule, each country filled with
 * its cuisine's colour — from the same atlas and the same country→cuisine
 * table, so the video's globe is the site's globe rather than a lookalike.
 */

const FILL: Record<string, string> = {
  Italian: C.basil,
  French: C.teal,
  Asian: C.brick,
  Indian: C.gold,
  Mediterranean: C.yellow,
  American: C.teal,
  Latin: C.brick,
};

const topology = topo as unknown as Topology;
const countries = feature(topology, topology.objects.countries) as unknown as {
  features: Array<{ id?: string | number }>;
};
const land = feature(topology, topology.objects.land) as unknown as GeoPermissibleObjects;
const regions = countries.features.flatMap((f) => {
  const cuisine = cuisineForCountry(f.id);
  return cuisine && FILL[cuisine] ? [{ id: String(f.id), fill: FILL[cuisine], shape: f as unknown as GeoPermissibleObjects }] : [];
});

export function Globe({ size, rotate }: { size: number; rotate: [number, number] }) {
  const projection = geoOrthographic().rotate(rotate).fitSize([size, size], { type: "Sphere" });
  const path = geoPath(projection);
  const d = (shape: GeoPermissibleObjects) => path(shape) ?? "";
  return (
    <svg width={size} height={size} viewBox={`-8 -8 ${size + 16} ${size + 16}`} style={{ overflow: "visible" }}>
      <path d={d({ type: "Sphere" })} fill={C.sky} stroke={C.ink} strokeWidth={8} />
      <path d={d(geoGraticule10())} fill="none" stroke={C.ink} strokeWidth={1} opacity={0.25} />
      <path d={d(land)} fill={C.sand} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
      {regions.map((r) => (
        <path key={r.id} d={d(r.shape)} fill={r.fill} stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
      ))}
    </svg>
  );
}

/** Where a longitude/latitude lands on a globe of this size and rotation. */
export function project(size: number, rotate: [number, number], lonLat: [number, number]) {
  const projection = geoOrthographic().rotate(rotate).fitSize([size, size], { type: "Sphere" });
  return projection(lonLat) ?? [size / 2, size / 2];
}
