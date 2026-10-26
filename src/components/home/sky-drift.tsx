import type { CSSProperties } from "react";

import s from "./home.module.css";

/**
 * A lane of sky weather: outlined cartoon clouds drifting across the gap
 * between two sections of the sky.
 *
 * This used to be a fixed, scroll-parallaxed layer over the whole page. It
 * needed JavaScript and a stacking order every section had to know about, its
 * clouds wandered across headings, and their viewBox was cut tight to the
 * path's start points — so the puffs, which bulge above those points, lost
 * their tops wherever they were. Now each lane is its own strip of empty sky,
 * the clouds cannot leave it, and each viewBox has room on every side for the
 * shape and its keyline.
 *
 * Delays are negative so the clouds are already spread out on arrival rather
 * than queuing at the left edge. `rest` is where each one stops when motion is
 * reduced.
 */
const SHAPES = [
  {
    viewBox: "0 0 160 80",
    d: "M24 72A20 20 0 0 1 30 36A26 26 0 0 1 76 22A22 22 0 0 1 116 34A21.5 21.5 0 0 1 136 72Z",
  },
  {
    viewBox: "0 0 140 80",
    d: "M20 70A18 18 0 0 1 34 40A24 24 0 0 1 80 30A18 18 0 0 1 112 44A14 14 0 0 1 120 70Z",
  },
];

type Cloud = {
  shape: number;
  top: number;
  width: number;
  duration: number;
  delay: number;
  rest: string;
};

const LANES: Record<"middle" | "end", Cloud[]> = {
  middle: [
    { shape: 0, top: 24, width: 170, duration: 80, delay: -18, rest: "8vw" },
    { shape: 1, top: 52, width: 120, duration: 104, delay: -70, rest: "70vw" },
  ],
  end: [
    { shape: 1, top: 18, width: 150, duration: 92, delay: -40, rest: "56vw" },
    { shape: 0, top: 40, width: 110, duration: 120, delay: -95, rest: "22vw" },
  ],
};

export function SkyDrift({ lane }: { lane: keyof typeof LANES }) {
  return (
    <div className={s.lane} aria-hidden="true">
      {LANES[lane].map((cloud, i) => {
        const shape = SHAPES[cloud.shape];
        return (
          <svg
            key={i}
            viewBox={shape.viewBox}
            className={s.cloud}
            style={
              {
                top: cloud.top,
                width: cloud.width,
                animationDuration: `${cloud.duration}s`,
                animationDelay: `${cloud.delay}s`,
                "--rest": cloud.rest,
              } as CSSProperties
            }
          >
            <path d={shape.d} />
          </svg>
        );
      })}
    </div>
  );
}
