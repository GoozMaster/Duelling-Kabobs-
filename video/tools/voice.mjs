/**
 * Narration: one clip per line of video/src/narration.json.
 *
 * Each line is synthesised on its own rather than as one long read, so the
 * video can place every line on its own frame and hang animation beats off the
 * moment it starts. The cost is some cross-sentence prosody; the gaps between
 * lines are set in the composition instead, where they can be tuned per scene.
 *
 * The service returns MP3 with a variable pad of silence at both ends. That pad
 * is trimmed here, so a clip's duration is the speech and nothing else — the
 * composition lays lines end to end from these numbers, and 150ms of invisible
 * silence per line would drift the picture off the voice by four seconds.
 *
 *   node video/tools/voice.mjs          regenerate every line
 *   node video/tools/voice.mjs l05 l19  regenerate just these
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const bin = path.resolve(root, "../node_modules/@remotion/compositor-win32-x64-msvc");
const ffmpeg = path.join(bin, "ffmpeg.exe");


const VOICE = "en-US-AndrewMultilingualNeural";
// A touch under the voice's natural pace: an explainer is listened to once, by
// someone also watching, and the deadpan lands better unhurried.
const RATE = "-6%";

const lines = JSON.parse(fs.readFileSync(path.join(root, "src/narration.json"), "utf8"));
const only = new Set(process.argv.slice(2));
const outDir = path.join(root, "public/vo");
fs.mkdirSync(outDir, { recursive: true });

const timingPath = path.join(root, "src/narration-timing.json");
const timing = fs.existsSync(timingPath) ? JSON.parse(fs.readFileSync(timingPath, "utf8")) : {};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "vo-"));

const RATE_HZ = 48000;

/**
 * Cuts the silence off both ends, keeping 40ms of air so soft consonants are
 * not clipped, then fades the cut edges over 8ms so neither end clicks.
 * "Silence" is -50dBFS measured over 5ms windows, not single samples, so one
 * stray sample of noise cannot hold the door open.
 */
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
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
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

  const tts = new MsEdgeTTS();
  await tts.setMetadata(VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const dir = path.join(tmp, line.id);
  fs.mkdirSync(dir);
  const { audioFilePath } = await tts.toFile(dir, line.text, { rate: RATE });
  tts.close();

  // Decoded to raw PCM and trimmed here: the ffmpeg that ships with Remotion is
  // a minimal build with no silenceremove, but it can resample.
  // No raw s16le muxer either, so it goes through a WAV and the data chunk is
  // found by name — ffmpeg may write a LIST chunk ahead of it.
  const decoded = path.join(dir, "decoded.wav");
  execFileSync(ffmpeg, [
    "-y", "-v", "error", "-i", audioFilePath,
    "-af", "aresample=48000", "-ac", "1", "-c:a", "pcm_s16le", decoded,
  ]);
  const file = fs.readFileSync(decoded);
  const at = file.indexOf("data", 12) + 8;
  const raw = file.subarray(at, at + file.readUInt32LE(at - 4));
  const pcm = new Int16Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length));
  const clip = trim(pcm);
  fs.writeFileSync(path.join(outDir, `${line.id}.wav`), wavFile(clip));

  timing[line.id] = Math.round((clip.length / RATE_HZ) * 1000) / 1000;
  console.log(line.id, timing[line.id].toFixed(2) + "s", line.text);
}

fs.writeFileSync(timingPath, JSON.stringify(timing, null, 2) + "\n");
fs.rmSync(tmp, { recursive: true, force: true });
