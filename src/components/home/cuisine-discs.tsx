"use client";

import Image from "next/image";

import s from "./home.module.css";
import { badges, type CuisineKey } from "./logos";
import { useEnterOnce } from "./use-enter-once";

/**
 * The five cuisine badges, entering as wheels.
 *
 * Discs roll, they do not fade: each enters on translateX + rotate(-360deg),
 * 80ms after the one before it. Six things entering together is noise; six
 * entering 80ms apart is a gag.
 */
const CUISINES: { key: CuisineKey; name: string; note: string }[] = [
  { key: "italian", name: "Italian", note: "14 recipes" },
  { key: "japanese", name: "Japanese", note: "9 recipes" },
  { key: "persian", name: "Persian", note: "11 recipes" },
  { key: "french", name: "French", note: "6 recipes" },
  { key: "chinese", name: "Chinese", note: "8 recipes" },
];

export function CuisineDiscs() {
  const [ref, entered] = useEnterOnce<HTMLDivElement>();

  return (
    <div className={s.discs} ref={ref}>
      {CUISINES.map((cuisine, i) => (
        <div key={cuisine.key} className={`${s.cz} ${entered ? s.in : ""}`}>
          <div className={s.d} style={{ transitionDelay: `${i * 0.08}s` }}>
            {/* alt is empty on purpose: the cuisine name is the next line of
                text, so naming the badge again would just repeat it.

                eager, not lazy: the disc starts 420px to the left of where it
                lands, so a lazy loader reads it as off-screen and only fetches
                it once it has rolled in — which shows an empty ring for the
                first half of the gag. They are 128px thumbnails; just load
                them. */}
            <Image
              src={badges[cuisine.key]}
              alt=""
              width={116}
              height={116}
              loading="eager"
            />
          </div>
          <div className={s.n}>{cuisine.name}</div>
          <div className={s.c}>{cuisine.note}</div>
        </div>
      ))}
    </div>
  );
}
