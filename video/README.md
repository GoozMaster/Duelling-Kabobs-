# The explainer video

The two-minute tour embedded on the home page (`src/components/home/explainer-video.tsx`),
built entirely in code: [Remotion](https://www.remotion.dev) for the picture, Microsoft's
neural TTS for the narrator, and a small synthesiser for the score and sound effects.
Nothing is sampled, licensed or hand-edited, so any part can be changed and rebuilt.

`script.md` is the script and shot list. Every number and result on screen is real data,
pulled from the database and run through the site's own matcher on 2026-09-26.

## Rebuilding

```bash
npm run video:assets    # copy the logo artwork into video/public/art
npm run video:voice     # narration → video/public/vo/*.wav + src/narration-timing.json
npm run video:music     # score + sound effects, cut to the narration's timing
npm run video:captions  # public/video/explainer.vtt
npm run video:render    # → video/out/explainer-raw.mp4 (about 5 minutes)
npm run video:finish    # loudness to -16 LUFS, faststart, poster → public/video/
```

`npm run video:studio` opens Remotion Studio to scrub the timeline while editing.
`node video/tools/stills.mjs <dir> <seconds...>` renders proof frames without a full render.

Only the last three outputs are committed (`public/video/`). Everything under `video/public/`
except the fonts, and all of `video/out/`, is generated and git-ignored.

## How it fits together

- **`src/narration.json`** is the one source of the words. Each line is voiced on its own,
  and trimmed to the millisecond, so the picture can hang animation off the moment a line
  starts. To change a line: edit it, then `video:voice <id>`, and everything downstream
  moves with it.
- **`src/timeline.ts`** lays the lines end to end with per-line gaps and snaps every scene
  change to the music's half-bar. The composition, the score and the captions all call it,
  so they cannot drift apart.
- **`src/scenes/*.tsx`** are the ten scenes. Inside one, `useScene().phrase(id, "words")`
  gives the moment a phrase is spoken, which is how beats land on words.
- **Design** follows Springfield Kitchen: `theme.ts` copies the `--sk-*` tokens, `anim.ts`
  is motion.md's easing and squash rules, and the two cooks in `art.tsx` are the site's
  `DuelStill` artwork, path for path. The globe uses `src/lib/cuisine-geography.ts` directly.
- **Mix**: narration averages -20 dBFS; the score is levelled to -20 dBFS RMS and ducked to
  about 17 dB under the voice while it speaks; each effect is levelled on its loudest 50 ms.

## When the site changes

The recipe count (126), pantry count (256), cuisine counts and the "pineapple juice" results
are baked into the scenes as they were on 2026-09-26. The narration itself avoids exact
numbers, so a new recipe only dates a few on-screen figures — update them in
`scenes/list.tsx`, `menu.tsx`, `pantry.tsx`, `search.tsx` and `surprise.tsx`, then
render and finish again.

Remotion is free for individuals and companies of up to three people; see its licence
if that ever changes.
