/**
 * Lays the narration on a clock, then writes everything that hangs off it:
 *
 *   timeline.js     window.TL — scene windows, line windows and named beats,
 *                   which index.html's GSAP timeline reads
 *   index.html      the scene clips and every <audio> clip, stamped with times
 *   assets/music    the score, cut to the same clock and ducked under the voice
 *   assets/sfx      the sound effects, synthesised from nothing
 *
 * Same approach as the explainer (video/tools/music.mts, video/src/timeline.ts):
 * scene changes snap to the music's beat at 104 BPM, and a beat that lands
 * on a word is placed by that word's character offset inside its line.
 *
 *   node tools/build.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SR = 48000;

const lines = JSON.parse(fs.readFileSync(path.join(root, "narration.json"), "utf8"));
const TEXT = Object.fromEntries(lines.map((l) => [l.id, l.text]));
const durations = JSON.parse(fs.readFileSync(path.join(root, "narration-timing.json"), "utf8"));

// ================================================================= timeline

const BEAT = 60 / 104;
const BAR = BEAT * 4;

const PLAN = [
  { id: "open", lines: [["l01", 0.7]], tail: 0.5 },
  { id: "ingredients", lines: [["l02", 0.3]], tail: 1.2 },
  { id: "s1", lines: [["l03", 0.3]], tail: 0.6 },
  { id: "s2", lines: [["l04", 0.3]], tail: 1.0 },
  { id: "s3", lines: [["l05", 0.3]], tail: 0.6 },
  { id: "s4", lines: [["l06", 0.3]], tail: 1.0 },
  { id: "s5", lines: [["l07", 0.3]], tail: 2.0 },
  { id: "s6", lines: [["l08", 0.3]], tail: 0.8 },
  { id: "s7", lines: [["l09", 0.3]], tail: 1.2 },
  { id: "close", lines: [["l10", 1.3]], tail: 2.0 },
];

const scenes = {};
const L = {};
let clock = 0;
for (const s of PLAN) {
  const start = clock;
  let t = start;
  for (const [id, gap] of s.lines) {
    t += gap;
    L[id] = { start: +t.toFixed(3), end: +(t + durations[id]).toFixed(3) };
    t += durations[id];
  }
  const last = s === PLAN[PLAN.length - 1];
  const end = last ? t + s.tail : Math.ceil((t + s.tail) / BEAT) * BEAT;
  scenes[s.id] = { start: +start.toFixed(3), end: +end.toFixed(3) };
  clock = end;
}
const TOTAL = +clock.toFixed(3);

const at = (id, d = 0) => +(L[id].start + d).toFixed(3);
const end = (id, d = 0) => +(L[id].end + d).toFixed(3);
/** When a phrase inside a line is spoken, from its character offset. */
const ph = (id, phrase, d = 0) => {
  const i = TEXT[id].indexOf(phrase);
  if (i < 0) throw new Error(`"${phrase}" is not in ${id}`);
  return +(L[id].start + (L[id].end - L[id].start) * (i / TEXT[id].length) + d).toFixed(3);
};
const sc = (id, d = 0) => +(scenes[id].start + d).toFixed(3);
const sce = (id, d = 0) => +(scenes[id].end + d).toFixed(3);

