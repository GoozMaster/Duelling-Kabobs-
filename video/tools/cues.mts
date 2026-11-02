/**
 * The picture's cue list for the real-sound mix, read from the picture code.
 *
 * Every scene is mounted once with Remotion swapped for a stand-in that renders
 * all its children, and each <Sfx> reports where it sits in film time. So the
 * cue list is the same arithmetic the composition does, never a copy of it.
 *
 *   node video/tools/cues.mts   → video/out/cues.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

// The parts of Remotion the scenes use, without a browser: time is frame 0,
// every Sequence shows its children, nothing plays.
const STAND_IN = `
  import { createElement, Fragment } from "react";
  export { Easing, interpolate } from "remotion";
  const pass = ({ children }) => createElement(Fragment, null, children);
  export const AbsoluteFill = pass;
  export const Sequence = pass;
  export const Html5Audio = () => null;
  export const Img = () => null;
  export const staticFile = (f) => f;
  export const useCurrentFrame = () => 0;
  export const useVideoConfig = () => ({ fps: 30, width: 1920, height: 1080, durationInFrames: 1 });
  export const delayRender = () => 0;
  export const continueRender = () => {};
`;

const out = await build({
  stdin: {
    contents: `
      import { createElement } from "react";
      import { renderToStaticMarkup } from "react-dom/server";
      import { Explainer, timeline } from "./src/Explainer";
      export function run() { renderToStaticMarkup(createElement(Explainer)); return timeline; }
    `,
    resolveDir: root,
    loader: "tsx",
  },
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  external: ["react", "react/*", "react-dom", "react-dom/*", "remotion"],
  jsx: "automatic",
  plugins: [
    {
      name: "remotion-stand-in",
      setup(b) {
        b.onResolve({ filter: /^remotion$/ }, (args) =>
          args.namespace === "stand-in" ? { path: "remotion", external: true } : { path: "remotion", namespace: "stand-in" },
        );
        b.onLoad({ filter: /.*/, namespace: "stand-in" }, () => ({ contents: STAND_IN, resolveDir: root, loader: "js" }));
      },
    },
  ],
});

const bundle = path.join(root, "out/.cues-bundle.mjs");
fs.mkdirSync(path.dirname(bundle), { recursive: true });
fs.writeFileSync(bundle, out.outputFiles[0].text);

type Raw = { t: number; name: string; volume: number };
const raw: Raw[] = [];
(globalThis as { __cue?: (c: Raw) => void }).__cue = (c) => raw.push(c);
const { run } = await import(`file://${bundle.replace(/\\/g, "/")}`);
const timeline = run();
fs.rmSync(bundle);

const FPS = 30;
// What each synthesised effect stood for, in real-sound's vocabulary.
const KIND: Record<string, string> = {
  pop: "pop",
  thock: "land",
  stamp: "hit",
  whoosh: "whoosh",
  tick: "tick",
  switch: "click",
  ding: "bell",
  sparkle: "swell",
};

const sceneAt = (t: number) =>
  timeline.scenes.find((s: { start: number; end: number }) => t >= s.start - 0.5 && t < s.end)?.id ?? "end";
const counts: Record<string, number> = {};
const events = raw
  .sort((a, b) => a.t - b.t)
  .map((c) => {
    const scene = sceneAt(c.t);
    const key = `${scene}:${c.name}`;
    const n = (counts[key] = (counts[key] ?? -1) + 1);
    return {
      f: +(c.t * FPS).toFixed(2),
      kind: KIND[c.name] ?? c.name,
      weight: +Math.min(2, c.volume / 0.5).toFixed(2),
      id: `${key}:${n}`,
      was: c.name,
    };
  });

const lines = timeline.lines as Record<string, { start: number; end: number }>;
const doc = {
  fps: FPS,
  bpm: 104,
  total: Math.round(timeline.duration * FPS),
  acts: Object.fromEntries(
    timeline.scenes.map((s: { id: string; start: number; end: number }) => [
      s.id,
      { from: Math.round(s.start * FPS), dur: Math.round((s.end - s.start) * FPS) },
    ]),
  ),
  cue: {
    titleHit: Math.round(lines.l11.start * FPS),
    close: Math.round(timeline.scenes.at(-1).start * FPS),
    lastLineEnd: Math.round(lines.l26.end * FPS),
  },
  lines: Object.fromEntries(Object.entries(lines).map(([id, l]) => [id, [+(l.start * FPS).toFixed(1), +(l.end * FPS).toFixed(1)]])),
  events,
};
fs.writeFileSync(path.join(root, "out/cues.json"), JSON.stringify(doc, null, 1));
console.log(`cues: ${events.length} events over ${timeline.duration.toFixed(2)}s → video/out/cues.json`);
