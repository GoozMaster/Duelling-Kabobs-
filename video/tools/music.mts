/**
 * The score and the sound effects, synthesised from nothing.
 *
 * Nothing here is sampled or licensed, so there is nothing to clear: every
 * instrument is a handful of sine partials with an envelope, and the drums are
 * shaped noise. The arrangement is cut to the same clock as the picture —
 * timeline.ts is imported directly — so the breakdown lands on "the problem",
 * the band comes back for the title, and the last chord rings out over the end
 * card whatever the narration's final length turns out to be.
 *
 *   node video/tools/music.mts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BAR, BEAT, buildTimeline } from "../src/timeline.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const SR = 48000;

const durations = JSON.parse(fs.readFileSync(path.join(root, "src/narration-timing.json"), "utf8"));
const timeline = buildTimeline(durations);
const scene = (id: string) => timeline.scenes.find((s) => s.id === id)!;

// ---------------------------------------------------------------- buffers

class Stereo {
  L: Float32Array;
  R: Float32Array;
  constructor(seconds: number) {
    this.L = new Float32Array(Math.ceil(seconds * SR));
    this.R = new Float32Array(Math.ceil(seconds * SR));
  }
  get length() {
    return this.L.length;
  }
  /** Equal-power pan, -1 left to 1 right. */
  add(i: number, v: number, pan = 0) {
    if (i < 0 || i >= this.L.length) return;
    const a = ((pan + 1) * Math.PI) / 4;
    this.L[i] += v * Math.cos(a);
    this.R[i] += v * Math.sin(a);
  }
}

// Deterministic noise, so a re-render is bit-identical.
let seed = 1234567;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);
const NOTE: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
/** "G#2" → MIDI 44. Any letter takes a sharp or a flat; anything else throws. */
const n = (name: string) => {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`Not a note: ${name}`);
  return 12 * (Number(m[3]) + 1) + NOTE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
};

type Partial = { ratio: number; amp: number; decay: number };

/** A struck tone: sine partials, each with its own exponential decay. */
function strike(
  out: Stereo,
  t0: number,
  freq: number,
  amp: number,
  partials: Partial[],
  opts: { pan?: number; attack?: number; length?: number } = {},
) {
  const attack = opts.attack ?? 0.004;
  const len = opts.length ?? Math.max(...partials.map((p) => p.decay)) * 6;
  const start = Math.round(t0 * SR);
  const count = Math.round(len * SR);
  const release = Math.round(0.01 * SR);
  for (let k = 0; k < count; k++) {
    const t = k / SR;
    let v = 0;
    for (const p of partials) v += p.amp * Math.exp(-t / p.decay) * Math.sin(2 * Math.PI * freq * p.ratio * t);
    const env = Math.min(1, t / attack) * (k > count - release ? (count - k) / release : 1);
    out.add(start + k, v * env * amp, opts.pan ?? 0);
  }
}

const MARIMBA: Partial[] = [
  { ratio: 1, amp: 1, decay: 0.42 },
  { ratio: 3.93, amp: 0.2, decay: 0.07 },
  { ratio: 9.2, amp: 0.05, decay: 0.02 },
];
const BASS: Partial[] = [
  { ratio: 1, amp: 1, decay: 0.34 },
  { ratio: 2, amp: 0.35, decay: 0.2 },
  { ratio: 3, amp: 0.12, decay: 0.12 },
];
const GLOCK: Partial[] = [
  { ratio: 1, amp: 1, decay: 0.9 },
  { ratio: 2.76, amp: 0.3, decay: 0.25 },
  { ratio: 5.4, amp: 0.12, decay: 0.08 },
];
const BELL: Partial[] = [
  { ratio: 1, amp: 1, decay: 0.7 },
  { ratio: 2.0, amp: 0.45, decay: 0.45 },
  { ratio: 3.01, amp: 0.25, decay: 0.2 },
  { ratio: 4.2, amp: 0.12, decay: 0.12 },
];

