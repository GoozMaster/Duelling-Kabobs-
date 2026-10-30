"use client";

import { useEffect } from "react";

/**
 * Starts the home page at the top whenever the document loads.
 *
 * Phone browsers remember where you were on a page and put you back there when
 * the page is reloaded or its tab is brought back — which for a landing page
 * means opening it "in the middle" every time after the first visit.
 *
 * Two parts, because either alone is not enough:
 *  - `scrollRestoration = "manual"` stops the browser restoring the old
 *    position after this runs (iOS Safari does it late, once layout settles);
 *  - `scrollTo(0, 0)` undoes a restoration that already happened (Chrome does
 *    it early, before hydration).
 *
 * An explicit anchor in the address (`/#cuisines`) is left alone, since that is
 * somebody asking to start part-way down.
 *
 * Once per document, not once per mount: later client-side visits to the home
 * page are Next navigations, which already manage scroll themselves. The mode
 * belongs to this history entry, so other pages keep normal restoration.
 */
let applied = false;

export function ScrollToTop() {
  useEffect(() => {
    if (applied) return;
    applied = true;

    if (window.location.hash) return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  return null;
}
