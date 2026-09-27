import { useId } from "react"

import type { StockGroup, StockZone } from "@/lib/stock"

import { Glyph, packShelves, type Shelf } from "./glyphs"
import s from "./stock.module.css"

type Props = {
  zone: StockZone
  groups: StockGroup[]
  open: boolean
}

/**
 * The pantry cabinet, fridge and freezer, each with a door that swings open
 * when its section comes into view.
 *
 * The swing is a scaleX from 1 to a small negative number about the hinge: the
 * door narrows to an edge and carries on past it, which reads as a door opening
 * towards you without needing 3D transforms (which SVG content does not get).
 * Halfway through, the front face hands over to the door's inside face.
 */
export function ZoneArt({ zone, groups, open }: Props) {
  const shelves = SHELVES[zone]
  const { placed, overflow } = packShelves(groups, zone, shelves)
  const total = placed.length + overflow

  const Art = ART[zone]

  return (
    <div className={s.artWrap}>
      <svg
        viewBox="0 0 320 300"
        className={`${s.art} ${open ? s.open : ""}`}
        role="img"
        aria-label={`${LABEL[zone]} illustration: ${total} ${total === 1 ? "item" : "items"}${
          overflow > 0 ? `, ${placed.length} drawn on the shelves` : ""
        }. The door is ${open ? "open" : "closed"}.`}
      >
        <Art>
          {placed.map((glyph, index) => (
            <Glyph key={glyph.entry.item.id} glyph={glyph} index={index} />
          ))}
          {total === 0 && (
            <text x={160} y={150} textAnchor="middle" className={s.emptyText}>
              empty
            </text>
          )}
        </Art>
      </svg>
      <p className={s.artCaption}>
        {overflow > 0
          ? `${placed.length} of ${total} on show. Every category gets a spot.`
          : total === 0
            ? "Nothing on the shelves yet."
            : `All ${total} on the shelves. Hover one to see what it is.`}
      </p>
    </div>
  )
}

const LABEL: Record<StockZone, string> = {
  pantry: "Pantry cabinet",
  fridge: "Fridge",
  freezer: "Freezer",
}

const shelf = (left: number, right: number, floor: number): Shelf => ({ left, right, floor })

const SHELVES: Record<StockZone, Shelf[]> = {
  pantry: [78, 118, 158, 198, 236, 270].map((floor) => shelf(85, 236, floor)),
  fridge: [80, 140, 200, 266].map((floor) => shelf(99, 222, floor)),
  freezer: [86, 148, 210, 268].map((floor) => shelf(99, 222, floor)),
}

const ART: Record<StockZone, (props: { children: React.ReactNode }) => React.ReactNode> = {
  pantry: PantryArt,
  fridge: FridgeArt,
  freezer: FreezerArt,
}

/* -------------------------------------------------------------------------- */

