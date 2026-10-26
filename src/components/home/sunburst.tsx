"use client";

import { useCallback, useRef } from "react";

import s from "./home.module.css";
import { usePrefersReducedMotion, useScrollFrame } from "./use-scroll-frame";

/**
 * The sun behind the hero: 24 gold rays that rotate 0.06° per pixel scrolled.
 * Scroll-driven, not looping — scrubbing back rewinds it.
 *
 * It renders inside the illustration's column, so it is centred on the
 * protester at every width without measuring anything, and it is far larger
 * than the screen: the rays leave the viewport on every side and fade out with
 * distance, then the sky's cloud bank rolls over them. That is what replaced
 * the old version, a ray disc clipped into a box across the top third of the
 * page with a hard edge where the hero ended.
 *
 * It rests at -6° so the rays are never axis-aligned at the top of the page.
 */
const RAY_COUNT = 24;
const REST_ANGLE = -6;
const DEGREES_PER_PIXEL = 0.06;

// Built once at module scope so the server and the client render identical
// path data and hydration has nothing to reconcile.
const RAYS = Array.from({ length: RAY_COUNT }, (_, i) => {
  const angle = (360 / RAY_COUNT) * i;
  const halfWidth = (360 / RAY_COUNT) * 0.46;
  const point = (deg: number) =>
    `${(200 * Math.cos((deg * Math.PI) / 180)).toFixed(2)} ${(200 * Math.sin((deg * Math.PI) / 180)).toFixed(2)}`;
  return {
    d: `M0 0 L${point(angle - halfWidth)} L${point(angle + halfWidth)} Z`,
    opacity: i % 2 ? 0.34 : 0.18,
  };
});

export function Sunburst() {
  const svg = useRef<SVGSVGElement>(null);
  const reduced = usePrefersReducedMotion();

  const frame = useCallback(() => {
    if (!svg.current) return;
    svg.current.style.transform = `rotate(${REST_ANGLE + window.scrollY * DEGREES_PER_PIXEL}deg)`;
  }, []);

  // Frozen at its rest angle when motion is reduced, per motion.md.
  useScrollFrame(frame, reduced === false);

  return (
    <div className={s.rays} aria-hidden="true">
      <svg ref={svg} viewBox="0 0 400 400" style={{ transform: `rotate(${REST_ANGLE}deg)` }}>
        <g transform="translate(200,200)">
          {RAYS.map((ray, i) => (
            <path key={i} d={ray.d} fill="var(--sk-gold)" opacity={ray.opacity} />
          ))}
        </g>
      </svg>
    </div>
  );
}