// ---- named beats: every moment the picture or a sound effect hangs off
const B = {
  // the narrator: in with the first line, out as the close card's panel (him again) drops
  hostIn: sc("open", 0.35),
  hostOut: sc("close", 0.1),

  // open
  openEyebrow: sc("open", 0.4),
  openPlate: sc("open", 0.6),
  openHoney: ph("l01", "Honey"),
  openGarlic: ph("l01", "Garlic"),
  openChicken: ph("l01", "Chicken"),
  openSweet: ph("l01", "Sweet"),
  openSticky: ph("l01", "sticky"),
  openPot: ph("l01", "the pot does"),

  // ingredients — a fast deal, top to bottom
  ingWindow: sc("ingredients", 0.3),
  ingRows: Array.from({ length: 11 }, (_, i) => +(at("l02", 0.25) + i * 0.27).toFixed(3)),

  // step 1
  s1Drops: [ph("l03", "Honey"), ph("l03", "garlic"), ph("l03", "soy"), ph("l03", "ketchup"), ph("l03", "oregano"), ph("l03", "parsley")],
  s1Whisk: ph("l03", "Mix it"),
  s1Aside: ph("l03", "Yes, this one", 0.1),

  // step 2
  s2Saute: ph("l04", "Sauté mode"),
  s2Oil: ph("l04", "Sesame oil"),
  s2Hot: ph("l04", "Stand back"),

  // step 3
  s3Thighs: sc("s3", 0.2),
  s3Season: ph("l05", "Salt and pepper", 0.55),
  s3Brown: ph("l05", "then brown them"),
  s3Chip: ph("l05", "two to three"),
  s3Flip: ph("l05", "Don't poke", -0.25),

  // step 4
  s4Pour: ph("l06", "Pour in the sauce", -0.1),
  s4Lid: ph("l06", "Lock the lid", 0.05),
  s4Lock: ph("l06", "No peeking"),

  // step 5
  s5Poultry: ph("l07", "Poultry setting"),
  s5Twenty: ph("l07", "twenty minutes"),
  s5Count: ph("l07", "Go sit down"),
  s5Done: end("l07", 1.6),

  // step 6
  s6Off: sc("s6", 0.35),
  s6Steam: ph("l08", "Let the pressure"),
  s6Clock: ph("l08", "five minutes"),
  s6Denied: ph("l08", "Opening it early", 0.15),
  s6Ready: end("l08", 0.2),

  // step 7
  s7Plate: ph("l09", "Plate it"),
  s7Sauce: ph("l09", "sauce it"),
  s7Seeds: ph("l09", "sesame seeds"),
  s7Onions: ph("l09", "green onions"),
  s7Ranch: ph("l09", "Ranch"),
  s7Denied: ph("l09", "not invited"),
  s7Stamp: end("l09", 0.35),

  // close
  closePanel: sc("close", 0.35),
  closeTitle: sc("close", 0.55),
  closeSlam: at("l10", 0.05),
  closeCredit: end("l10", 0.5),

  // the host's asides, as speech bubbles: [scene, phrase start, text]
  quips: [
    ["open", ph("l01", "You take"), "You take the credit."],
    ["s1", ph("l03", "Yes, this one"), "Yes, this one gets a bowl."],
    ["s2", ph("l04", "Stand back"), "Stand back."],
    ["s3", ph("l05", "Don't poke"), "Don't poke them. We said what we said."],
    ["s4", ph("l06", "No peeking"), "No peeking."],
    ["s5", ph("l07", "Go sit down"), "Go sit down."],
    ["s6", ph("l08", "Opening it early"), "Opening it early is not on the menu."],
    ["s7", ph("l09", "Ranch"), "Ranch is not invited."],
  ],
};

// Each step's text arrives on its first word.
for (const [s, l] of [["s1", "l03"], ["s2", "l04"], ["s3", "l05"], ["s4", "l06"], ["s5", "l07"], ["s6", "l08"], ["s7", "l09"]]) {
  B[`${s}Pill`] = sc(s, 0.25);
  B[`${s}Head`] = sc(s, 0.35);
  B[`${s}Card`] = sc(s, 0.6);
}