function PantryArt({ children }: { children: React.ReactNode }) {
  // clipPath ids are document-global, and a page could render this twice.
  const id = `pantry${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  return (
    <>
      <ellipse className={s.floorShadow} cx={160} cy={288} rx={120} ry={7} />

      {/* Carcass */}
      <rect className={s.wood} x={70} y={24} width={180} height={258} rx={6} />
      <rect className={s.woodDark} x={80} y={32} width={160} height={240} rx={3} />
      <rect className={s.wood} x={62} y={14} width={196} height={14} rx={4} />
      <rect className={s.wood} x={78} y={280} width={14} height={8} rx={2} />
      <rect className={s.wood} x={228} y={280} width={14} height={8} rx={2} />

      {/* The hanging bulb swings once when the doors open. */}
      <clipPath id={`${id}-pantry`}>
        <rect x={80} y={32} width={160} height={240} />
      </clipPath>
      <circle className={s.warmGlow} cx={160} cy={42} r={80} clipPath={`url(#${id}-pantry)`} />
      <g className={s.bulb}>
        <line className={s.cord} x1={160} y1={32} x2={160} y2={37} />
        <circle className={s.bulbGlass} cx={160} cy={41} r={4.5} />
      </g>

      {[78, 118, 158, 198, 236].map((y) => (
        <rect key={y} className={s.shelfBoard} x={80} y={y} width={160} height={4} />
      ))}

      {children}

      {/* Doors, hinged on the outside edges. */}
      <g className={`${s.door} ${s.hingeLeft}`}>
        <g className={s.front}>
          <rect className={s.woodLight} x={74} y={28} width={86} height={248} rx={4} />
          <rect className={s.panel} x={84} y={40} width={66} height={100} rx={4} />
          <rect className={s.panel} x={84} y={152} width={66} height={112} rx={4} />
          <circle className={s.knob} cx={151} cy={146} r={4} />
        </g>
        <g className={s.back}>
          <rect className={s.woodInside} x={74} y={28} width={86} height={248} rx={4} />
          <SpiceRack x={82} width={70} />
        </g>
      </g>
      <g className={`${s.door} ${s.hingeRight}`}>
        <g className={s.front}>
          <rect className={s.woodLight} x={160} y={28} width={86} height={248} rx={4} />
          <rect className={s.panel} x={170} y={40} width={66} height={100} rx={4} />
          <rect className={s.panel} x={170} y={152} width={66} height={112} rx={4} />
          <circle className={s.knob} cx={169} cy={146} r={4} />
        </g>
        <g className={s.back}>
          <rect className={s.woodInside} x={160} y={28} width={86} height={248} rx={4} />
          <SpiceRack x={168} width={70} />
        </g>
      </g>
    </>
  )
}

/** Rails of tiny jars on the inside of a pantry door. Decoration only. */
function SpiceRack({ x, width }: { x: number; width: number }) {
  return (
    <>
      {[84, 144, 204].map((rail) => (
        <g key={rail}>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              className={s[`t${(i + rail) % 6}`]}
              x={x + 4 + i * 13}
              y={rail - 16}
              width={9}
              height={16}
              rx={2}
            />
          ))}
          <rect className={s.rail} x={x} y={rail - 6} width={width} height={4} rx={2} />
        </g>
      ))}
    </>
  )
}

/* -------------------------------------------------------------------------- */

function FridgeArt({ children }: { children: React.ReactNode }) {
  const id = `fridge${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  return (
    <>
      <ellipse className={s.floorShadow} cx={160} cy={290} rx={100} ry={7} />

      <rect className={s.steel} x={84} y={12} width={152} height={276} rx={14} />
      <rect className={s.coldInterior} x={94} y={22} width={132} height={256} rx={8} />
      <clipPath id={id}>
        <rect x={94} y={22} width={132} height={256} rx={8} />
      </clipPath>
      <ellipse className={s.coolGlow} cx={160} cy={40} rx={90} ry={110} clipPath={`url(#${id})`} />
      <rect className={s.lamp} x={148} y={24} width={24} height={6} rx={3} />

      {[80, 140, 200].map((y) => (
        <rect key={y} className={s.glassShelf} x={94} y={y} width={132} height={4} />
      ))}

      {children}

      {/* Crisper drawer front, drawn over the bottom shelf's contents. */}
      <rect className={s.crisper} x={97} y={226} width={126} height={46} rx={5} />
      <rect className={s.crisperHandle} x={140} y={232} width={40} height={4} rx={2} />

      <g className={`${s.door} ${s.hingeLeft}`}>
        <g className={s.front}>
          <rect className={s.steel} x={84} y={12} width={152} height={276} rx={14} />
          <rect className={s.steelShade} x={216} y={60} width={8} height={90} rx={4} />
          {/* A shopping list under a magnet, because every fridge has one. */}
          <g transform="rotate(-6 122 70)">
            <rect className={s.note} x={104} y={48} width={40} height={46} rx={2} />
            {[60, 68, 76, 84].map((y) => (
              <line key={y} className={s.noteLine} x1={109} x2={139} y1={y} y2={y} />
            ))}
            <circle className={s.magnet} cx={124} cy={50} r={5} />
          </g>
        </g>
        <g className={s.back}>
          <rect className={s.steelInside} x={84} y={12} width={152} height={276} rx={14} />
          {[92, 162, 232].map((y) => (
            <g key={y}>
              {[0, 1, 2, 3].map((i) => (
                <rect
                  key={i}
                  className={s[`t${(i + y) % 6}`]}
                  x={104 + i * 30}
                  y={y - 30}
                  width={12}
                  height={30}
                  rx={3}
                />
              ))}
              <rect className={s.doorBin} x={96} y={y - 14} width={128} height={20} rx={4} />
            </g>
          ))}
        </g>
      </g>
    </>
  )
}

