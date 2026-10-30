"use client";

import { useEffect } from "react";

/**
 * Plays a cuisine's sting as you cross into its recipes.
 *
 * ONE DELEGATED LISTENER, NOT FOUR COMPONENTS. Cuisines are selectable from
 * five places — the filter chips on /recipes, the tiles and the globe on
 * /recipes/by-cuisine, the discs on the home page, and the badge on a recipe
 * itself. Every one of them is a server-rendered link, and three of them are
 * deliberately so: the chips exist as plain links precisely to avoid shipping
 * JavaScript, and the globe's countries are raw SVG <a> elements that cannot be
 * Next <Link>s at all. Adding an onClick to each would mean making all of them
 * client components and undoing that. A single listener on the document reads
 * the href instead and leaves the markup exactly as it is.
 *
 * THE SOUND OUTLIVES THE NAVIGATION because the audio elements live in a module
 * scope rather than in the React tree. App Router navigations are soft — the
 * document survives — so a sound started on click keeps playing while the new
 * page renders underneath it. An <audio> inside the component being replaced
 * would be unmounted mid-note.
 */

/**
 * Ten of the twelve cuisines have a sound; Other and Mediterranean are silent.
 *
 * Persian plays the clip Mediterranean used to have (Sound Effects/
 * Mediterranean.mp3): it was always the Persian joke, and moved with it when
 * the Persian cuisine was added.
 *
 * Sound Effects/ also holds China.mp3 and Japan.mp3, which have no
 * corresponding cuisine — the collection has "Asian", not "Chinese" or
 * "Japanese" — so they are deliberately unused rather than assigned to
 * something they do not name. A missing entry here is a no-op, not an error.
 */
const SOUNDS: Record<string, string> = {
  American: "/sounds/american.mp3",
  Asian: "/sounds/asian.mp3",
  Breads: "/sounds/breads.mp3",
  Desserts: "/sounds/desserts.mp3",
  Drinks: "/sounds/drinks.mp3",
  French: "/sounds/french.mp3",
  Indian: "/sounds/indian.mp3",
  Italian: "/sounds/italian.mp3",
  Latin: "/sounds/latin.mp3",
  Persian: "/sounds/persian.mp3",
};

/**
 * The source clips run from 0.6s to 30.7s, which is far too wide a range to
 * play whole: Persian alone would still be going long after you had
 * started reading the recipes, and clicking through three filters would stack
 * half a minute of audio each time. Capping every sound to the same short
 * sting makes them behave alike whatever their length, and the short ones
 * simply end before the cap and never notice it.
 *
 * Staying under three seconds also keeps this the right side of WCAG 1.4.2,
 * which only governs audio that plays automatically for longer than that.
 */
const CAP_MS = 2600;

/**
 * Clips that are the joke, not a sting: cutting them off mid-line ruins them,
 * so they play to the end and skip the cap and fade. A second selection still
 * interrupts them.
 */
const PLAY_FULL = new Set(["French", "Persian"]);
const FADE_MS = 450;
const FADE_STEPS = 18;
const VOLUME = 0.35;

const cache = new Map<string, HTMLAudioElement>();
let current: HTMLAudioElement | null = null;
let fadeTimer: number | undefined;
let capTimer: number | undefined;

/**
 * Warms a clip without playing it.
 *
 * Some clips are a few hundred kilobytes, so without this the first click spends
 * the whole navigation downloading and the sting lands over the page it was
 * supposed to introduce. Hovering is enough warning to have it buffered.
 */
function prime(cuisine: string): HTMLAudioElement | null {
  const src = SOUNDS[cuisine];
  if (!src) return null;

  let audio = cache.get(cuisine);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = VOLUME;
    cache.set(cuisine, audio);
  }
  return audio;
}

function silence() {
  window.clearTimeout(capTimer);
  window.clearInterval(fadeTimer);
  if (current) {
    current.pause();
    current.currentTime = 0;
  }
}

export function play(cuisine: string) {
  const audio = prime(cuisine);
  if (!audio) return;

  // A second selection interrupts the first rather than layering over it.
  silence();

  current = audio;
  audio.currentTime = 0;
  audio.volume = VOLUME;

  // Autoplay policy, a interrupted load, a missing file: all reject here, and
  // none of them are worth an unhandled rejection in the console over a sound
  // effect.
  void audio.play().catch(() => {});

  if (PLAY_FULL.has(cuisine)) return;

  capTimer = window.setTimeout(
    () => {
      let step = 0;
      fadeTimer = window.setInterval(() => {
        step += 1;
        if (!current) return;
        current.volume = Math.max(0, VOLUME * (1 - step / FADE_STEPS));
        if (step >= FADE_STEPS) {
          window.clearInterval(fadeTimer);
          current.pause();
        }
      }, FADE_MS / FADE_STEPS);
    },
    Math.max(0, CAP_MS - FADE_MS),
  );
}

/**
 * The cuisine a link filters to, or null if it is not one of those links.
 *
 * getAttribute rather than the href property: on an SVG <a> — which is what
 * every country on the globe is — href is an SVGAnimatedString, not a string,
 * and reading it as one silently yields nothing.
 */
function cuisineFromLink(anchor: Element): string | null {
  const href = anchor.getAttribute("href");
  if (!href || !href.includes("cuisine=")) return null;

  try {
    const url = new URL(href, window.location.origin);
    if (url.pathname !== "/recipes") return null;
    return url.searchParams.get("cuisine");
  } catch {
    return null;
  }
}

export function CuisineSound() {
  useEffect(() => {
    const onPointerOver = (event: PointerEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const cuisine = cuisineFromLink(anchor);
      if (cuisine) prime(cuisine);
    };

    const onClick = (event: MouseEvent) => {
      // A modified or middle click opens a new tab and leaves this page where
      // it is; a sound here would come from a page the visitor is not going to.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;

      const cuisine = cuisineFromLink(anchor);
      if (cuisine) play(cuisine);
    };

    // Capture, so the sound still starts if something downstream stops the
    // event from propagating.
    document.addEventListener("click", onClick, true);
    document.addEventListener("pointerover", onPointerOver, { passive: true });

    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("pointerover", onPointerOver);
      silence();
    };
  }, []);

  return null;
}
