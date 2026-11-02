/**
 * Narration in the user's own cloned voice, from the local Voice Studio app.
 *
 * Same contract as voice.mjs (one trimmed 48kHz WAV per line of
 * src/narration.json, plus a per-line duration table) but the audio comes from
 * Voice Studio's OpenAI-style endpoint and lands in out/vo-voicestudio/ instead
 * of public/vo/, so the shipped cut keeps its voice until the new one is approved.
 * Voice Studio must be running (backend on 127.0.0.1:3900).
 *
 *   node video/tools/voice-studio.mjs          regenerate every line
 *   node video/tools/voice-studio.mjs l05 l19  regenerate just these
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const ffmpeg = path.resolve(root, "../node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe");

const API = process.env.OMNIVOICE_URL ?? "http://127.0.0.1:3900";
const PROFILE = "Down With Hunger";
const SEED = 7;
// The clone's natural pace ran about 20% slower than the shipped narration; 1.2 brings the total back to roughly the old length.
const SPEED = Number(process.env.VS_SPEED ?? 1.2);

const lines = JSON.parse(fs.readFileSync(path.join(root, "src/narration.json"), "utf8"));
const only = new Set(process.argv.slice(2));
const outDir = path.join(root, "out/vo-voicestudio");
fs.mkdirSync(outDir, { recursive: true });

const timingPath = path.join(outDir, "narration-timing.json");
const timing = fs.existsSync(timingPath) ? JSON.parse(fs.readFileSync(timingPath, "utf8")) : {};
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vs-"));

const RATE_HZ = 48000;

/** Cuts silence off both ends (-50dBFS over 5ms windows), keeps 40ms of air, fades the edges 8ms. */
function trim(pcm) {
  const threshold = 32768 * 10 ** (-50 / 20);
  const win = RATE_HZ * 0.005;
  const loud = (i) => {
    let peak = 0;
    for (let j = i; j < Math.min(i + win, pcm.length); j++) peak = Math.max(peak, Math.abs(pcm[j]));
    return peak > threshold;
  };
  let start = 0;
  while (start < pcm.length && !loud(start)) start += win;
  let end = pcm.length - win;
  while (end > start && !loud(end)) end -= win;
  end += win;

  const pad = RATE_HZ * 0.04;
  const out = pcm.slice(Math.max(0, start - pad), Math.min(pcm.length, end + pad));
  const fade = RATE_HZ * 0.008;
  for (let i = 0; i < fade; i++) {
    out[i] = Math.round((out[i] * i) / fade);
    out[out.length - 1 - i] = Math.round((out[out.length - 1 - i] * i) / fade);
  }
  return out;
}

function wavFile(samples) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + samples.length * 2, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE_HZ, 24);
  header.writeUInt32LE(RATE_HZ * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(samples.length * 2, 40);
  return Buffer.concat([header, Buffer.from(samples.buffer, samples.byteOffset, samples.length * 2)]);
}

for (const line of lines) {
  if (only.size && !only.has(line.id)) continue;

  const res = await fetch(`${API}/v1/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "omnivoice",
      input: line.text,
      voice: PROFILE,
      response_format: "wav",
      language: "en",
      seed: SEED,
      speed: SPEED,
    }),
  });
  if (!res.ok) throw new Error(`${line.id}: HTTP ${res.status} ${await res.text()}`);

  const raw = path.join(tmp, `${line.id}.wav`);
  fs.writeFileSync(raw, Buffer.from(await res.arrayBuffer()));

  // Resampled to 48k mono first; the data chunk is found by name because ffmpeg may write a LIST chunk ahead of it.
  const decoded = path.join(tmp, `${line.id}.48k.wav`);
  execFileSync(ffmpeg, ["-y", "-v", "error", "-i", raw, "-af", "aresample=48000", "-ac", "1", "-c:a", "pcm_s16le", decoded]);
  const file = fs.readFileSync(decoded);
  const at = file.indexOf("data", 12) + 8;
  const body = file.subarray(at, at + file.readUInt32LE(at - 4));
  const pcm = new Int16Array(body.buffer.slice(body.byteOffset, body.byteOffset + body.length));
  const clip = trim(pcm);
  fs.writeFileSync(path.join(outDir, `${line.id}.wav`), wavFile(clip));

  timing[line.id] = Math.round((clip.length / RATE_HZ) * 1000) / 1000;
  console.log(line.id, timing[line.id].toFixed(2) + "s", line.text);
}

fs.writeFileSync(timingPath, JSON.stringify(timing, null, 2) + "\n");
fs.rmSync(tmp, { recursive: true, force: true });
