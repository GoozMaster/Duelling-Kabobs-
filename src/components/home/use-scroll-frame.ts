"use client";

import { useEffect, useState } from "react";

/**
 * One scroll listener and one rAF for the whole page.
 *
 * The home page has several things tied to scroll position at once — the duel,
 * the sunburst, the scroll hint. Giving each its own listener would run several
 * independent rAF loops that can land on different frames, and the design
 * system's whole premise is that scroll is a single playhead. So subscribers
 * share one listener and are flushed together.
 */
type Frame = () => void;

const subscribers = new Set<Frame>();
let queued = false;
let listening = false;

function flush() {
  queued = false;
  for (const frame of subscribers) frame();
}

function schedule() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(flush);
}

function subscribe(frame: Frame) {
  subscribers.add(frame);
  if (!listening) {
    listening = true;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  return () => {
    subscribers.delete(frame);
  };
}

/** Runs `frame` once on mount and then on every scroll and resize, rAF-throttled. */
export function useScrollFrame(frame: Frame, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const unsubscribe = subscribe(frame);
    frame();
    return unsubscribe;
    // `frame` is expected to be a stable useCallback from the caller.
  }, [frame, enabled]);
}

/**
 * The reduced-motion preference, read after hydration.
 *
 * It starts as `null` rather than `false` on purpose: the server cannot know
 * the answer, and assuming "motion is fine" would make a visitor who asked for
 * reduced motion watch a frame of the thing they opted out of. Callers treat
 * `null` as "not decided yet" and hold still.
 */
export function usePrefersReducedMotion(): boolean | null {
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}
