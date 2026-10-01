# Instant Pot Honey Garlic Chicken — walkthrough video

A one-minute recipe walkthrough built with [HyperFrames](https://www.npmjs.com/package/hyperframes)
(HTML + GSAP, rendered to MP4). It follows the explainer's Springfield Kitchen look — cream ground,
gold sunburst, yellow Luckiest Guy headlines with the ink keyline, sticker cards, yellow iris wipes —
and the same synthesised score and sound effects.

The host is the home page's protester: the site's 5-second hero clip (`public/down-with-hunger.mp4`,
copied to `assets/art/narrator.mp4`) looped in a disc, bottom left, with his asides in speech bubbles.
The narration borrows the Dueling Kebabs page's deadpan (bowls, ranch, "We said what we said").

**Not on the site yet.** Nothing in `src/` or `public/` points at it.

The ingredients and the card text on every step are the recipe's own, from the `recipes` and
`ingredients` tables (recipe `b80c3353-…`, source diethood.com).

## Rebuilding

```bash
cd video/recipes/honey-garlic-chicken
python3 tools/voice.py                 # narration → assets/vo + narration-timing.json (Kokoro, offline)
node tools/build.mjs                   # timeline.js, index.html, score, sound effects
npx hyperframes@0.8.106 lint
npx hyperframes@0.8.106 render -q high -f 30 -o out/honey-garlic-chicken-raw.mp4
ffmpeg -i out/honey-garlic-chicken-raw.mp4 -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:a aac -b:a 192k -movflags +faststart out/honey-garlic-chicken.mp4
```

`npx hyperframes preview` opens the studio for scrubbing.

- `narration.json` holds the words. The voice is Kokoro's `am_michael`, run locally
  (`pip install kokoro-onnx soundfile`, with `KOKORO_DIR` pointing at the v1.0 model files), because the
  explainer's Microsoft voice was not reachable from the build machine. Swap in `video/tools/voice.mjs`
  for a voice match with the explainer.
- `tools/build.mjs` lays the lines on the 104 BPM grid, names every beat (`TL.b`), and writes the
  audio clips into `index.html` from `tools/index.template.html`. Edit the template, never `index.html`.
- The score is ducked 14 dB under the voice when it is written, so the composition plays it flat.
