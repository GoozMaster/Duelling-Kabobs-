/**
 * WebVTT captions for the player, cut from the same clock as the picture.
 *
 * The home page player is muted by nobody but will be watched with the sound
 * off by plenty, so captions are not optional. Long lines are split at
 * sentence and clause breaks into cues of at most ~48 characters, each timed in
 * proportion to its share of the line's characters.
 *
 *   node video/tools/captions.mts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildTimeline } from "../src/timeline.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const narration: Array<{ id: string; text: string }> = JSON.parse(
  fs.readFileSync(path.join(root, "src/narration.json"), "utf8"),
);
const timeline = buildTimeline(JSON.parse(fs.readFileSync(path.join(root, "src/narration-timing.json"), "utf8")));

const MAX = 48;

/** Sentences first, then clauses, then words, until every piece fits. */
function split(text: string): string[] {
  const sentences = text.match(/[^.?!:]+[.?!:]+\s*|[^.?!:]+$/g) ?? [text];
  const out: string[] = [];
  for (const s of sentences.map((x) => x.trim()).filter(Boolean)) {
    if (s.length <= MAX) {
      out.push(s);
      continue;
    }
    let line = "";
    for (const clause of s.split(/(?<=,)\s+/)) {
      if (line && (line + " " + clause).length > MAX) {
        out.push(line);
        line = clause;
      } else {
        line = line ? `${line} ${clause}` : clause;
      }
    }
    if (line) out.push(line);
  }
  // Merge short neighbours back together so a cue is not a single word.
  const merged: string[] = [];
  for (const piece of out) {
    const prev = merged[merged.length - 1];
    if (prev && (prev + " " + piece).length <= MAX && (prev.length < 16 || piece.length < 16)) {
      merged[merged.length - 1] = `${prev} ${piece}`;
    } else merged.push(piece);
  }
  return merged;
}

const stamp = (s: number) => {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(ms % 1000).padStart(3, "0")}`;
};

const cues: Array<{ start: number; end: number; text: string }> = [];
for (const { id, text } of narration) {
  const line = timeline.lines[id];
  const pieces = split(text);
  const total = pieces.reduce((n, p) => n + p.length, 0);
  let t = line.start;
  for (const piece of pieces) {
    const d = ((line.end - line.start) * piece.length) / total;
    cues.push({ start: t, end: t + d, text: piece });
    t += d;
  }
}

// Each cue is held up to 0.6s past the voice so the eye can finish reading,
// but never into the next cue — two captions stacked is worse than a short one.
const body = cues.map((cue, i) => {
  const next = cues[i + 1]?.start ?? Infinity;
  const end = Math.min(cue.end + 0.6, next - 0.02);
  return `${stamp(cue.start)} --> ${stamp(end)}\n${cue.text}`;
});

const out = path.resolve(root, "../public/video/explainer.vtt");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `WEBVTT\n\n${body.join("\n\n")}\n`);
console.log(`${cues.length} cues → ${path.relative(process.cwd(), out)}`);