// ---- sound effects: [beat time, effect, volume]. 0.5 sits level with the voice.
const SFX = [];
const cue = (t, name, vol = 0.5) => SFX.push([+t.toFixed(3), name, vol]);
for (const s of PLAN.slice(1)) cue(scenes[s.id].start - 0.32, "whoosh", 0.3);
cue(B.hostIn, "pop", 0.35);
cue(B.openPlate, "thock", 0.45);
[B.openHoney, B.openGarlic, B.openChicken].forEach((t) => cue(t, "stamp", 0.35));
[B.openSweet, B.openSticky, B.openPot].forEach((t) => cue(t, "pop", 0.28));
cue(B.ingWindow, "pop", 0.35);
B.ingRows.forEach((t) => cue(t, "tick", 0.4));
for (const s of ["s1", "s2", "s3", "s4", "s5", "s6", "s7"]) cue(B[`${s}Head`], "thock", 0.35);
B.quips.forEach(([, t]) => cue(t, "pop", 0.25));
B.s1Drops.forEach((t) => cue(t + 0.05, "plop", 0.35));
cue(B.s1Whisk, "whisk", 0.4);
cue(B.s1Aside, "stamp", 0.45);
cue(B.s2Saute, "beep", 0.32);
cue(B.s2Oil + 0.3, "plop", 0.32);
cue(B.s2Hot, "sizzle", 0.3);
[0, 0.12, 0.24, 0.36].forEach((d) => cue(B.s3Thighs + d, "thock", 0.32));
cue(B.s3Season, "shake", 0.38);
cue(B.s3Brown, "sizzle", 0.38);
cue(B.s3Chip, "pop", 0.28);
cue(B.s3Flip, "whoosh", 0.22);
cue(B.s4Pour, "pour", 0.38);
cue(B.s4Lid, "stamp", 0.5);
cue(B.s4Lock, "switch", 0.55);
cue(B.s5Poultry, "beep", 0.32);
cue(B.s5Twenty, "beep", 0.32);
cue(B.s5Done, "ding", 0.42);
cue(B.s6Off, "beep", 0.28);
cue(B.s6Steam, "steam", 0.32);
cue(B.s6Denied, "stamp", 0.5);
cue(B.s6Ready, "ding", 0.38);
cue(B.s7Plate, "thock", 0.42);
cue(B.s7Sauce, "pour", 0.28);
cue(B.s7Seeds, "sparkle", 0.28);
cue(B.s7Ranch, "pop", 0.3);
cue(B.s7Denied, "stamp", 0.5);
cue(B.s7Stamp, "stamp", 0.5);
cue(B.closePanel, "thock", 0.45);
cue(B.closeTitle, "pop", 0.3);
cue(B.closeSlam, "stamp", 0.6);

// ================================================================= synth
// The explainer's instruments (video/tools/music.mts), in plain JS.

class Stereo {
  constructor(seconds) {
    this.L = new Float32Array(Math.ceil(seconds * SR));
    this.R = new Float32Array(Math.ceil(seconds * SR));
  }
  get length() {
    return this.L.length;
  }
  add(i, v, pan = 0) {
    if (i < 0 || i >= this.L.length) return;
    const a = ((pan + 1) * Math.PI) / 4;
    this.L[i] += v * Math.cos(a);
    this.R[i] += v * Math.sin(a);
  }
}

