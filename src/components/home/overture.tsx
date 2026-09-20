"use client";

import { useEffect, useRef, useState } from "react";

import { DuelStill } from "./duel-still";
import s from "./home.module.css";
import { scenes } from "./logos";
import { usePrefersReducedMotion } from "./use-scroll-frame";

/**
 * ACT 0 — DUELING KEBABS.
 *
 * Was 2.6 screens of scroll driving a hand-animated SVG duel; now a ~3 second
 * clip that plays once on load and then gets out of the way. The artwork
 * survives in DuelStill, which is what reduced-motion visitors see.
 *
 * The overlay sits on top of the finished page rather than being a section in
 * it, so the hero is already laid out underneath and the reveal is a fade
 * rather than a scroll.
 *
 * The clip runs 5 seconds but the page is revealed at 3: holding a landing page
 * for five seconds is long enough that people leave. It finishes playing behind
 * the fade.
 */
const REVEAL_AFTER_MS = 3000;

/** How long the overlay takes to fade once the page has been revealed. */
const FADE_MS = 700;

export function Overture() {
  const reduced = usePrefersReducedMotion();
  const [leaving, setLeaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const scrollY = useRef(0);

  // `reduced` is null until the preference is known. Rendering nothing until
  // then means nobody sees a frame of the motion they opted out of.
  const showIntro = reduced === false && !dismissed;

  /**
   * Two stages, not one.
   *
   * At 3s the overlay starts fading and the page is unlocked — that is the
   * reveal. The clip keeps playing underneath the fade for its remaining
   * seconds rather than being cut off mid-frame, and only then is the overlay
   * removed. Unmounting straight away made the video vanish abruptly, which
   * read as a glitch rather than an ending.
   */
  useEffect(() => {
    if (!showIntro) return;

    const toLeaving = window.setTimeout(() => setLeaving(true), REVEAL_AFTER_MS);
    const toGone = window.setTimeout(
      () => setDismissed(true),
      REVEAL_AFTER_MS + FADE_MS,
    );

    return () => {
      window.clearTimeout(toLeaving);
      window.clearTimeout(toGone);
    };
  }, [showIntro]);

  /**
   * Lock the page while the overlay is up.
   *
   * A fixed overlay does not stop the document scrolling underneath it. Without
   * this, scrolling during the intro lands the visitor three seconds later
   * somewhere in the middle of the page, having never seen the hero.
   *
   * `position: fixed` on the body rather than `overflow: hidden`, because iOS
   * Safari ignores the latter — and the scroll position has to be captured and
   * restored by hand, since fixing the body resets it to zero.
   */
  useEffect(() => {
    // Unlocked when the fade starts, so the page is usable while the clip
    // plays out rather than a further 700ms later.
    if (!showIntro || leaving) return;

    scrollY.current = window.scrollY;
    const { body } = document;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY.current}px`;
    body.style.width = "100%";

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY.current);
    };
  }, [showIntro, leaving]);

  // Escape is what people reach for to dismiss something covering the page.
  useEffect(() => {
    if (!showIntro) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDismissed(true);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showIntro]);

  if (reduced === null || dismissed) return null;

  if (reduced) {
    // No video at all for reduced motion — not a paused one, not a poster of
    // one. The drawing, and straight through to the page.
    return null;
  }

  return (
    <div
      className={`${s.intro} ${leaving ? s.introOut : ""}`}
      role="dialog"
      aria-label="Dueling Kebabs intro"
      aria-hidden={leaving}
    >
      <div className={s.introCard}>
        <video
          className={s.introVideo}
          src="/dueling-kebabs.mp4"
          poster={scenes.duellingKebabs.src}
          autoPlay
          muted
          playsInline
          // Not looped: it plays once and the page takes over.
          aria-label="Two cartoon cooks duelling with kebab skewers"
        />
      </div>

      <p className={s.introTitle}>DUELING KEBABS</p>

      <button type="button" className={s.introSkip} onClick={() => setDismissed(true)}>
        Skip
      </button>
    </div>
  );
}

/** The still artwork, shown in the hero slot when motion is not wanted. */
export function OvertureStill() {
  const reduced = usePrefersReducedMotion();
  if (!reduced) return null;

  return (
    <div className={s.introStill}>
      <DuelStill />
    </div>
  );
}