/** A held organ-ish chord: soft attack, slow tremolo, no decay. */
function pad(out: Stereo, t0: number, dur: number, notes: number[], amp: number, pan = -0.35) {
  const start = Math.round(t0 * SR);
  const count = Math.round(dur * SR);
  const fade = 0.18 * SR;
  for (let k = 0; k < count; k++) {
    const t = k / SR;
    const env = Math.min(1, k / fade, (count - k) / fade) * (1 + 0.08 * Math.sin(2 * Math.PI * 5.2 * t));
    let v = 0;
    for (const note of notes) {
      const f = midi(note);
      v += Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t) + 0.12 * Math.sin(6 * Math.PI * f * t);
    }
    out.add(start + k, (v / notes.length) * env * amp, pan);
  }
}

/**
 * Noise through a state-variable bandpass whose centre can sweep.
 *
 * Simper's zero-delay-feedback SVF, not the textbook Chamberlin one. The
 * Chamberlin filter is only stable while its frequency coefficient stays
 * under 2 minus the damping, and a 7.5kHz hi-hat is past that: it ran to
 * infinity on the first hat, and the NaNs it made went through the reverb and
 * silenced every bar after the intro. This form is stable at any setting.
 */
function noiseHit(
  out: Stereo,
  t0: number,
  dur: number,
  amp: number,
  opts: { f0: number; f1?: number; q?: number; decay?: number; attack?: number; pan?: number; shape?: (x: number) => number },
) {
  const start = Math.round(t0 * SR);
  const count = Math.round(dur * SR);
  let ic1 = 0,
    ic2 = 0;
  const damping = opts.q ?? 0.7; // lower rings more
  for (let k = 0; k < count; k++) {
    const x = k / count;
    const fc = opts.f0 * ((opts.f1 ?? opts.f0) / opts.f0) ** x;
    const g = Math.tan((Math.PI * Math.min(fc, SR * 0.45)) / SR);
    const a1 = 1 / (1 + g * (g + damping));
    const a2 = g * a1;
    const a3 = g * a2;
    const v3 = noise() - ic2;
    const band = a1 * ic1 + a2 * v3;
    const low = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * band - ic1;
    ic2 = 2 * low - ic2;
    const t = k / SR;
    const env = opts.shape
      ? opts.shape(x)
      : Math.min(1, t / (opts.attack ?? 0.002)) * Math.exp(-t / (opts.decay ?? 0.05));
    out.add(start + k, band * env * amp, opts.pan ?? 0);
  }
}

function kick(out: Stereo, t0: number, amp: number) {
  const start = Math.round(t0 * SR);
  const count = Math.round(0.35 * SR);
  let phase = 0;
  for (let k = 0; k < count; k++) {
    const t = k / SR;
    const f = 48 + 70 * Math.exp(-t / 0.035);
    phase += (2 * Math.PI * f) / SR;
    out.add(start + k, Math.sin(phase) * Math.exp(-t / 0.13) * Math.min(1, t / 0.002) * amp);
  }
}

// ---------------------------------------------------------------- reverb

/** Freeverb, small room: enough air to glue the parts, not enough to smear the voice. */
function reverb(dry: Stereo, wet: number) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => Math.round((d * SR) / 44100));
  const allpasses = [556, 441, 341, 225].map((d) => Math.round((d * SR) / 44100));
  const run = (input: Float32Array, spread: number) => {
    const out = new Float32Array(input.length);
    for (const d0 of combs) {
      const d = d0 + spread;
      const buf = new Float32Array(d);
      let idx = 0,
        store = 0;
      for (let i = 0; i < input.length; i++) {
        const y = buf[idx];
        store = y * 0.8 + store * 0.2; // damping
        buf[idx] = input[i] * 0.015 + store * 0.8; // room size
        out[i] += y;
        idx = (idx + 1) % d;
      }
    }
    for (const d0 of allpasses) {
      const d = d0 + spread;
      const buf = new Float32Array(d);
      let idx = 0;
      for (let i = 0; i < out.length; i++) {
        const b = buf[idx];
        buf[idx] = out[i] + b * 0.5;
        out[i] = b - out[i];
        idx = (idx + 1) % d;
      }
    }
    return out;
  };
  const L = run(dry.L, 0);
  const R = run(dry.R, 23);
  for (let i = 0; i < dry.length; i++) {
    dry.L[i] += L[i] * wet;
    dry.R[i] += R[i] * wet;
  }
}

