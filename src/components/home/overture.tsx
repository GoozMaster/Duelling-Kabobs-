"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";

import s from "./home.module.css";
import { scenes } from "./logos";
import { usePrefersReducedMotion, useScrollFrame } from "./use-scroll-frame";

/**
 * ACT 0 — DUELING KEBABS.
 *
 * 2.6 screens of scroll over one sticky stage. Nothing here runs on a timer:
 * progress through the section is the playhead, so scrolling back rewinds the
 * fight frame for frame.
 *
 *   p 0.00  cold open — the duelling-kebabs.png card, whole, under the title
 *   p 0.16  the card shrinks away; both cooks stride in from off-stage
 *   p 0.32  squared up, skewers raised, leaning back — the anticipation beat
 *   p 0.52  LUNGE: skewers cross at (480, 214), spark burst, screen shake,
 *           meat cubes fly off both skewers
 *   p 0.62  recoil, squash-and-stretch, the shawarma launches out of frame
 *   p 0.86  the cooks walk off
 *   p 1.00  the stage unsticks; the hero scrolls up in its place
 *
 * The beats are data, not branches. Re-timing the fight means editing numbers.
 */

type Stop = readonly [progress: number, value: number];

/** Piecewise interpolation over scroll progress, each segment eased out cubically
 *  so the beat lands rather than drifting (motion.md: overshoot, then settle). */
