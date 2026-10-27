"use client";

import { useEffect, useRef } from "react";

import s from "./home.module.css";
import { scenes } from "./logos";
import { usePrefersReducedMotion } from "./use-scroll-frame";

/** Noticeably slower than the intro clip it comes from. */
const PLAYBACK_RATE = 0.75;

/**
 * The hero art: the same clip as the intro, looping quietly in place.
 *
 * The still is the poster, so the server-rendered page and reduced-motion
 * visitors get the original artwork. Anyone who has asked for less motion gets
 * the still and nothing else — the video is paused, never played.
 */
export function HeroClip() {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    el.playbackRate = PLAYBACK_RATE;
    if (reduced) el.pause();
    else void el.play().catch(() => {});
  }, [reduced]);

  return (
    <video
      ref={video}
      className={s.heroClip}
      src="/down-with-hunger.mp4"
      poster={scenes.downWithHunger.src}
      autoPlay={reduced !== true}
      loop
      muted
      playsInline
      preload="auto"
      aria-label="Down with Hunger — a cartoon man holding a protest placard in one hand and a shawarma in the other, mid-shout"
    />
  );
}
