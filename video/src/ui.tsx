import type { CSSProperties, ReactNode } from "react";
import { Html5Audio, Img, Sequence, staticFile, useVideoConfig } from "remotion";

import { easePress, pop, useT } from "./anim";
import { C, DISPLAY, KEY, PRESS, STICKER, UI } from "./theme";

// ---------------------------------------------------------------- sound

export type SfxName = "pop" | "whoosh" | "stamp" | "ding" | "tick" | "thock" | "sparkle" | "switch";

/**
 * Per-effect trims on top of the files' common loudness. The tick is 35ms, so
 * the 50ms window it was levelled on reads it quieter than it sounds; it is
 * also the one heard in runs of twenty.
 */
const TRIM: Partial<Record<SfxName, number>> = { tick: 0.55, switch: 0.8 };

/** One sound effect at `at` seconds into the enclosing sequence. 0.5 sits level with the voice. */
export function Sfx({ at, name, volume = 0.5 }: { at: number; name: SfxName; volume?: number }) {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} durationInFrames={Math.round(2 * fps)} layout="none">
      <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume * (TRIM[name] ?? 1)} />
    </Sequence>
  );
}

// ---------------------------------------------------------------- ground

const RAYS = Array.from({ length: 24 }, (_, i) => {
  const half = (360 / 24) * 0.46;
  const at = (deg: number) =>
    `${(1000 * Math.cos((deg * Math.PI) / 180)).toFixed(1)} ${(1000 * Math.sin((deg * Math.PI) / 180)).toFixed(1)}`;
  const angle = (360 / 24) * i;
  return { d: `M0 0 L${at(angle - half)} L${at(angle + half)} Z`, opacity: i % 2 ? 0.3 : 0.16 };
});

/**
 * The home page's 24 gold rays. On the site scroll turns them; here time does,
 * after the one-beat backwards wind-up motion.md asks of anything starting to spin.
 */
export function Sunburst({
  x = 960,
  y = 540,
  size = 2600,
  speed = 6,
  from = 0,
  opacity = 1,
  color = C.gold,
}: {
  x?: number;
  y?: number;
  size?: number;
  speed?: number;
  from?: number;
  opacity?: number;
  color?: string;
}) {
  const t = useT() - from;
  const windup = t < 0.25 ? -6 * Math.sin((Math.max(0, t) / 0.25) * (Math.PI / 2)) : -6;
  const angle = windup + Math.max(0, t - 0.25) * speed;
  return (
    <svg
      viewBox="-1000 -1000 2000 2000"
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        opacity,
        transform: `rotate(${angle}deg)`,
      }}
    >
      {RAYS.map((ray, i) => (
        <path key={i} d={ray.d} fill={color} opacity={ray.opacity} />
      ))}
    </svg>
  );
}

export function Ground({ color = C.surface, children }: { color?: string; children?: ReactNode }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: color, overflow: "hidden" }}>{children}</div>
  );
}

// ---------------------------------------------------------------- type

/**
 * Display type: Luckiest Guy, yellow, with the keyline drawn *under* the fill
 * so it reads as an outer stroke. README: bare Luckiest Guy on a flat ground
 * looks like a birthday invitation.
 */
