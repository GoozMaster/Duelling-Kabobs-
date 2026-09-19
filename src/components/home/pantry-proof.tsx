"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import s from "./home.module.css";
import { badges, type CuisineKey } from "./logos";
import { useEnterOnce } from "./use-enter-once";
import { usePrefersReducedMotion } from "./use-scroll-frame";

/**
 * The whole trick, in two cards: what is on hand, and what that gets you.
 *
 * Everything here is an illustration of the product, not live data — the page
 * is the logged-out view and has nothing to read. The vocabulary is the app's
 * own, though: pantry, fridge, freezer, needs review.
 */
const PANTRY = [
  { item: "chicken thighs", have: true },
  { item: "soy sauce", have: true },
  { item: "ginger", have: true },
  { item: "scallions", have: true },
  { item: "garlic", have: true },
  { item: "mirin", have: false },
  { item: "rice", have: true },
  { item: "black beans", have: true },
];

const MATCHES: {
  cuisine: CuisineKey;
  title: string;
  note: string;
  tag: "ok" | "rev";
  tagLabel: string;
}[] = [
  {
    cuisine: "japanese",
    title: "Chicken Teriyaki Stir-Fry",
    note: "Japanese · mirin substituted",
    tag: "ok",
    tagLabel: "Can make",
  },
  {
    cuisine: "italian",
    title: "Margherita, no basil",
    note: "Italian · basil is optional",
    tag: "ok",
    tagLabel: "Can make",
  },
  {
    cuisine: "persian",
    title: "Kebab Koobideh",
    note: "Imported from CSV",
    tag: "rev",
    tagLabel: "Needs review",
  },
];

export function PantryProof() {
  const [pantryRef, pantryEntered] = useEnterOnce<HTMLDivElement>();
  const [resultsRef, resultsEntered] = useEnterOnce<HTMLDivElement>();

  return (
    <div className={s.split}>
      <div className={`${s.card} ${pantryEntered ? s.in : ""}`} ref={pantryRef}>
        <h3>My pantry tonight</h3>
        <div className={s.pills}>
          {PANTRY.map((entry, i) => (
            <span
              key={entry.item}
              className={`${s.pill} ${entry.have ? s.have : ""}`}
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              {entry.item}
            </span>
          ))}
        </div>
        <p className={s.footnote}>
          Staples are sticky. Fridge and freezer stay saved between visits.
        </p>
      </div>

      <div
        className={`${s.card} ${s.reveal} ${resultsEntered ? s.in : ""}`}
        ref={resultsRef}
      >
        <MatchCount start={resultsEntered} />
        <h3 style={{ marginTop: 2 }}>recipes, zero shopping</h3>
        {MATCHES.map((match) => (
          <div key={match.title} className={s.rec}>
            <Image
              className={s.th}
              src={badges[match.cuisine]}
              alt=""
              width={48}
              height={48}
            />
            <span className={s.recText}>
              <span className={s.t}>{match.title}</span>
              <br />
              <span className={s.s}>{match.note}</span>
            </span>
            <span className={`${s.tag} ${s[match.tag]}`}>{match.tagLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Ticks 0 → 3 once the card arrives. The number is the punchline of the card,
 *  so it lands after the card rather than being there already. */
function MatchCount({ start }: { start: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [ticked, setTicked] = useState(0);

  useEffect(() => {
    if (!start || reduced !== false) return;

    const id = setInterval(() => {
      setTicked((current) => {
        if (current >= MATCHES.length) {
          clearInterval(id);
          return current;
        }
        return current + 1;
      });
    }, 170);

    return () => clearInterval(id);
  }, [start, reduced]);

  // With motion reduced the count is derived rather than animated, so it shows
  // its end state without an effect having to write it.
  const count = reduced ? MATCHES.length : ticked;

  return <div className={s.count}>{count}</div>;
}