let seed = 1234567;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2147483648 - 1;
};
const midi = (m) => 440 * 2 ** ((m - 69) / 12);
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const n = (name) => {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  return 12 * (Number(m[3]) + 1) + NOTE[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
};

function strike(out, t0, freq, amp, partials, opts = {}) {
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

const MARIMBA = [{ ratio: 1, amp: 1, decay: 0.42 }, { ratio: 3.93, amp: 0.2, decay: 0.07 }, { ratio: 9.2, amp: 0.05, decay: 0.02 }];
const BASS = [{ ratio: 1, amp: 1, decay: 0.34 }, { ratio: 2, amp: 0.35, decay: 0.2 }, { ratio: 3, amp: 0.12, decay: 0.12 }];
const GLOCK = [{ ratio: 1, amp: 1, decay: 0.9 }, { ratio: 2.76, amp: 0.3, decay: 0.25 }, { ratio: 5.4, amp: 0.12, decay: 0.08 }];
const BELL = [{ ratio: 1, amp: 1, decay: 0.7 }, { ratio: 2.0, amp: 0.45, decay: 0.45 }, { ratio: 3.01, amp: 0.25, decay: 0.2 }, { ratio: 4.2, amp: 0.12, decay: 0.12 }];

function pad(out, t0, dur, notes, amp, pan = -0.35) {
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

/** Noise through Simper's SVF bandpass, centre optionally sweeping (stable at any setting). */
function noiseHit(out, t0, dur, amp, opts) {
  const start = Math.round(t0 * SR);
  const count = Math.round(dur * SR);
  let ic1 = 0, ic2 = 0;
  const damping = opts.q ?? 0.7;
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
    const env = opts.shape ? opts.shape(x) : Math.min(1, t / (opts.attack ?? 0.002)) * Math.exp(-t / (opts.decay ?? 0.05));
    out.add(start + k, band * env * amp, opts.pan ?? 0);
  }
}

function kick(out, t0, amp) {
  const start = Math.round(t0 * SR);
  const count = Math.round(0.35 * SR);
  let phase = 0;
  for (let k = 0; k < count; k++) {
    const t = k / SR;
    phase += (2 * Math.PI * (48 + 70 * Math.exp(-t / 0.035))) / SR;
    out.add(start + k, Math.sin(phase) * Math.exp(-t / 0.13) * Math.min(1, t / 0.002) * amp);
  }
}

function reverb(dry, wet) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((d) => Math.round((d * SR) / 44100));
  const allpasses = [556, 441, 341, 225].map((d) => Math.round((d * SR) / 44100));
  const run = (input, spread) => {
    const out = new Float32Array(input.length);
    for (const d0 of combs) {
      const d = d0 + spread;
      const buf = new Float32Array(d);
      let idx = 0, store = 0;
      for (let i = 0; i < input.length; i++) {
        const y = buf[idx];
        store = y * 0.8 + store * 0.2;
        buf[idx] = input[i] * 0.015 + store * 0.8;
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
  const l = run(dry.L, 0);
  const r = run(dry.R, 23);
  for (let i = 0; i < dry.length; i++) {
    dry.L[i] += l[i] * wet;
    dry.R[i] += r[i] * wet;
  }
}

/** Levels by RMS (whole file, or the loudest 50ms for an effect) with a soft knee above -3dBFS. */
function writeWav(file, s, rmsDb, window = "whole") {
  let rms;
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
  const limit = (x) => {
    const a = Math.abs(x);
    if (a <= KNEE) return x;
    return Math.sign(x) * (KNEE + (1 - KNEE) * Math.tanh((a - KNEE) / (1 - KNEE)));
  };
  const data = Buffer.alloc(s.length * 4);
  for (let i = 0; i < s.length; i++) {
    data.writeInt16LE(Math.round(limit(s.L[i] * gain) * 32767), i * 4);
    data.writeInt16LE(Math.round(limit(s.R[i] * gain) * 32767), i * 4 + 2);
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

// The explainer's sitcom turnaround, I – VI7 – ii7 – V7 in C, a little lighter:
// a recipe is watched while doing something else, so no drums under the steps.
const GROOVE = [
  { tones: ["E4", "G4", "A4", "C5"], walk: ["C2", "E2", "G2", "G#2"] },
  { tones: ["E4", "G4", "C#5", "E5"], walk: ["A2", "C#3", "E2", "Eb2"] },
  { tones: ["F4", "A4", "C5", "D5"], walk: ["D2", "F2", "A2", "Ab2"] },
  { tones: ["F4", "B4", "D5", "F5"], walk: ["G2", "B2", "D2", "B1"] },
];
const SWING = 0.62;
const eighth = (beat, off) => (off ? beat + SWING : beat) * BEAT;
const COMP = [[0, true, 1], [1, true, 2], [2, false, 3], [2, true, 1], [3, true, 2]];

const button = Math.ceil((L.l10.end + 0.15) / BEAT) * BEAT;
const music = new Stereo(TOTAL + 0.5);
const bars = Math.ceil(button / BAR);
for (let b = 0; b < bars; b++) {
  const t = b * BAR;
  const chord = GROOVE[b % 4];
  const busy = t < scenes.s1.start - 0.01 || t >= scenes.close.start - 0.01;
  chord.walk.forEach((note, i) => {
    const t1 = t + i * BEAT;
    if (t1 < button - 0.01) strike(music, t1, midi(n(note)), 0.45, BASS, { length: BEAT * 1.1 });
  });
  for (const [beat, off, idx] of COMP) {
    const t1 = t + eighth(beat, off);
    if (t1 >= button - 0.01) continue;
    const tone = chord.tones[idx % chord.tones.length];
    strike(music, t1, midi(n(tone)), 0.2, MARIMBA, { pan: 0.3 });
    strike(music, t1, midi(n(tone) - 3), 0.08, MARIMBA, { pan: 0.3 });
  }
  pad(music, t, Math.min(BAR, button - t), chord.tones.map(n), 0.035);
  if (busy && b > 0) {
    for (let beat = 0; beat < 4; beat++) {
      const t1 = t + beat * BEAT;
      if (t1 >= button - 0.01) break;
      if (beat % 2 === 0) kick(music, t1, 0.28);
      else noiseHit(music, t1, 0.25, 0.2, { f0: 2400, q: 0.9, decay: 0.07, pan: -0.1 });
    }
  } else {
    // under the steps: just a soft shaker on the off-beats
    for (let beat = 0; beat < 4; beat++) {
      const t1 = t + eighth(beat, true);
      if (t1 < button - 0.01) noiseHit(music, t1, 0.06, 0.06, { f0: 7500, q: 1.2, decay: 0.018, pan: 0.45 });
    }
  }
}
// the button: one last chord with a bell on top, on the beat after "Down with hunger."
kick(music, button, 0.45);
["C2", "C3"].forEach((note) => strike(music, button, midi(n(note)), 0.5, BASS, { length: 2.5 }));
["E4", "G4", "A4", "C5", "E5"].forEach((note) => strike(music, button, midi(n(note)), 0.18, MARIMBA, { pan: 0.25, length: 2.5 }));
strike(music, button, midi(n("C6")), 0.16, BELL, { pan: 0.1, length: 3 });
pad(music, button, TOTAL - button, ["C4", "E4", "G4", "A4"].map(n), 0.05, 0);
reverb(music, 0.9);

// Duck the score under the voice: -14dB while a line plays, 120ms ramps.
{
  const DUCK = 10 ** (-14 / 20);
  const ramp = 0.12;
  const gainAt = (t) => {
    let g = 1;
    for (const { start, end: e } of Object.values(L)) {
      const k = t < start - ramp || t > e + ramp ? 0 : t < start ? (t - (start - ramp)) / ramp : t > e ? 1 - (t - e) / ramp : 1;
      g = Math.min(g, 1 - (1 - DUCK) * k);
    }
    return g;
  };
  for (let i = 0; i < music.length; i++) {
    const g = gainAt(i / SR);
    music.L[i] *= g;
    music.R[i] *= g;
  }
  // and fade the last two seconds to nothing
  const fadeFrom = Math.round((TOTAL - 2) * SR);
  for (let i = fadeFrom; i < music.length; i++) {
    const g = Math.max(0, 1 - (i - fadeFrom) / (2 * SR));
    music.L[i] *= g;
    music.R[i] *= g;
  }
}
fs.mkdirSync(path.join(root, "assets/music"), { recursive: true });
writeWav(path.join(root, "assets/music/score.wav"), music, -24);

// ================================================================= effects

const sfxDir = path.join(root, "assets/sfx");
fs.mkdirSync(sfxDir, { recursive: true });
const effect = (name, seconds, draw) => {
  const s = new Stereo(seconds);
  draw(s);
  writeWav(path.join(sfxDir, `${name}.wav`), s, -14, "loudest");
};

effect("pop", 0.15, (s) => {
  let phase = 0;
  for (let k = 0; k < 0.12 * SR; k++) {
    const t = k / SR;
    phase += (2 * Math.PI * (380 + 900 * (1 - Math.exp(-t / 0.02)))) / SR;
    s.add(k, Math.sin(phase) * Math.exp(-t / 0.03) * Math.min(1, t / 0.001));
  }
});
effect("whoosh", 0.6, (s) => noiseHit(s, 0, 0.55, 1, { f0: 400, f1: 3200, q: 0.6, shape: (x) => Math.sin(Math.PI * x) ** 2 }));
effect("stamp", 0.4, (s) => {
  kick(s, 0, 1);
  noiseHit(s, 0, 0.12, 0.6, { f0: 1500, q: 0.8, decay: 0.03 });
});
effect("ding", 1.6, (s) => strike(s, 0, midi(n("E6")), 1, BELL, { length: 1.5 }));
effect("tick", 0.04, (s) => noiseHit(s, 0, 0.035, 1, { f0: 5200, q: 1.4, decay: 0.006 }));
effect("thock", 0.2, (s) => strike(s, 0, 220, 1, MARIMBA, { length: 0.18 }));
effect("sparkle", 1.4, (s) =>
  ["G5", "C6", "E6", "G6"].forEach((note, i) => strike(s, i * 0.06, midi(n(note)), 0.8, GLOCK, { length: 1.2 })));
effect("switch", 0.12, (s) => {
  noiseHit(s, 0, 0.03, 1, { f0: 3800, q: 1.3, decay: 0.006 });
  noiseHit(s, 0.045, 0.03, 0.8, { f0: 2200, q: 1.3, decay: 0.008 });
});

// New for the kitchen:
// a plop — a falling sine bubble, for anything landing in liquid
effect("plop", 0.2, (s) => {
  let phase = 0;
  for (let k = 0; k < 0.16 * SR; k++) {
    const t = k / SR;
    phase += (2 * Math.PI * (300 + 700 * Math.exp(-t / 0.025))) / SR;
    s.add(k, Math.sin(phase) * Math.exp(-t / 0.04) * Math.min(1, t / 0.002));
  }
});
// a whisk — three quick bowl-scrapes
effect("whisk", 1.3, (s) => {
  for (let i = 0; i < 4; i++) noiseHit(s, i * 0.3, 0.26, 1, { f0: 2500, f1: 4200, q: 0.9, shape: (x) => Math.sin(Math.PI * x) ** 1.5, pan: i % 2 ? 0.3 : -0.3 });
});
// the Instant Pot's beep
effect("beep", 0.3, (s) => {
  for (let k = 0; k < 0.16 * SR; k++) {
    const t = k / SR;
    const env = Math.min(1, t / 0.004, (0.16 - t) / 0.01);
    s.add(k, (Math.sin(2 * Math.PI * 1760 * t) + 0.2 * Math.sin(2 * Math.PI * 3520 * t)) * env);
  }
});
// a shaker, salt and pepper
effect("shake", 1.0, (s) => {
  for (let i = 0; i < 6; i++) noiseHit(s, i * 0.15, 0.1, 1, { f0: 6000, q: 1.0, decay: 0.03, pan: i % 2 ? 0.25 : -0.25 });
});
// sizzle — crackle on a bed of hiss, faded at both ends
effect("sizzle", 1.8, (s) => {
  noiseHit(s, 0, 1.75, 0.5, { f0: 6500, q: 0.5, shape: (x) => Math.min(1, x * 8, (1 - x) * 3) });
  let r = 99;
  for (let i = 0; i < 70; i++) {
    r = (r * 1103515245 + 12345) >>> 0;
    const t = (r / 4294967296) * 1.6;
    noiseHit(s, t, 0.02, 1.2 * Math.min(1, (1.7 - t) * 2), { f0: 3000 + (r % 3000), q: 1.2, decay: 0.004 });
  }
});
// pour — a low, burbling stream
effect("pour", 1.3, (s) => {
  noiseHit(s, 0, 1.25, 1, { f0: 700, f1: 1100, q: 0.4, shape: (x) => Math.min(1, x * 6, (1 - x) * 4) * (0.7 + 0.3 * Math.sin(x * 60)) });
});
// steam — the pressure valve venting, a long hiss that tails off
effect("steam", 3.5, (s) => noiseHit(s, 0, 3.4, 1, { f0: 5000, f1: 3500, q: 0.6, shape: (x) => Math.min(1, x * 20) * (1 - x) ** 1.5 }));

// ================================================================= outputs

/** RMS of a mono 16-bit WAV, to set each line's gain to -20dBFS. */
function voGain(file) {
  const buf = fs.readFileSync(file);
  const dataAt = buf.indexOf("data", 12) + 8;
  const count = buf.readUInt32LE(dataAt - 4) / 2;
  let sum = 0;
  for (let i = 0; i < count; i++) sum += (buf.readInt16LE(dataAt + i * 2) / 32768) ** 2;
  const rms = Math.sqrt(sum / count);
  return Math.min(3.9, 10 ** (-20 / 20) / rms);
}

const sfxLen = (name) => {
  const buf = fs.readFileSync(path.join(sfxDir, `${name}.wav`));
  return buf.readUInt32LE(40) / 4 / SR;
};

/**
 * One <audio> per cue, de-duplicated (two beats can ask for the same effect on
 * the same frame) and packed greedily onto the fewest tracks that never overlap.
 */
function sfxClips() {
  const seen = new Set();
  const free = []; // per track, when it is next free
  return SFX.sort((a, b) => a[0] - b[0])
    .filter(([t, name]) => !seen.has(`${t}|${name}`) && seen.add(`${t}|${name}`))
    .map(([t, name, vol], i) => {
      const len = sfxLen(name);
      let track = free.findIndex((f) => f <= t);
      if (track < 0) track = free.push(0) - 1;
      free[track] = t + len + 0.01;
      return `<audio id="sfx-${i}" class="clip" src="assets/sfx/${name}.wav" data-start="${t}" data-duration="${len.toFixed(3)}" data-volume="${vol}" data-track-index="${12 + track}"></audio>`;
    });
}

const audio = [
  `<audio id="score" class="clip" src="assets/music/score.wav" data-start="0" data-duration="${TOTAL}" data-volume="1" data-track-index="10"></audio>`,
  ...lines.map(
    (l) =>
      `<audio id="vo-${l.id}" class="clip" src="assets/vo/${l.id}.wav" data-start="${L[l.id].start}" data-duration="${durations[l.id]}" data-volume="${voGain(path.join(root, "assets/vo", `${l.id}.wav`)).toFixed(2)}" data-track-index="11"></audio>`,
  ),
  ...sfxClips(),
];

fs.writeFileSync(
  path.join(root, "timeline.js"),
  `// Generated by tools/build.mjs — do not edit.\nwindow.TL = ${JSON.stringify({ total: TOTAL, scenes, lines: L, b: B }, null, 1)};\n`,
);

let html = fs.readFileSync(path.join(root, "tools/index.template.html"), "utf8");
html = html.replace(/data-scene="(\w+)"/g, (_, id) => {
  const s = scenes[id];
  if (!s) throw new Error(`No scene ${id}`);
  return `data-scene="${id}" data-start="${s.start}" data-duration="${(s.end - s.start).toFixed(3)}"`;
});
html = html.replace("{{TOTAL}}", String(TOTAL));
html = html.replace("<!-- AUDIO -->", audio.join("\n    "));

// The host talks for as long as he is on screen: the site's 5-second hero
// clip, laid end to end. Its mouth is moving in every frame, so no lip sync.
const host = [];
for (let t = B.hostIn; t < B.hostOut - 0.01; t += 5) {
  const d = Math.min(5, B.hostOut - t);
  host.push(`<video id="host-v${host.length}" class="clip host-video" src="assets/art/narrator.mp4" muted playsinline data-start="${t.toFixed(3)}" data-duration="${d.toFixed(3)}" data-media-start="0" data-track-index="2"></video>`);
}
html = html.replace("<!-- NARRATOR -->", host.join("\n          "));
fs.writeFileSync(path.join(root, "index.html"), html);

console.log(`total ${TOTAL.toFixed(2)}s, ${Object.keys(scenes).length} scenes, ${SFX.length} effects, button at ${button.toFixed(2)}s`);
for (const [id, s] of Object.entries(scenes)) console.log(`  ${id.padEnd(12)} ${s.start.toFixed(2)} – ${s.end.toFixed(2)}`);
