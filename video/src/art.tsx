import type { CSSProperties, ReactNode } from "react";

import { C } from "./theme";

/**
 * Everything that moves is drawn fresh as SVG, per the README: a heavy
 * near-black keyline of even weight, flat fills, no gradients, one hard cast
 * shadow. Rasters are never animated.
 */

const K = { stroke: C.ink, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

// ------------------------------------------------------------ the two cooks

// Sampled off duelling-kebabs.png, not tokens — same values as home.module.css.
const D = { skin: "#ecbf1c", cloth: "#f4f1ea", hair: "#050505", rod: "#e9e6dd", meat: "#734007", line: "#050505" };
const ln = { stroke: D.line, strokeWidth: 5, strokeLinejoin: "round" as const };
const brow = { stroke: D.line, strokeWidth: 11, strokeLinecap: "round" as const, fill: "none" };
const tooth = { stroke: D.line, strokeWidth: 2.5 };
const sleeveln = { stroke: D.line, strokeWidth: 32, strokeLinecap: "round" as const, fill: "none" };
const sleeve = { stroke: D.cloth, strokeWidth: 23, strokeLinecap: "round" as const, fill: "none" };
const rodline = { stroke: D.line, strokeWidth: 16, strokeLinecap: "round" as const, fill: "none" };
const rod = { stroke: D.rod, strokeWidth: 8, strokeLinecap: "round" as const, fill: "none" };
const meat = { fill: D.meat, stroke: D.line, strokeWidth: 3.5 };

/**
 * The duel, from src/components/home/duel-still.tsx, path for path. `left` and
 * `right` slide each cook in from off-stage; `clash` (0→1) flashes the spark
 * where the skewers cross.
 */
export function DuelCooks({
  left = 0,
  right = 0,
  leanL = 0,
  leanR = 0,
  clash = 0,
  style,
}: {
  left?: number;
  right?: number;
  leanL?: number;
  leanR?: number;
  clash?: number;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 960 560" style={{ overflow: "visible", ...style }}>
      <g transform={`translate(${left} 0) rotate(${leanL} 300 560)`}>
        <path style={{ ...ln, fill: D.cloth }} d="M236 560 V436 C236 396 264 374 300 374 C336 374 364 396 364 436 V560 Z" />
        <path d="M300 398 V560" stroke={D.line} strokeWidth="3" fill="none" opacity=".8" />
        <path style={sleeveln} d="M352 408 C392 390 414 348 418 310" />
        <path style={sleeve} d="M352 408 C392 390 414 348 418 310" />
        <path
          style={{ ...ln, fill: D.cloth }}
          d="M300 240 C344 240 368 264 374 302 C382 356 378 424 372 482 L330 482 C339 424 342 374 338 344 L262 344 C258 374 261 424 270 482 L228 482 C222 424 218 356 226 302 C232 264 256 240 300 240 Z"
        />
        <path d="M254 276 C260 250 276 240 300 240 C324 240 340 250 346 276" fill="none" stroke={D.line} strokeWidth="11" strokeLinecap="round" />
        <path d="M256 290 C262 268 277 259 300 259 C323 259 338 268 344 290" fill="none" stroke={D.line} strokeWidth="8" strokeLinecap="round" />
        <path
          style={{ ...ln, fill: D.skin }}
          d="M300 266 C334 266 352 288 354 306 C370 307 382 314 381 326 C380 338 368 345 354 345 C352 363 334 376 300 376 C266 376 248 354 248 321 C248 288 266 266 300 266 Z"
        />
        <path
          fill={D.hair}
          d="M250 314 C258 336 282 350 314 352 C334 352 347 345 352 334 C355 356 347 370 332 376 C318 382 280 382 267 373 C253 363 248 340 250 314 Z"
        />
        <rect x="308" y="349" width="36" height="16" rx="3.5" fill="#ffffff" stroke={D.line} strokeWidth="3.5" />
        <path style={tooth} d="M320 349 V365 M332 349 V365" />
        <ellipse cx="282" cy="300" rx="14" ry="16" fill="#ffffff" stroke={D.line} strokeWidth="4.5" />
        <ellipse cx="315" cy="300" rx="14" ry="16" fill="#ffffff" stroke={D.line} strokeWidth="4.5" />
        <circle cx="289" cy="302" r="5.5" fill={D.hair} />
        <circle cx="322" cy="302" r="5.5" fill={D.hair} />
        <path style={brow} d="M261 280 L295 293" />
        <path style={brow} d="M306 293 L338 284" />
        <circle style={{ ...ln, fill: D.skin }} cx="420" cy="302" r="17" />
        <path d="M410 294 L430 294 M410 304 L430 304" stroke={D.line} strokeWidth="3" opacity=".7" />
        <path style={rodline} d="M392 344 L556 102" />
        <path style={rod} d="M392 344 L556 102" />
        <rect style={meat} x="454" y="206" width="30" height="30" rx="6" transform="rotate(-34 469 221)" />
        <rect style={meat} x="484" y="162" width="30" height="30" rx="6" transform="rotate(-34 499 177)" />
        <rect style={meat} x="514" y="118" width="30" height="30" rx="6" transform="rotate(-34 529 133)" />
      </g>

      <g transform={`translate(${right} 0) rotate(${leanR} 660 560)`}>
        <path style={{ ...ln, fill: D.cloth }} d="M596 560 V436 C596 396 624 374 660 374 C696 374 724 396 724 436 V560 Z" />
        <path style={{ ...ln, fill: D.cloth }} d="M660 376 L634 402 L651 413 L660 396 Z" />
        <path style={{ ...ln, fill: D.cloth }} d="M660 376 L686 402 L669 413 L660 396 Z" />
        <path d="M660 406 V560" stroke={D.line} strokeWidth="3" fill="none" opacity=".8" />
        <circle cx="660" cy="442" r="3.5" fill={D.hair} />
        <circle cx="660" cy="480" r="3.5" fill={D.hair} />
        <circle cx="660" cy="518" r="3.5" fill={D.hair} />
        <path style={sleeveln} d="M608 408 C568 390 546 348 542 310" />
        <path style={sleeve} d="M608 408 C568 390 546 348 542 310" />
        <path style={{ ...ln, fill: D.skin }} d="M710 314 C726 312 728 338 710 340" />
        <path
          style={{ ...ln, fill: D.skin }}
          d="M660 266 C694 266 712 288 712 321 C712 354 694 376 660 376 C630 376 610 363 608 345 C592 344 578 337 579 325 C580 313 592 306 608 305 C610 286 628 266 660 266 Z"
        />
        <path
          fill={D.hair}
          d="M612 300 C606 266 628 245 662 245 C698 245 718 268 712 296 C702 277 686 266 664 266 C646 266 632 275 624 289 C620 296 616 300 612 300 Z"
        />
        <ellipse cx="637" cy="302" rx="14" ry="16" fill="#ffffff" stroke={D.line} strokeWidth="4.5" />
        <ellipse cx="670" cy="302" rx="14" ry="16" fill="#ffffff" stroke={D.line} strokeWidth="4.5" />
        <circle cx="630" cy="304" r="5.5" fill={D.hair} />
        <circle cx="663" cy="304" r="5.5" fill={D.hair} />
        <path style={brow} d="M652 285 L620 296" />
        <path style={brow} d="M696 287 L665 294" />
        <path
          fill={D.hair}
          d="M613 336 C627 327 643 329 653 337 L667 337 C679 329 695 329 705 338 C695 352 679 353 667 347 L653 347 C640 353 622 349 613 336 Z"
        />
        <rect x="630" y="351" width="36" height="16" rx="3.5" fill="#ffffff" stroke={D.line} strokeWidth="3.5" />
        <path style={tooth} d="M642 351 V367 M654 351 V367" />
        <circle style={{ ...ln, fill: D.skin }} cx="540" cy="302" r="17" />
        <path d="M530 294 L550 294 M530 304 L550 304" stroke={D.line} strokeWidth="3" opacity=".7" />
        <path style={rodline} d="M568 344 L404 102" />
        <path style={rod} d="M568 344 L404 102" />
        <rect style={meat} x="476" y="206" width="30" height="30" rx="6" transform="rotate(34 491 221)" />
        <rect style={meat} x="446" y="162" width="30" height="30" rx="6" transform="rotate(34 461 177)" />
        <rect style={meat} x="416" y="118" width="30" height="30" rx="6" transform="rotate(34 431 133)" />
      </g>

      {clash > 0 && (
        <g transform={`translate(480 186) scale(${clash}) rotate(${clash * 20})`}>
          <Burst points={8} outer={70} inner={30} fill={C.yellow} />
        </g>
      )}
    </svg>
  );
}

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