/* -------------------------------------------------------------------------- */

function FreezerArt({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ellipse className={s.floorShadow} cx={160} cy={290} rx={100} ry={7} />

      <rect className={s.steel} x={84} y={12} width={152} height={276} rx={14} />
      <rect className={s.frozenInterior} x={94} y={22} width={132} height={256} rx={8} />
      <path
        className={s.frost}
        d="M94 30 q8 10 16 2 q8 10 16 0 q8 12 16 2 q8 10 16 0 q8 12 16 2 q8 10 16 0 q8 10 16 2 q8 8 14 -2 V22 H94 Z"
      />

      {children}

      {/* Wire basket fronts sit in front of what is in them. */}
      {[86, 148, 210, 268].map((y) => (
        <g key={y}>
          <rect className={s.basket} x={96} y={y - 10} width={128} height={10} rx={2} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={i} className={s.wire} x1={104 + i * 16} x2={104 + i * 16} y1={y - 10} y2={y} />
          ))}
        </g>
      ))}

      {/* Cold air rolling out once the door is open. */}
      <g className={s.mist}>
        <ellipse cx={120} cy={266} rx={16} ry={8} />
        <ellipse cx={160} cy={272} rx={20} ry={9} />
        <ellipse cx={200} cy={264} rx={16} ry={8} />
        <ellipse cx={140} cy={250} rx={12} ry={6} />
      </g>

      <g className={`${s.door} ${s.hingeRight}`}>
        <g className={s.front}>
          <rect className={s.steel} x={84} y={12} width={152} height={276} rx={14} />
          <rect className={s.steelShade} x={96} y={60} width={8} height={90} rx={4} />
          <path className={s.frostEdge} d="M84 40 q0 -28 28 -28 h14 q-10 6 -18 4 q-8 10 -16 6 q-2 12 -8 18 z" />
          <path className={s.frostEdge} d="M236 260 q0 28 -28 28 h-14 q10 -6 18 -4 q8 -10 16 -6 q2 -12 8 -18 z" />
          <Snowflake cx={170} cy={70} r={16} />
        </g>
        <g className={s.back}>
          <rect className={s.steelInside} x={84} y={12} width={152} height={276} rx={14} />
          {[92, 162, 232].map((y) => (
            <g key={y}>
              <rect className={s.iceTray} x={104} y={y - 20} width={112} height={16} rx={3} />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect key={i} className={s.iceCube} x={108 + i * 18} y={y - 17} width={14} height={10} rx={2} />
              ))}
              <rect className={s.doorBin} x={96} y={y - 4} width={128} height={8} rx={3} />
            </g>
          ))}
        </g>
      </g>
    </>
  )
}

function Snowflake({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g className={s.snowflake}>
      {[0, 60, 120].map((angle) => (
        <g key={angle} transform={`rotate(${angle} ${cx} ${cy})`}>
          <line x1={cx} x2={cx} y1={cy - r} y2={cy + r} />
          <polyline points={`${cx - 5},${cy - r + 3} ${cx},${cy - r + 8} ${cx + 5},${cy - r + 3}`} />
          <polyline points={`${cx - 5},${cy + r - 3} ${cx},${cy + r - 8} ${cx + 5},${cy + r - 3}`} />
        </g>
      ))}
    </g>
  )
}
