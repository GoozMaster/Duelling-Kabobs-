"use client";

import { useRef, useState } from "react";

import s from "./home.module.css";

/**
 * The two-minute tour, rendered from video/ with Remotion.
 *
 * Native controls, always: they are keyboard- and screen-reader-accessible
 * for free, and they keep working before hydration or with JavaScript off. The
 * one piece of cartoon hardware on top is a big play button over the poster,
 * sized so it never covers the controls bar — without JavaScript it simply
 * does nothing and the native play button underneath still works.
 *
 * Never autoplays. It has a narrator, and a page that starts talking at you is
 * the fastest way to be closed; it also sits right under an intro clip that
 * already plays itself.
 *
 * preload="metadata" rather than "none": it costs a few kilobytes and gives
 * the controls a real duration before anyone presses play.
 */
export function ExplainerVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  return (
    <div className={s.player}>
      <video
        ref={video}
        controls
        preload="metadata"
        playsInline
        poster="/video/explainer-poster.jpg"
        onPlay={() => setStarted(true)}
      >
        <source src="/video/explainer.mp4" type="video/mp4" />
        <track kind="captions" src="/video/explainer.vtt" srcLang="en" label="English" />
        <p>
          Your browser cannot play this video.{" "}
          <a href="/video/explainer.mp4">Download it instead</a>.
        </p>
      </video>

      {!started && (
        <button
          type="button"
          className={s.play}
          onClick={() => void video.current?.play()}
          aria-label="Play the tour, 2 minutes 20 seconds"
        >
          <span className={s.playDisc} aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <path d="M14 9 L32 20 L14 31 Z" />
            </svg>
          </span>
          <span className={s.playLabel} aria-hidden="true">
            Play the tour · 2:20
          </span>
        </button>
      )}
    </div>
  );
}
