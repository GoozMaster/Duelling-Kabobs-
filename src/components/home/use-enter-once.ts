"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once, the first time the element is a quarter visible.
 *
 * Entrances fire once by design: re-animating every time you scroll back past
 * something is nauseating, and it is the one rule in motion.md that a naive
 * scroll listener gets wrong. Continuous loops are the exception, and those are
 * driven by scroll position instead.
 */
export function useEnterOnce<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || entered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setEntered(true);
        observer.disconnect();
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [entered, threshold]);

  return [ref, entered] as const;
}
