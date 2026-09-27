/**
 * Proof frames: bundle once, render any number of stills at given times.
 *
 *   node video/tools/stills.mjs <outDir> <seconds> [seconds...] [--scale=0.5]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const args = process.argv.slice(2);
const scale = Number(args.find((a) => a.startsWith("--scale="))?.split("=")[1] ?? 0.5);
const [outDir, ...times] = args.filter((a) => !a.startsWith("--"));
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id: "Explainer" });

for (const s of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  const output = path.join(outDir, `t${Number(s).toFixed(2).padStart(6, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output, scale });
  console.log(output);
}
