import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * The house motion vocabulary from Springfield Kitchen's motion.md, as
 * functions of time in seconds. Nothing here eases in-and-out: entrances
 * overshoot and settle, presses are quick, loops are linear.
 */

export const easeLand = Easing.bezier(0.34, 1.56, 0.64, 1);
export const easePress = Easing.bezier(0.2, 0.9, 0.3, 1);
export const easeReel = Easing.bezier(0.08, 0.82, 0.17, 1);
export const easeGravity = Easing.in(Easing.quad);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Seconds since the enclosing <Sequence> started. */
export function useT() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
}

/** 0→1 between `at` and `at + dur`, on a house curve. */
export const p = (t: number, at: number, dur = 0.6, easing: (x: number) => number = easeLand) =>
  interpolate(t, [at, at + dur], [0, 1], { ...clamp, easing });

/** Straight 0→1, for fades and anything continuous. */
export const lin = (t: number, at: number, dur: number) => interpolate(t, [at, at + dur], [0, 1], clamp);

/** Map 0→1 onto a range. */
export const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/**
 * A pop-in scale: 0 at `at`, overshooting to ~1.16, settled by half a second.
 * A damped cosine rather than a spring solver, so it is the same every render.
 */
export const pop = (t: number, at: number) => {
  if (t < at) return 0;
  const d = t - at;
  return 1 - Math.exp(-d * 9) * Math.cos(d * 15);
};

/** The squash that follows an impact: +amount at the hit, ringing out. */
export const wobble = (t: number, at: number, amount = 0.14) => {
  if (t < at) return 0;
  const d = t - at;
  return amount * Math.exp(-d * 7) * Math.cos(d * 17);
};

/**
 * Something dropped onto a surface, landing at `at`: it falls on gravity,
 * stretched, then squashes flat on impact and recovers over two bounces.
 * Returns a CSS transform; set transform-origin to the bottom edge.
 */
export const drop = (t: number, at: number, height = 700, fall = 0.36) => {
  if (t < at - fall) return `translateY(${-height}px) scale(0.92, 1.1)`;
  if (t < at) {
    const k = easeGravity((t - (at - fall)) / fall);
    return `translateY(${-height * (1 - k)}px) scale(${1 - 0.08 * k}, ${1 + 0.1 * k})`;
  }
  const w = wobble(t, at);
  return `scale(${1 + w}, ${1 - w})`;
};

/** A slow hero bob, so nothing on screen is ever fully dead. */
export const bob = (t: number, period = 3.6, px = 8) => Math.sin((t / period) * Math.PI * 2) * px;

/**
 * When a phrase inside a line starts, estimated from its character offset.
 * Good to about a tenth of a second on this voice, which is inside what the
 * eye can tell when a word and a picture arrive together.
 */
export const phraseAt = (text: string, phrase: string, start: number, end: number) => {
  const i = text.indexOf(phrase);
  if (i < 0) throw new Error(`"${phrase}" is not in "${text}"`);
  return start + (end - start) * (i / text.length);
};
