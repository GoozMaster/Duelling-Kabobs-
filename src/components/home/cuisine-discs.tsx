"use client";

import Link from "next/link";

import { CuisineArt } from "@/components/cuisine-art";

import s from "./home.module.css";
import { useEnterOnce } from "./use-enter-once";

export type CuisineDisc = { name: string; count: number };

/**
 * The cuisine badges, entering as wheels.
 *
 * Discs roll, they do not fade: each enters on translateX + rotate(-360deg),
 * 80ms after the one before it. Five things entering together is noise; five
 * entering 80ms apart is a gag.
 *
 * The names and counts are real, passed down from the page's own query.
 */
export function CuisineDiscs({ cuisines }: { cuisines: CuisineDisc[] }) {
  const [ref, entered] = useEnterOnce<HTMLDivElement>();

  return (
    <div className={s.discs} ref={ref}>
      {cuisines.map((cuisine, i) => (
        <Link
          key={cuisine.name}
          href={`/recipes?cuisine=${encodeURIComponent(cuisine.name)}`}
          className={`${s.cz} ${entered ? s.in : ""}`}
        >
          {/* The picture is decorative: the cuisine name is the next line. */}
          <span className={s.d} style={{ transitionDelay: `${i * 0.08}s`, display: "block" }}>
            <CuisineArt name={cuisine.name} px={150} />
          </span>
          <span className={s.n}>{cuisine.name}</span>
          <span className={s.c}>
            {cuisine.count} {cuisine.count === 1 ? "recipe" : "recipes"}
          </span>
        </Link>
      ))}
    </div>
  );
}