function track(p: number, stops: readonly Stop[]) {
  if (p <= stops[0][0]) return stops[0][1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [aP, aV] = stops[i];
    const [bP, bV] = stops[i + 1];
    if (p <= bP) {
      const span = bP - aP || 1;
      const t = 1 - Math.pow(1 - (p - aP) / span, 3);
      return aV + (bV - aV) * t;
    }
  }
  return stops[stops.length - 1][1];
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// square up → lunge → clash → recoil → exit
const LX: readonly Stop[] = [
  [0, -520], [0.16, -520], [0.32, -150], [0.44, -168],
  [0.52, 6], [0.62, 6], [0.72, -96], [0.86, -96], [1, -300],
];
const LEAN: readonly Stop[] = [
  [0, 0], [0.32, -5], [0.44, -9], [0.52, 5],
  [0.62, 5], [0.72, -11], [0.86, -11], [1, -11],
];
const SQUASH: readonly Stop[] = [[0.44, 1], [0.52, 1.1], [0.58, 0.94], [0.66, 1]];

// each meat cube gets its own direction and rise so the burst is not a fan
const DEBRIS = [
  { dir: -1, rise: 1 },
  { dir: 0.4, rise: 1.35 },
  { dir: 1, rise: 0.85 },
];

export function Overture() {
  const reduced = usePrefersReducedMotion();

  const section = useRef<HTMLElement>(null);
  const shake = useRef<HTMLDivElement>(null);
  const figL = useRef<SVGGElement>(null);
  const figR = useRef<SVGGElement>(null);
  const spark = useRef<SVGGElement>(null);
  const debris = useRef<SVGGElement>(null);
  const wrapfly = useRef<SVGGElement>(null);
  const meats = useRef<(SVGRectElement | null)[]>([]);
  const poster = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const subtitle = useRef<HTMLParagraphElement>(null);
  const hint = useRef<HTMLDivElement>(null);

  const frame = useCallback(() => {
    const el = section.current;
    if (!el) return;

    // Progress is read off the section's own box rather than a scroll offset,
    // so it stays correct whatever sits above it on the page.
    const rect = el.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    const p = span > 0 ? clamp01(-rect.top / span) : 1;

    const lx = track(p, LX);
    const lean = track(p, LEAN);
    const sq = track(p, SQUASH);

    // Volume stays roughly constant: squash one axis, stretch the other.
    if (figL.current) {
      figL.current.style.transform = `translateX(${lx}px) rotate(${lean}deg) scale(${sq}, ${2 - sq})`;
    }
    if (figR.current) {
      figR.current.style.transform = `translateX(${-lx}px) rotate(${-lean}deg) scale(${sq}, ${2 - sq})`;
    }

    // the clash: a held beat at full size, then gone
    const sp = p > 0.5 && p < 0.66 ? Math.max(0, 1 - Math.abs(p - 0.555) / 0.105) : 0;
    if (spark.current) {
      spark.current.style.opacity = sp.toFixed(3);
      spark.current.style.transform = `scale(${0.5 + sp * 0.75}) rotate(${p * 220}deg)`;
    }

    // screen shake, strongest on impact
    const amp = p > 0.5 && p < 0.64 ? (1 - (p - 0.5) / 0.14) * 13 : 0;
    if (shake.current) {
      shake.current.style.transform =
        amp > 0
          ? `translate(${Math.sin(p * 420) * amp}px, ${Math.cos(p * 380) * amp * 0.6}px)`
          : "none";
    }

    // meat flies off the skewers
    const dp = clamp01((p - 0.52) / 0.26);
    if (debris.current) debris.current.style.opacity = dp > 0 && dp < 1 ? "1" : "0";
    meats.current.forEach((m, i) => {
      if (!m) return;
      const { dir, rise } = DEBRIS[i];
      const x = dp * 260 * dir;
      const y = dp * dp * 300 - dp * 250 * rise;
      m.style.transform = `translate(${x}px, ${y}px) rotate(${dp * 520 * dir}deg)`;
    });

    // the shawarma launches out of frame
    const wp = clamp01((p - 0.58) / 0.24);
    if (wrapfly.current) {
      wrapfly.current.style.opacity = wp > 0 && wp < 0.96 ? "1" : "0";
      wrapfly.current.style.transform = `translate(${wp * 300}px, ${wp * wp * 420 - wp * 460}px) rotate(${wp * 400}deg)`;
    }

    // the title holds, then clears for the fight; the poster is the cold open
    const tf = 1 - clamp01((p - 0.3) / 0.12);
    if (title.current) {
      title.current.style.opacity = String(tf);
      title.current.style.transform = `translateY(${(1 - tf) * -30}px)`;
    }
    if (subtitle.current) subtitle.current.style.opacity = String(tf);

    const pf = 1 - clamp01((p - 0.04) / 0.14);
    if (poster.current) {
      poster.current.style.opacity = String(pf);
      poster.current.style.transform = `translate(-50%, -50%) scale(${0.35 + pf * 0.65}) rotate(${(1 - pf) * -10}deg)`;
    }

    if (hint.current) {
      const label = p > 0.82 ? "Scroll" : "Scroll to fight";
      if (hint.current.textContent !== label) hint.current.textContent = label;
      // Once the stage unsticks the hint has nothing left to say, and the rest
      // of the page should not be read through a fixed capsule.
      hint.current.style.opacity = p >= 0.995 ? "0" : "1";
    }
  }, []);

  // `reduced` is null until the preference is known; holding still until then
  // means nobody sees a frame of motion they opted out of.
  useScrollFrame(frame, reduced === false);

  return (
    <>
      <section className={s.overture} ref={section} aria-label="Dueling Kebabs">
        <div className={s.stage}>
          <div className={s.shake} ref={shake}>
            <div className={s.duel}>
              <svg
                viewBox="0 0 960 560"
                role="img"
                aria-label="Two cartoon cooks duelling with kebab skewers"
              >
                {/* ---------- left cook: keffiyeh, full beard, gritted teeth ---------- */}
                <g className="fig figL" ref={figL}>
                  {/* thobe */}
                  <path className="ln cloth" d="M236 560 V436 C236 396 264 374 300 374 C336 374 364 396 364 436 V560 Z" />
                  <path d="M300 398 V560" stroke="#050505" strokeWidth="3" fill="none" opacity=".8" />
                  {/* raised arm: keyline stroke, then the sleeve over it */}
                  <path className="sleeveln" d="M352 408 C392 390 414 348 418 310" />
                  <path className="sleeve" d="M352 408 C392 390 414 348 418 310" />
                  {/* keffiyeh: crown plus two panels hanging past the shoulders */}
                  <path className="ln cloth" d="M300 240 C344 240 368 264 374 302 C382 356 378 424 372 482 L330 482 C339 424 342 374 338 344 L262 344 C258 374 261 424 270 482 L228 482 C222 424 218 356 226 302 C232 264 256 240 300 240 Z" />
                  {/* agal: two thin cords on the crown, above the hairline */}
                  <path d="M254 276 C260 250 276 240 300 240 C324 240 340 250 346 276" fill="none" stroke="#050505" strokeWidth="11" strokeLinecap="round" />
                  <path d="M256 290 C262 268 277 259 300 259 C323 259 338 268 344 290" fill="none" stroke="#050505" strokeWidth="8" strokeLinecap="round" />
                  {/* head, with the nose carried in the silhouette */}
                  <path className="ln skin" d="M300 266 C334 266 352 288 354 306 C370 307 382 314 381 326 C380 338 368 345 354 345 C352 363 334 376 300 376 C266 376 248 354 248 321 C248 288 266 266 300 266 Z" />
                  {/* beard: jaw, chin and cheeks, leaving the forehead and nose clear */}
                  <path className="hair" d="M250 314 C258 336 282 350 314 352 C334 352 347 345 352 334 C355 356 347 370 332 376 C318 382 280 382 267 373 C253 363 248 340 250 314 Z" />
                  {/* gritted teeth set into the beard */}
                  <rect x="308" y="349" width="36" height="16" rx="3.5" fill="#ffffff" stroke="#050505" strokeWidth="3.5" />
                  <path className="tooth" d="M320 349 V365 M332 349 V365" />
                  {/* eyes, looking at the opponent */}
                  <ellipse cx="282" cy="300" rx="14" ry="16" fill="#ffffff" stroke="#050505" strokeWidth="4.5" />
                  <ellipse cx="315" cy="300" rx="14" ry="16" fill="#ffffff" stroke="#050505" strokeWidth="4.5" />
                  <circle cx="289" cy="302" r="5.5" fill="#050505" />
                  <circle cx="322" cy="302" r="5.5" fill="#050505" />
                  <path className="brow" d="M261 280 L295 293" />
                  <path className="brow" d="M306 293 L338 284" />
                  {/* fist and skewer, up and to the right */}
                  <circle className="ln skin" cx="420" cy="302" r="17" />
                  <path d="M410 294 L430 294 M410 304 L430 304" stroke="#050505" strokeWidth="3" opacity=".7" />
                  <g>
                    <path className="rodline" d="M392 344 L556 102" fill="none" />
                    <path className="rod" d="M392 344 L556 102" fill="none" />
                    <rect className="meatc" x="454" y="206" width="30" height="30" rx="6" transform="rotate(-34 469 221)" />
                    <rect className="meatc" x="484" y="162" width="30" height="30" rx="6" transform="rotate(-34 499 177)" />
                    <rect className="meatc" x="514" y="118" width="30" height="30" rx="6" transform="rotate(-34 529 133)" />
                  </g>
                </g>

                {/* ---------- right cook: swept hair, walrus moustache, white shirt ---------- */}
                <g className="fig figR" ref={figR}>
                  {/* shirt with collar and buttons */}
                  <path className="ln cloth" d="M596 560 V436 C596 396 624 374 660 374 C696 374 724 396 724 436 V560 Z" />
                  <path className="ln cloth" d="M660 376 L634 402 L651 413 L660 396 Z" />
                  <path className="ln cloth" d="M660 376 L686 402 L669 413 L660 396 Z" />
                  <path d="M660 406 V560" stroke="#050505" strokeWidth="3" fill="none" opacity=".8" />
                  <circle cx="660" cy="442" r="3.5" fill="#050505" />
                  <circle cx="660" cy="480" r="3.5" fill="#050505" />
                  <circle cx="660" cy="518" r="3.5" fill="#050505" />
                  <path className="sleeveln" d="M608 408 C568 390 546 348 542 310" />
                  <path className="sleeve" d="M608 408 C568 390 546 348 542 310" />
                  {/* ear behind the head */}
                  <path className="ln skin" d="M710 314 C726 312 728 338 710 340" />
                  {/* head, nose on the left */}
                  <path className="ln skin" d="M660 266 C694 266 712 288 712 321 C712 354 694 376 660 376 C630 376 610 363 608 345 C592 344 578 337 579 325 C580 313 592 306 608 305 C610 286 628 266 660 266 Z" />
                  {/* swept black hair: a cap with a fringe pointing to the temple */}
                  <path className="hair" d="M612 300 C606 266 628 245 662 245 C698 245 718 268 712 296 C702 277 686 266 664 266 C646 266 632 275 624 289 C620 296 616 300 612 300 Z" />
                  <ellipse cx="637" cy="302" rx="14" ry="16" fill="#ffffff" stroke="#050505" strokeWidth="4.5" />
                  <ellipse cx="670" cy="302" rx="14" ry="16" fill="#ffffff" stroke="#050505" strokeWidth="4.5" />
                  <circle cx="630" cy="304" r="5.5" fill="#050505" />
                  <circle cx="663" cy="304" r="5.5" fill="#050505" />
                  <path className="brow" d="M652 285 L620 296" />
                  <path className="brow" d="M696 287 L665 294" />
                  {/* the walrus moustache, under the nose across the face */}
                  <path className="hair" d="M613 336 C627 327 643 329 653 337 L667 337 C679 329 695 329 705 338 C695 352 679 353 667 347 L653 347 C640 353 622 349 613 336 Z" />
                  <rect x="630" y="351" width="36" height="16" rx="3.5" fill="#ffffff" stroke="#050505" strokeWidth="3.5" />
                  <path className="tooth" d="M642 351 V367 M654 351 V367" />
                  {/* fist and skewer, up and to the left */}
                  <circle className="ln skin" cx="540" cy="302" r="17" />
                  <path d="M530 294 L550 294 M530 304 L550 304" stroke="#050505" strokeWidth="3" opacity=".7" />
                  <g>
                    <path className="rodline" d="M568 344 L404 102" fill="none" />
                    <path className="rod" d="M568 344 L404 102" fill="none" />
                    <rect className="meatc" x="476" y="206" width="30" height="30" rx="6" transform="rotate(34 491 221)" />
                    <rect className="meatc" x="446" y="162" width="30" height="30" rx="6" transform="rotate(34 461 177)" />
                    <rect className="meatc" x="416" y="118" width="30" height="30" rx="6" transform="rotate(34 431 133)" />
                  </g>
                </g>

                {/* ---------- the clash ---------- */}
                <g className="spark" ref={spark} style={{ opacity: 0 }}>
                  <path
                    d="M480 124 L502 190 L568 168 L516 214 L568 260 L502 238 L480 304 L458 238 L392 260 L444 214 L392 168 L458 190 Z"
                    fill="#ecbf1c"
                    stroke="#050505"
                    strokeWidth="5"
                    strokeLinejoin="round"
                  />
                  <circle cx="480" cy="214" r="18" fill="#ffffff" stroke="#050505" strokeWidth="4" />
                </g>

                <g ref={debris} style={{ opacity: 0 }}>
                  {[
                    { size: 26, rx: 6 },
                    { size: 22, rx: 5 },
                    { size: 18, rx: 4 },
                  ].map((cube, i) => (
                    <rect
                      key={i}
                      ref={(node) => {
                        meats.current[i] = node;
                      }}
                      className="meatc meat"
                      x="466"
                      y="200"
                      width={cube.size}
                      height={cube.size}
                      rx={cube.rx}
                    />
                  ))}
                </g>

                {/* the shawarma cone from the artwork, launched out of the fight */}
                <g className="wrapfly" ref={wrapfly} style={{ opacity: 0 }}>
                  <path d="M458 166 L514 166 L494 264 C490 275 478 275 474 264 Z" fill="#d49d25" stroke="#050505" strokeWidth="5" strokeLinejoin="round" />
                  <path d="M458 166 C466 148 486 143 500 150 C508 154 512 159 514 166 Z" fill="#8fbf5a" stroke="#050505" strokeWidth="4" strokeLinejoin="round" />
                  <circle cx="478" cy="157" r="8" fill="#c9553e" stroke="#050505" strokeWidth="3" />
                  <circle cx="499" cy="160" r="6" fill="#734007" stroke="#050505" strokeWidth="3" />
                  <circle cx="479" cy="206" r="4" fill="#a97418" />
                  <circle cx="489" cy="234" r="3.5" fill="#a97418" />
                </g>
              </svg>
            </div>

            <div className={s.ovtitle} ref={title}>
              DUELING KEBABS
            </div>
            <p className={s.ovsub} ref={subtitle}>
              Settle it downstairs. Dinner is upstairs.
            </p>
            <div className={s.poster} ref={poster}>
              <Image
                src={scenes.duellingKebabs}
                alt="Two cartoon cooks squaring off, one with a wrap and one with a loaded skewer, under hand-drawn red lettering reading Dueling Kebabs"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <div className={s.hint} ref={hint} aria-hidden="true">
        Scroll to fight
      </div>
    </>
  );
}
