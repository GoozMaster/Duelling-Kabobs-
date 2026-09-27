/**
 * From the raw render to what the home page serves.
 *
 *   1. Loudness: two-pass EBU R128 to -16 LUFS integrated, -1.5 dBTP — the
 *      level web players and phones expect, so the narrator is neither
 *      whispering nor shouting next to everything else the viewer plays.
 *      Two passes because single-pass loudnorm rides the gain dynamically,
 *      and on a voice over a music bed that pumps.
 *   2. faststart: the index moves to the front of the file so the browser can
 *      start playing before the whole thing has downloaded.
 *   3. Poster: the title card, as a JPEG.
 *
 *   node video/tools/finish.mjs
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const bin = path.resolve(root, "../node_modules/@remotion/compositor-win32-x64-msvc");
const ffmpeg = path.join(bin, "ffmpeg.exe");

const raw = path.join(root, "out/explainer-raw.mp4");
const outDir = path.resolve(root, "../public/video");
fs.mkdirSync(outDir, { recursive: true });

// ---- 1. measure
const target = "I=-16:TP=-1.5:LRA=11";
const probe = spawnSync(ffmpeg, ["-hide_banner", "-nostats", "-i", raw, "-vn", "-af", `loudnorm=${target}:print_format=json`, "-f", "null", "-"], {
  maxBuffer: 64 * 1024 * 1024,
  encoding: "utf8",
});
const json = probe.stderr.slice(probe.stderr.lastIndexOf("{"), probe.stderr.lastIndexOf("}") + 1);
const m = JSON.parse(json);
console.log(`measured: ${m.input_i} LUFS, ${m.input_tp} dBTP, LRA ${m.input_lra}`);

// ---- 2. apply, linear, and move the index to the front
const out = path.join(outDir, "explainer.mp4");
execFileSync(ffmpeg, [
  "-y", "-v", "error", "-i", raw,
  "-af",
  `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`,
  "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
  "-movflags", "+faststart", out,
]);
console.log(`→ ${path.relative(process.cwd(), out)} (${(fs.statSync(out).size / 1e6).toFixed(1)} MB)`);

// ---- 3. poster: the title card, just after the clash settles
const POSTER_AT = Number(process.env.POSTER_AT ?? 48.4);
const serveUrl = await bundle({ entryPoint: path.join(root, "src/index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id: "Explainer" });
const png = path.join(root, "out/poster.png");
await renderStill({ serveUrl, composition, frame: Math.round(POSTER_AT * composition.fps), output: png });
const jpg = path.join(outDir, "explainer-poster.jpg");
execFileSync(ffmpeg, ["-y", "-v", "error", "-i", png, "-vf", "scale=1280:-1", "-q:v", "3", jpg]);
console.log(`→ ${path.relative(process.cwd(), jpg)} (${(fs.statSync(jpg).size / 1e3).toFixed(0)} kB)`);