export function Headline({
  children,
  size = 120,
  color = C.yellow,
  stroke = C.ink,
  shadow = true,
  style,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  stroke?: string;
  shadow?: boolean;
  style?: CSSProperties;
}) {
  const sw = Math.max(6, size * 0.085);
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontSize: size,
        lineHeight: 0.92,
        color,
        WebkitTextStroke: `${sw}px ${stroke}`,
        paintOrder: "stroke fill",
        letterSpacing: "0.02em",
        textShadow: shadow ? `${sw * 0.9}px ${sw * 0.9}px 0 ${stroke}` : undefined,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export const text = (size: number, weight = 500, color: string = C.ink): CSSProperties => ({
  fontFamily: UI,
  fontSize: size,
  fontWeight: weight,
  color,
  lineHeight: 1.25,
});

/** The uppercase tracked label the site uses for eyebrows and buttons. */
export const label = (size = 26, color: string = C.ink): CSSProperties => ({
  ...text(size, 600, color),
  letterSpacing: "0.08em",
  textTransform: "uppercase",
});

// ---------------------------------------------------------------- surfaces

export function Sticker({
  children,
  style,
  bg = C.raised,
  radius = 28,
  depth = STICKER,
}: {
  children?: ReactNode;
  style?: CSSProperties;
  bg?: string;
  radius?: number;
  depth?: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `${KEY}px solid ${C.ink}`,
        borderRadius: radius,
        boxShadow: depth,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Pill({
  children,
  bg = C.raised,
  color = C.ink,
  size = 26,
  style,
}: {
  children: ReactNode;
  bg?: string;
  color?: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        ...label(size, color),
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: bg,
        border: `${KEY}px solid ${C.ink}`,
        borderRadius: 999,
        padding: `${size * 0.32}px ${size * 0.8}px`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** The shadcn outline badge the site puts a cuisine in, scaled up. */
export function CuisineTag({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <span
      style={{
        ...text(size, 500, C.ink),
        display: "inline-block",
        border: `3px solid ${C.ink}`,
        borderRadius: 999,
        padding: `${size * 0.1}px ${size * 0.6}px`,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/**
 * src/components/recipe-card.tsx at video scale: title, then the cuisine badge
 * and a meta line, then an optional note. `lift` is the hover — up and left,
 * shadow growing, the peel-off-the-page move from the README.
 */
export function RecipeCard({
  title,
  cuisine,
  meta,
  note,
  lift = 0,
  titleSize = 34,
  style,
}: {
  title: string;
  cuisine: string;
  meta?: ReactNode;
  note?: ReactNode;
  lift?: number;
  titleSize?: number;
  style?: CSSProperties;
}) {
  const depth = 4 + lift * 6;
  return (
    <div
      style={{
        background: C.raised,
        border: `4px solid ${C.ink}`,
        borderRadius: 22,
        boxShadow: `${depth}px ${depth}px 0 ${C.ink}`,
        transform: `translate(${-lift * 4}px, ${-lift * 4}px)`,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        ...style,
      }}
    >
      <span style={text(titleSize, 500)}>{title}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <CuisineTag size={22}>{cuisine}</CuisineTag>
        {meta}
      </span>
      {note}
    </div>
  );
}

/** A circular cuisine badge, always radius-disc with the keyline. */
export function Disc({ src, size }: { src: string; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${Math.max(4, size * 0.05)}px solid ${C.ink}`,
        overflow: "hidden",
        boxShadow: PRESS,
        background: C.raised,
        flexShrink: 0,
      }}
    >
      <Img src={staticFile(`art/${src}`)} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

/**
 * The site in a window. Not a browser screenshot — the chrome is drawn in the
 * same sticker language as everything else, so it reads as "the app" without
 * pretending to be any particular browser.
 */
export function Window({
  children,
  url,
  style,
}: {
  children: ReactNode;
  url: string;
  style?: CSSProperties;
}) {
  return (
    <Sticker
      radius={32}
      depth={`16px 16px 0 ${C.ink}`}
      bg={C.surface}
      style={{ overflow: "hidden", display: "flex", flexDirection: "column", ...style }}
    >
      <div
        style={{
          height: 76,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 28px",
          background: C.raised,
          borderBottom: `${KEY}px solid ${C.ink}`,
        }}
      >
        {[C.brick, C.gold, C.basil].map((c) => (
          <span
            key={c}
            style={{ width: 22, height: 22, borderRadius: "50%", background: c, border: `3px solid ${C.ink}` }}
          />
        ))}
        <span
          style={{
            ...text(24, 500, C.muted),
            marginLeft: 18,
            padding: "6px 22px",
            background: C.surface,
            border: `3px solid ${C.ink}`,
            borderRadius: 999,
          }}
        >
          {url}
        </span>
      </div>
      {/* Clipped below the chrome, so a page that scrolls never slides over it. */}
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>{children}</div>
    </Sticker>
  );
}

/**
 * The pointer. A plain arrow with a heavy keyline; the house style's
 * four-fingered glove would be charming and would also hide what it points at.
 */
export function Cursor({ x, y, pressed = 0 }: { x: number; y: number; pressed?: number }) {
  const s = 1 - 0.14 * pressed;
  return (
    <svg
      viewBox="0 0 40 52"
      style={{
        position: "absolute",
        left: x - 6,
        top: y - 4,
        width: 58,
        height: 76,
        transform: `scale(${s})`,
        transformOrigin: "6px 4px",
        filter: `drop-shadow(4px 4px 0 ${C.ink})`,
        zIndex: 50,
      }}
    >
      <path
        d="M4 3 L4 40 L14 31 L21 47 L28 44 L21 28 L35 28 Z"
        fill={C.raised}
        stroke={C.ink}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * A pointer's position along timed waypoints. Each leg eases on the press
 * curve and bows slightly off the straight line — motion.md: arcs, not lines.
 */
export function cursorAt(t: number, points: Array<{ t: number; x: number; y: number }>) {
  if (t <= points[0].t) return points[0];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (t <= b.t) {
      const k = easePress((t - a.t) / (b.t - a.t));
      const bow = Math.sin(k * Math.PI) * Math.min(60, Math.hypot(b.x - a.x, b.y - a.y) * 0.12);
      return { t, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k - bow };
    }
  }
  return points[points.length - 1];
}

/** 0→1→0 over a 0.22s click centred on `at`, for Cursor's `pressed`. */
export const click = (t: number, at: number) => Math.max(0, 1 - Math.abs(t - at) / 0.11);

/** A rubber stamp that slams on: huge, then flat, then a small settle. */
export function Stamp({
  at,
  children,
  color = C.brick,
  rotate = -8,
  size = 64,
  style,
}: {
  at: number;
  children: ReactNode;
  color?: string;
  rotate?: number;
  size?: number;
  style?: CSSProperties;
}) {
  const t = useT();
  if (t < at - 0.12) return null;
  const k = Math.min(1, (t - (at - 0.12)) / 0.12);
  const scale = t < at ? 2.4 - 1.4 * k : 1 + 0.06 * Math.exp(-(t - at) * 9) * Math.cos((t - at) * 20);
  return (
    <div
      style={{
        position: "absolute",
        transform: `rotate(${rotate}deg) scale(${scale})`,
        opacity: t < at ? k : 1,
        fontFamily: DISPLAY,
        fontSize: size,
        letterSpacing: "0.04em",
        color,
        border: `${size * 0.1}px solid ${color}`,
        borderRadius: size * 0.22,
        padding: `${size * 0.12}px ${size * 0.34}px ${size * 0.02}px`,
        background: "rgba(253,246,227,0.85)",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Wraps anything so it pops in at `at`, scaled around its own centre. */
export function PopIn({
  at,
  children,
  style,
  origin = "50% 50%",
}: {
  at: number;
  children: ReactNode;
  style?: CSSProperties;
  origin?: string;
}) {
  const t = useT();
  const s = pop(t, at);
  if (s <= 0) return null;
  return <div style={{ transform: `scale(${s})`, transformOrigin: origin, ...style }}>{children}</div>;
}
