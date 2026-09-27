/**
 * Where every line of narration lands, in seconds.
 *
 * Pure and import-free on purpose: the composition calls it with the measured
 * clip lengths, and so does tools/music.mts under plain Node, so the score and
 * the picture are cut to the same clock without a generated file in between.
 */

export const FPS = 30;

/** 104 BPM. The score is built on this grid and scene changes snap to it. */
export const BEAT = 60 / 104;
export const BAR = BEAT * 4;

type LinePlan = { id: string; gap?: number };
type ScenePlan = { id: string; lines: LinePlan[]; tail?: number };

/**
 * `gap` is silence before a line, inside its scene. Between scenes the next
 * scene starts on the next half-bar after the last line plus a breath, so every
 * wipe falls on the music's beat rather than wherever the voice happened to end.
 */
export const PLAN: ScenePlan[] = [
  { id: "open", lines: [{ id: "l01", gap: 1.3 }, { id: "l02", gap: 0.35 }], tail: 1.6 },
  {
    id: "list",
    lines: [
      { id: "l03", gap: 0.5 },
      { id: "l04", gap: 0.45 },
      { id: "l05", gap: 0.5 },
      { id: "l06", gap: 0.55 },
    ],
    tail: 1.0,
  },
  { id: "problem", lines: [{ id: "l07", gap: 0.5 }, { id: "l08", gap: 0.45 }], tail: 1.1 },
  {
    id: "idea",
    lines: [{ id: "l09", gap: 0.45 }, { id: "l10", gap: 0.4 }, { id: "l11", gap: 0.55 }],
    tail: 2.2,
  },
  { id: "menu", lines: [{ id: "l12", gap: 0.5 }, { id: "l13", gap: 0.4 }], tail: 1.2 },
  {
    id: "pantry",
    lines: [{ id: "l14", gap: 0.5 }, { id: "l15", gap: 0.4 }, { id: "l16", gap: 0.45 }],
    tail: 1.0,
  },
  {
    id: "search",
    lines: [
      { id: "l17", gap: 0.5 },
      { id: "l18", gap: 0.5 },
      { id: "l19", gap: 1.6 },
      { id: "l20", gap: 0.6 },
    ],
    tail: 1.0,
  },
  {
    id: "shop",
    lines: [{ id: "l21", gap: 0.5 }, { id: "l22", gap: 1.1 }, { id: "l23", gap: 0.9 }],
    tail: 1.1,
  },
  { id: "surprise", lines: [{ id: "l24", gap: 0.5 }], tail: 3.4 },
  { id: "close", lines: [{ id: "l25", gap: 0.8 }, { id: "l26", gap: 0.6 }], tail: 3.2 },
];

export type TimedLine = { id: string; start: number; end: number };
export type TimedScene = {
  id: string;
  start: number;
  end: number;
  lines: TimedLine[];
};
export type Timeline = { scenes: TimedScene[]; lines: Record<string, TimedLine>; duration: number };

const snap = (t: number, grid: number) => Math.ceil(t / grid - 1e-6) * grid;

export function buildTimeline(durations: Record<string, number>): Timeline {
  const scenes: TimedScene[] = [];
  const lines: Record<string, TimedLine> = {};
  let cursor = 0;

  for (const plan of PLAN) {
    const start = cursor;
    let t = start;
    const timed: TimedLine[] = [];
    for (const line of plan.lines) {
      t += line.gap ?? 0.45;
      const d = durations[line.id];
      if (d === undefined) throw new Error(`No narration clip for ${line.id}`);
      const tl = { id: line.id, start: t, end: t + d };
      timed.push(tl);
      lines[line.id] = tl;
      t = tl.end;
    }
    const end = snap(t + (plan.tail ?? 1), BAR / 2);
    scenes.push({ id: plan.id, start, end, lines: timed });
    cursor = end;
  }

  return { scenes, lines, duration: cursor };
}