// ---------------------------------------------------------------- output

/**
 * Levels by loudness, not by peak. Peak-normalising a synth mix lets one kick
 * set the level of everything, and the bed came out 15dB too quiet to hear
 * under the voice. So: measure RMS — over the whole file, or for a short
 * effect over its loudest 50ms, which is what the ear judges — scale to the
 * target, and let a soft knee above -3dBFS round off the few transients that
 * the gain pushes past it.
 */
function writeWav(file: string, s: Stereo, rmsDb: number, window: "whole" | "loudest" = "whole") {
  // A non-finite sample becomes silence when written as 16-bit, which is how a
  // blown-up filter once shipped a score that went quiet after two seconds.
  for (let i = 0; i < s.length; i++) {
    if (!Number.isFinite(s.L[i]) || !Number.isFinite(s.R[i])) {
      throw new Error(`${path.basename(file)}: non-finite sample at ${(i / SR).toFixed(3)}s`);
    }
  }
  let rms: number;
  if (window === "whole") {
    let sum = 0;
    for (let i = 0; i < s.length; i++) sum += s.L[i] ** 2 + s.R[i] ** 2;
    rms = Math.sqrt(sum / (2 * s.length));
  } else {
    const w = Math.round(0.05 * SR);
    rms = 0;
    for (let i = 0; i + w <= s.length; i += w / 2) {
      let sum = 0;
      for (let j = i; j < i + w; j++) sum += s.L[j] ** 2 + s.R[j] ** 2;
      rms = Math.max(rms, Math.sqrt(sum / (2 * w)));
    }
  }
  const gain = rms ? 10 ** (rmsDb / 20) / rms : 1;

  const KNEE = 10 ** (-3 / 20);
  const limit = (x: number) => {
    const a = Math.abs(x);
    if (a <= KNEE) return x;
    return Math.sign(x) * (KNEE + (1 - KNEE) * Math.tanh((a - KNEE) / (1 - KNEE)));
  };

  let limited = 0;
  const data = Buffer.alloc(s.length * 4);
  for (let i = 0; i < s.length; i++) {
    const l = s.L[i] * gain;
    const r = s.R[i] * gain;
    if (Math.abs(l) > KNEE || Math.abs(r) > KNEE) limited++;
    data.writeInt16LE(Math.round(limit(l) * 32767), i * 4);
    data.writeInt16LE(Math.round(limit(r) * 32767), i * 4 + 2);
  }
  if (limited / s.length > 0.001) {
    console.warn(`${path.basename(file)}: ${((100 * limited) / s.length).toFixed(2)}% of samples in the limiter`);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28);
  h.writeUInt16LE(4, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}

// ================================================================= score

type Chord = { root: string; tones: string[]; walk: string[] };

// I – VI7 – ii7 – V7 in C, the sitcom turnaround. The walking bass outlines
// each chord and leads by step into the next.
const GROOVE: Chord[] = [
  { root: "C", tones: ["E4", "G4", "A4", "C5"], walk: ["C2", "E2", "G2", "G#2"] },
  { root: "A", tones: ["E4", "G4", "C#5", "E5"], walk: ["A2", "C#3", "E2", "Eb2"] },
  { root: "D", tones: ["F4", "A4", "C5", "D5"], walk: ["D2", "F2", "A2", "Ab2"] },
  { root: "G", tones: ["F4", "B4", "D5", "F5"], walk: ["G2", "B2", "D2", "B1"] },
];
// The worry: A minor, down a step at a time. Same length, so the bar grid holds.
const WORRY: Chord[] = [
  { root: "A", tones: ["C4", "E4", "A4"], walk: ["A1"] },
  { root: "G", tones: ["B3", "D4", "G4"], walk: ["G1"] },
  { root: "F", tones: ["A3", "C4", "F4"], walk: ["F1"] },
  { root: "E", tones: ["G#3", "B3", "E4"], walk: ["E1"] },
];

const SWING = 0.62; // share of the beat the first 8th takes
const eighth = (beat: number, off: boolean) => (off ? beat + SWING : beat) * BEAT;

const problem = scene("problem");
const idea = scene("idea");
const titleHit = timeline.lines.l11.start;
const lastLine = timeline.lines.l26;
// The final chord lands on the first beat after "Down with hunger." finishes.
const button = Math.ceil((lastLine.end + 0.15) / BEAT) * BEAT;
const total = timeline.duration;

const music = new Stereo(total + 0.5);

// Marimba comping patterns, in swung 8ths: [beat, offbeat?, chord-tone index]
const COMP: Array<[number, boolean, number]> = [
  [0, true, 1],
  [1, true, 2],
  [2, false, 3],
  [2, true, 1],
  [3, true, 2],
];

const bars = Math.ceil(button / BAR);
for (let b = 0; b < bars; b++) {
  const t = b * BAR;
  const worry = t >= problem.start - 0.01 && t < idea.start - 0.01;
  const rebuilding = t >= idea.start - 0.01 && t < titleHit - 0.01;
  const chords = worry ? WORRY : GROOVE;
  const chord = chords[b % 4];
  const intro = b < 1;

  // ---- bass
  if (worry) {
    strike(music, t, midi(n(chord.walk[0])), 0.5, BASS, { length: BAR });
  } else {
    chord.walk.forEach((note, i) => {
      const at = t + i * BEAT;
      if (at < button - 0.01) strike(music, at, midi(n(note)), 0.5, BASS, { length: BEAT * 1.1 });
    });
  }

  // ---- marimba
  if (worry) {
    // sparse, two notes a bar, left of centre: the band has walked off
    strike(music, t, midi(n(chord.tones[2])), 0.16, MARIMBA, { pan: -0.2 });
    strike(music, t + 2 * BEAT, midi(n(chord.tones[1])), 0.12, MARIMBA, { pan: -0.2 });
  } else {
    for (const [beat, off, idx] of COMP) {
      const at = t + eighth(beat, off);
      if (at >= button - 0.01) continue;
      const tone = chord.tones[idx % chord.tones.length];
      strike(music, at, midi(n(tone)), 0.2, MARIMBA, { pan: 0.3 });
      // a softer third below doubles it, so the stab reads as a chord
      strike(music, at, midi(n(tone) - 3), 0.08, MARIMBA, { pan: 0.3 });
    }
  }

  // ---- pad
  pad(music, t, Math.min(BAR, button - t), chord.tones.map(n), worry ? 0.06 : 0.035);

  // ---- drums
  if (!worry && !intro) {
    for (let beat = 0; beat < 4; beat++) {
      const at = t + beat * BEAT;
      if (at >= button - 0.01) break;
      if (rebuilding && beat % 2 === 1) continue; // half-time while it rebuilds
      if (beat % 2 === 0) kick(music, at, 0.3);
      else noiseHit(music, at, 0.25, 0.22, { f0: 2400, q: 0.9, decay: 0.07, pan: -0.1 }); // brush
      for (const off of [false, true]) {
        noiseHit(music, eighth(beat, off) + t, 0.06, off ? 0.08 : 0.05, { f0: 7500, q: 1.2, decay: 0.018, pan: 0.45 });
      }
    }
  }
}

// ---- the rebuild: a glockenspiel run up into the title, and a hit on it
{
  const run = ["C5", "E5", "G5", "C6", "E6", "G6"];
  run.forEach((note, i) => strike(music, titleHit - (run.length - i) * (BEAT / 3), midi(n(note)), 0.14, GLOCK, { pan: 0.2 }));
  kick(music, titleHit, 0.45);
  noiseHit(music, titleHit, 1.6, 0.35, { f0: 5000, f1: 3000, q: 0.5, decay: 0.45, pan: 0 });
  pad(music, titleHit, BAR, ["C4", "E4", "G4", "C5"].map(n), 0.09, 0);
}

// ---- the button: one last chord, and a bell on top
{
  kick(music, button, 0.45);
  ["C2", "C3"].forEach((note) => strike(music, button, midi(n(note)), 0.55, BASS, { length: 2.5 }));
  ["E4", "G4", "A4", "C5", "E5"].forEach((note) =>
    strike(music, button, midi(n(note)), 0.18, MARIMBA, { pan: 0.25, length: 2.5 }),
  );
  strike(music, button, midi(n("C6")), 0.16, BELL, { pan: 0.1, length: 3 });
  pad(music, button, total - button, ["C4", "E4", "G4", "A4"].map(n), 0.05, 0);
}

reverb(music, 0.9);
fs.mkdirSync(path.join(root, "public/music"), { recursive: true });
// -20dBFS RMS: a full, present bed on its own; the composition ducks it.
writeWav(path.join(root, "public/music/score.wav"), music, -20);
console.log(`score: ${total.toFixed(2)}s, ${bars} bars, button at ${button.toFixed(2)}s`);

// ================================================================= effects

const sfxDir = path.join(root, "public/sfx");
fs.mkdirSync(sfxDir, { recursive: true });
// Every effect at -14dBFS over its loudest 50ms — a touch hotter than the
// voice's -20dBFS average, so a cue's volume in the composition reads as its
// level against the narrator: 0.5 sits level with the voice, 1 punches above.
const effect = (name: string, seconds: number, draw: (s: Stereo) => void) => {
  const s = new Stereo(seconds);
  draw(s);
  writeWav(path.join(sfxDir, `${name}.wav`), s, -14, "loudest");
};

// A pop for anything that appears: a short upward blip.
effect("pop", 0.15, (s) => {
  let phase = 0;
  for (let k = 0; k < 0.12 * SR; k++) {
    const t = k / SR;
    phase += (2 * Math.PI * (380 + 900 * (1 - Math.exp(-t / 0.02)))) / SR;
    s.add(k, Math.sin(phase) * Math.exp(-t / 0.03) * Math.min(1, t / 0.001));
  }
});

// A whoosh for wipes: noise swept up and back down through a bandpass.
effect("whoosh", 0.6, (s) =>
  noiseHit(s, 0, 0.55, 1, { f0: 400, f1: 3200, q: 0.6, shape: (x) => Math.sin(Math.PI * x) ** 2 }),
);

// A stamp: a low thump with a papery slap on top.
effect("stamp", 0.4, (s) => {
  kick(s, 0, 1);
  noiseHit(s, 0, 0.12, 0.6, { f0: 1500, q: 0.8, decay: 0.03 });
});

// A ding for "you can make this".
effect("ding", 1.6, (s) => strike(s, 0, midi(n("E6")), 1, BELL, { length: 1.5 }));

// A tick for the reel and for keys being typed.
effect("tick", 0.04, (s) => noiseHit(s, 0, 0.035, 1, { f0: 5200, q: 1.4, decay: 0.006 }));

// A thock for a card or disc landing: wood, not plastic.
effect("thock", 0.2, (s) => strike(s, 0, 220, 1, MARIMBA, { length: 0.18 }));

// The sparkle for a reveal: a fast glockenspiel arpeggio.
effect("sparkle", 1.4, (s) =>
  ["G5", "C6", "E6", "G6"].forEach((note, i) => strike(s, i * 0.06, midi(n(note)), 0.8, GLOCK, { length: 1.2 })));

// A switch: two clicks, the second lower.
effect("switch", 0.12, (s) => {
  noiseHit(s, 0, 0.03, 1, { f0: 3800, q: 1.3, decay: 0.006 });
  noiseHit(s, 0.045, 0.03, 0.8, { f0: 2200, q: 1.3, decay: 0.008 });
});

console.log("effects:", fs.readdirSync(sfxDir).join(", "));
