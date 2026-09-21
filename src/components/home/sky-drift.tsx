"use client";

import { useCallback, useRef } from "react";

import s from "./home.module.css";
import { usePrefersReducedMotion, useScrollFrame } from "./use-scroll-frame";

/**
 * The sky the whole page falls through.
 *
 * The sunburst only ever covered the hero, so the page lost its backdrop the
 * moment you scrolled past the first screen. This is the other half: a fixed
 * field of clouds over the cream-to-sky gradient on .home, so scrolling reads
 * as descending through weather rather than as leaving the artwork behind.
 *
 * Three things make it behave:
 *
 * FADE. The layer is invisible at the top and reaches full strength about a
 * screen and a half down. Clouds over the cream hero would fight the sunburst
 * and the Down with Hunger panel; letting them arrive as the ground turns blue
 * makes the gradient and the clouds one movement instead of two.
 *
 * WRAP. Each cloud's vertical position is taken modulo a tall virtual strip, so
 * the field never runs out however long the page gets. Without it the clouds
 * drift off the top within a couple of screens and the bottom of the page is as
 * empty as it was before.
 *
 * SPLIT AXES. Vertical parallax is written by JavaScript on the outer element;
 * the horizontal drift is a CSS animation on the inner one. Two transforms on
 * one element means whichever is written last wins, and the cloud either stops
 * drifting or stops parallaxing.
 */

/** Distinct enough to read as different clouds at a glance, cheap to draw. */
const SHAPES = [
  "M26 42 a18 18 0 0 1 2-35 a24 24 0 0 1 45-4 a20 20 0 0 1 34 12 a16 16 0 0 1-8 27z",
  "M20 40 a16 16 0 0 1 6-31 a22 22 0 0 1 38-6 a18 18 0 0 1 30 14 a15 15 0 0 1-10 23z",
];

/**
 * depth drives both parallax rate and size: nearer clouds are bigger, more
 * opaque and move more. left/top are percentages of the viewport.
 */
const CLOUDS = [
  { left: 6, top: 12, width: 190, depth: 0.5, opacity: 0.95, shape: 0, drift: 46 },
  { left: 68, top: 26, width: 130, depth: 0.28, opacity: 0.7, shape: 1, drift: 68 },
  { left: 32, top: 44, width: 240, depth: 0.62, opacity: 1, shape: 1, drift: 38 },
  { left: 80, top: 58, width: 110, depth: 0.22, opacity: 0.6, shape: 0, drift: 78 },
  { left: 12, top: 72, width: 160, depth: 0.42, opacity: 0.85, shape: 0, drift: 54 },
  { left: 54, top: 88, width: 205, depth: 0.55, opacity: 0.9, shape: 1, drift: 44 },
];

/**
 * Fraction of the page's scrollable range over which the clouds arrive.
 *
 * A proportion rather than a pixel or viewport count: this page lost two
 * sections and got short enough that "fade in over one and a half screens"
 * would never have finished, leaving the clouds permanently half-there.
 */
const FADE_OVER = 0.45;

export function SkyDrift() {
  const layer = useRef<HTMLDivElement>(null);
  const clouds = useRef<Array<HTMLDivElement | null>>([]);
  const reduced = usePrefersReducedMotion();

  const frame = useCallback(() => {
    const el = layer.current;
    if (!el) return;

    const viewport = window.innerHeight;
    const y = window.scrollY;

    // Guard the divide: a page shorter than its own viewport has no scrollable
    // range at all, and NaN opacity blanks the layer rather than showing it.
    const scrollable = Math.max(1, document.documentElement.scrollHeight - viewport);
    el.style.opacity = String(Math.min(1, y / scrollable / FADE_OVER));

    // One strip taller than the viewport so a cloud is always fully clear of
    // the top edge before it reappears at the bottom.
    const strip = viewport * 1.6;

    for (const [i, cloud] of clouds.current.entries()) {
      if (!cloud) continue;
      const { top, depth } = CLOUDS[i];

      // Modulo keeps the field endless; the extra `+ strip` before it stops a
      // negative remainder popping the cloud to the wrong end.
      const offset = (((top / 100) * viewport - y * depth) % strip + strip) % strip;
      cloud.style.transform = `translate3d(0, ${(offset - viewport * 0.3).toFixed(1)}px, 0)`;
    }
  }, []);

  useScrollFrame(frame, reduced === false);

  // Undecided or opted out: no layer at all rather than a static bank of clouds
  // parked over the hero, which is the one place they are in the way.
  if (reduced !== false) return null;

  return (
    <div className={s.drift} ref={layer} aria-hidden="true">
      {CLOUDS.map((cloud, i) => (
        <div
          key={i}
          ref={(node) => {
            clouds.current[i] = node;
          }}
          className={s.driftCloud}
          style={{ left: `${cloud.left}%`, width: cloud.width, opacity: cloud.opacity }}
        >
          <svg
            viewBox="0 0 150 46"
            className={s.driftShape}
            style={{ animationDuration: `${cloud.drift}s` }}
          >
            <path d={SHAPES[cloud.shape]} />
          </svg>
        </div>
      ))}
    </div>
  );
}
