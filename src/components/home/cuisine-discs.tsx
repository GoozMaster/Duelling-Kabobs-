"use client";

import Image from "next/image";
import Link from "next/link";

import s from "./home.module.css";
import { badgeForCuisine } from "./logos";
import { useEnterOnce } from "./use-enter-once";

export type CuisineDisc = { name: string; count: number };

/**
 * The cuisine badges, entering as wheels.
 *
 * Discs roll, they do not fade: each enters on translateX + rotate(-360deg),
 * 80ms after the one before it. Five things entering together is noise; five
 * entering 80ms apart is a gag.
 *
 * The names and counts are real, passed down from the page's own query. They
 * used to be hardcoded, and named three cuisines that do not exist with counts
 * that matched nothing — harmless while the app had no recipes, and actively
 * misleading once it did.
 */
export function CuisineDiscs({ cuisines }: { cuisines: CuisineDisc[] }) {
  const [ref, entered] = useEnterOnce<HTMLDivElement>();

  return (
    <div className={s.discs} ref={ref}>
      {cuisines.map((cuisine, i) => {
        const badge = badgeForCuisine(cuisine.name);

        return (
          <Link
            key={cuisine.name}
            href={`/recipes?cuisine=${encodeURIComponent(cuisine.name)}`}
            className={`${s.cz} ${entered ? s.in : ""}`}
          >
            <div
              className={`${s.d} ${badge ? "" : s.ph}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
              aria-hidden={badge ? undefined : true}
            >
              {badge ? (
                /* alt is empty on purpose: the cuisine name is the next line of
                   text, so naming the badge again would just repeat it.

                   eager, not lazy: the disc starts 420px to the left of where it
                   lands, so a lazy loader reads it as off-screen and only fetches
                   it once it has rolled in — which shows an empty ring for the
                   first half of the gag. They are 128px thumbnails; just load
                   them. */
                <Image
                  src={badge}
                  alt=""
                  width={116}
                  height={116}
                  loading="eager"
                />
              ) : (
                cuisine.name.charAt(0)
              )}
            </div>
            <div className={s.n}>{cuisine.name}</div>
            <div className={s.c}>
              {cuisine.count} {cuisine.count === 1 ? "recipe" : "recipes"}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
