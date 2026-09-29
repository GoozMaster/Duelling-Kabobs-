import type { CSSProperties, ReactNode } from "react";

import { C } from "./theme";

/**
 * Everything that moves is drawn fresh as SVG, per the README: a heavy
 * near-black keyline of even weight, flat fills, no gradients, one hard cast
 * shadow. Rasters are never animated.
 */

const K = { stroke: C.ink, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// ------------------------------------------------------------ small shapes

export function Burst({
  points,
  outer,
  inner,
  fill,
  strokeWidth = 6,
}: {
  points: number;
  outer: number;
  inner: number;
  fill: string;
  strokeWidth?: number;
}) {
  const d =
    Array.from({ length: points * 2 }, (_, i) => {
      const r = i % 2 ? inner : outer;
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      return `${i ? "L" : "M"}${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
    }).join(" ") + "Z";
  return <path d={d} fill={fill} {...K} strokeWidth={strokeWidth} />;
}

/** An SVG positioned in the frame by its top-left corner. */
export function Art({
  x,
  y,
  w,
  h,
  viewBox,
  children,
  style,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  viewBox: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox={viewBox} style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "visible", ...style }}>
      {children}
    </svg>
  );
}

// ------------------------------------------------------------ kitchen things

/** A lemon, 120×90. */
export function Lemon() {
  return (
    <g>
      <path
        d="M14 46 C8 40 10 34 18 30 C30 12 54 6 76 12 C92 16 104 26 108 36 C114 38 116 44 110 50 C108 66 94 80 70 84 C46 88 24 78 16 62 C8 58 8 50 14 46 Z"
        fill={C.yellow}
        {...K}
      />
      <path d="M40 30 C50 24 64 22 76 26" fill="none" stroke={C.raised} strokeWidth={6} strokeLinecap="round" opacity={0.8} />
      <path d="M60 12 C62 4 70 0 78 2" fill="none" {...K} />
      <path d="M70 6 C80 -4 96 -2 100 6 C90 12 80 12 70 6 Z" fill={C.basil} {...K} strokeWidth={4} />
    </g>
  );
}

/** A spice jar, 80×120, lid colour and label text supplied. */
export function Jar({ lid, label }: { lid: string; label: string }) {
  return (
    <g>
      <rect x="6" y="26" width="68" height="92" rx="14" fill={C.raised} {...K} />
      <rect x="10" y="2" width="60" height="28" rx="8" fill={lid} {...K} />
      <rect x="14" y="54" width="52" height="38" rx="6" fill={C.surface} stroke={C.ink} strokeWidth={3} />
      <text
        x="40"
        y="79"
        textAnchor="middle"
        fontFamily="Fredoka"
        fontWeight={600}
        fontSize={label.length > 7 ? 11 : 13}
        fill={C.ink}
      >
        {label}
      </text>
    </g>
  );
}

/** A sauce bottle, 70×150. */
export function Bottle({ body, label }: { body: string; label: string }) {
  return (
    <g>
      <path d="M26 4 H44 V34 C60 42 66 54 66 70 V140 C66 146 62 148 56 148 H14 C8 148 4 146 4 140 V70 C4 54 10 42 26 34 Z" fill={body} {...K} />
      <rect x="22" y="0" width="26" height="16" rx="4" fill={C.ink} />
      <rect x="10" y="82" width="50" height="40" rx="6" fill={C.raised} stroke={C.ink} strokeWidth={3} />
      <text x="35" y="107" textAnchor="middle" fontFamily="Fredoka" fontWeight={600} fontSize={label.length > 6 ? 10 : 12} fill={C.ink}>
        {label}
      </text>
    </g>
  );
}

/** A dry-goods box — rice, noodles — 110×140. */
export function Box({ body, label }: { body: string; label: string }) {
  return (
    <g>
      <path d="M6 20 L20 4 H104 V124 C104 132 100 136 92 136 H14 C8 136 6 132 6 126 Z" fill={body} {...K} />
      <path d="M6 20 H90 L104 4" fill="none" {...K} />
      <path d="M90 20 V136" fill="none" {...K} strokeWidth={4} />
      <rect x="14" y="48" width="68" height="52" rx="8" fill={C.raised} stroke={C.ink} strokeWidth={3} />
      <text x="48" y="80" textAnchor="middle" fontFamily="Fredoka" fontWeight={600} fontSize={label.length > 8 ? 11 : 13} fill={C.ink}>
        {label}
      </text>
    </g>
  );
}

/** A frosted freezer bag of protein, 130×100. */
export function FreezerBag({ label, fill }: { label: string; fill: string }) {
  return (
    <g>
      <path d="M8 18 H122 L118 90 C118 96 114 98 108 98 H22 C16 98 12 96 12 90 Z" fill={C.tealSoft} {...K} />
      <path d="M8 18 H122" {...K} strokeWidth={8} stroke={C.teal} />
      <ellipse cx="65" cy="58" rx="36" ry="20" fill={fill} {...K} strokeWidth={4} />
      <path d="M22 36 L30 30 M100 40 L108 34 M28 80 L36 76" stroke={C.raised} strokeWidth={5} strokeLinecap="round" />
      <text x="65" y="118" textAnchor="middle" fontFamily="Fredoka" fontWeight={600} fontSize={14} fill={C.ink}>
        {label}
      </text>
    </g>
  );
}

/** The pot from the site's cooking animation, redrawn at 240×210. */
export function Pot({ lidLift = 0, lidTilt = 0 }: { lidLift?: number; lidTilt?: number }) {
  return (
    <g>
      <path d="M40 110 q-24 0 -24 24" fill="none" {...K} strokeWidth={9} />
      <path d="M200 110 q24 0 24 24" fill="none" {...K} strokeWidth={9} />
      <path d="M36 90 h168 l-12 86 a16 16 0 0 1 -16 14 h-112 a16 16 0 0 1 -16 -14 z" fill={C.brick} {...K} />
      <path d="M52 120 h136" stroke={C.ink} strokeWidth={4} opacity={0.35} />
      <g transform={`translate(0 ${-lidLift}) rotate(${lidTilt} 120 90)`}>
        <path d="M28 92 q92 -34 184 0 z" fill={C.sand} {...K} />
        <circle cx="120" cy="64" r="12" fill={C.gold} {...K} strokeWidth={5} />
      </g>
    </g>
  );
}

/** A gas flame, 60×70, whose flicker is driven from outside. */
export function Flame({ flicker }: { flicker: number }) {
  return (
    <g transform={`scale(${1 + 0.06 * Math.sin(flicker * 17)}, ${1 + 0.1 * Math.sin(flicker * 23)})`} style={{ transformOrigin: "30px 70px" }}>
      <path
        d="M30 70 c-18 0 -28 -12 -28 -26 c0 -12 8 -18 12 -26 c2 8 4 12 8 14 c-4 -16 4 -26 16 -32 c-2 12 2 18 8 26 c6 8 10 14 10 24 c0 12 -10 20 -26 20 z"
        fill={C.yellow}
        {...K}
        strokeWidth={5}
      />
      <path d="M30 64 c-8 0 -12 -6 -12 -12 c0 -6 4 -8 6 -12 c2 6 4 8 6 8 c-2 -6 2 -10 6 -12 c0 6 2 8 4 12 c2 4 2 6 2 8 c0 6 -4 8 -12 8 z" fill={C.gold} />
    </g>
  );
}

/** A steam puff, 1 unit radius, scaled by the caller. */
export function Puff({ x, y, r }: { x: number; y: number; r: number }) {
  return <circle cx={x} cy={y} r={r} fill={C.raised} {...K} strokeWidth={4} />;
}

/** A drumstick, for "food". 120×110 */
export function Drumstick() {
  return (
    <g>
      <path d="M78 78 L102 100" {...K} strokeWidth={22} stroke={C.ink} />
      <path d="M78 78 L102 100" strokeWidth={12} stroke={C.raised} strokeLinecap="round" />
      <circle cx="104" cy="96" r="9" fill={C.raised} {...K} strokeWidth={4} />
      <circle cx="96" cy="106" r="9" fill={C.raised} {...K} strokeWidth={4} />
      <path d="M20 22 C44 -2 92 10 92 50 C92 74 74 90 50 86 C22 82 -2 50 20 22 Z" fill="#b8651b" {...K} />
      <path d="M30 30 C42 20 60 20 70 30" fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round" />
    </g>
  );
}

/** A rubber chicken, for "humor". 150×110 */
export function RubberChicken() {
  return (
    <g>
      <path d="M26 30 C22 16 32 6 44 10 C50 2 60 4 60 14 C58 22 52 26 52 34 C60 46 86 52 110 52 C130 52 144 60 144 74 C144 92 122 102 96 100 C62 98 36 84 30 60 C28 50 28 40 26 30 Z" fill={C.yellow} {...K} />
      <path d="M26 30 L8 34 L24 42" fill={C.gold} {...K} strokeWidth={5} />
      <path d="M40 8 C38 0 46 -4 50 2 C52 -4 60 -2 58 6" fill={C.brick} {...K} strokeWidth={4} />
      <circle cx="40" cy="24" r="7" fill={C.raised} stroke={C.ink} strokeWidth={4} />
      <path d="M36 21 L44 27 M44 21 L36 27" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
      <path d="M40 56 C44 64 40 70 34 72" fill="none" stroke={C.brick} strokeWidth={5} strokeLinecap="round" />
      <path d="M86 98 L80 112 M104 98 L106 112" {...K} strokeWidth={5} />
    </g>
  );
}

/** A stack of three plates with a heart, for "family". 140×110 */
export function Plates() {
  return (
    <g>
      {[78, 60, 42].map((y, i) => (
        <g key={i}>
          <ellipse cx="70" cy={y + 18} rx="64" ry="16" fill={C.raised} {...K} strokeWidth={5} />
          <ellipse cx="70" cy={y + 15} rx="40" ry="8" fill="none" stroke={C.ink} strokeWidth={3} opacity={0.4} />
        </g>
      ))}
      <path d="M70 40 C52 26 40 10 52 0 C60 -6 68 -2 70 6 C72 -2 80 -6 88 0 C100 10 88 26 70 40 Z" fill={C.brick} {...K} strokeWidth={5} />
    </g>
  );
}

/** A pencil, pointing down-left, 160×40, tip at (0, 34). */
export function Pencil() {
  return (
    <g>
      <path d="M26 16 L150 -18 L158 8 L34 42 Z" fill={C.yellow} {...K} strokeWidth={5} />
      <path d="M150 -18 L158 8 L168 5 L160 -21 Z" fill={C.brick} {...K} strokeWidth={5} />
      <path d="M26 16 L34 42 L0 36 Z" fill={C.sand} {...K} strokeWidth={5} />
      <path d="M8 30 L0 36 L10 38 Z" fill={C.ink} />
    </g>
  );
}

/** A big check mark in a circle. 120×120 */
export function Check({ color = C.basil }: { color?: string }) {
  return (
    <g>
      <circle cx="60" cy="60" r="54" fill={color} {...K} />
      <path d="M34 62 L54 82 L88 40" fill="none" stroke={C.raised} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}
