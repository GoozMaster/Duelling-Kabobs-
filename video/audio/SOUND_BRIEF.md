# SOUND BRIEF: Down With Hunger explainer soundtrack from professional recordings

The picture is final: `video/out/explainer-raw.mp4` (its current audio is the old synthesised mix; ignore it),
139.62 s, 30 fps, cut on a 104 BPM grid (1 beat = 0.5769 s, 1 bar = 2.3077 s; every scene change sits on a half-bar).
Cue events: `video/out/cues.json` (written by `video/tools/cues.mts` from the picture code; never re-time them by
hand). The sound project root is `video/`: every path below is relative to it.

The soundtrack uses ONLY real, professionally recorded or professionally produced audio from licensed libraries:
- one licensed music track, edited to the picture at bar lines;
- real foley and SFX recordings placed on the picture's cues;
- the existing narration (`public/vo/l01..l26.wav`, the project's own voice-over) placed on its line times. It is not
  sourced, audited or replaced.

Code may only select, trim, place, level, pan, EQ, crossfade, time-stretch the music (small ratios), pitch by
resampling and master these recordings. Code never generates a tone, a noise or a "sound". The bar: a polished
animated-sitcom title sequence crossed with a premium product explainer: playful, tactile, confident, every sound
caused by something on screen. Not a game jam, not a cartoon sound-effects library dump.

## The film
A two-minute tour of Down With Hunger, a family recipe site. The look is Springfield Kitchen: flat cartoon drawing,
thick ink keylines, sunburst rays, a yellow ground, cream paper, rubber stamps, sticky notes. A deadpan, warm male
narrator speaks almost continuously; the sound design sits around him and must never mask a consonant.

## Sound concept
- **One kitchen palette.** Everything that lands, stamps or pops is a real kitchen or desk object, close-miked and
  dry: wooden spoon / chopping board knocks for things landing, a real rubber stamp (or a firm palm slap on a wooden
  table) for stamps, a cork or a jar lid for pops, a real hotel/service counter bell for "you can make this". One
  family of materials: wood, paper, glass jars, one brass bell.
- **One interface voice.** The site's own controls (a search panel opening, a toggle flipping, a chip being added)
  use one real click/switch family: a light plastic switch or a mouse click, press + release.
- **One music track carries the film.** A playful, swung sitcom-style instrumental: walking or plucked bass, marimba
  / vibraphone / pizzicato, brushed or light drums, major key. Arc: a light intro under the cold open (no heavy
  drums), the groove under the list, a thinner, worried breakdown under "the problem" (28.8-38.1 s), a rebuild under
  "the idea" (38.1-45.9 s), the DROP / full band on the title "This is Down With Hunger" at **45.89 s**, an even groove
  under the feature tour (49.6-130.4 s) that sits low under the voice, and a resolved button ending: the last chord on
  the brick placard slam at **134.53 s**, ringing to silence by 139.6 s. Instrumental only.
- **Restraint.** The old mix sounded 160 events; this one sounds about 70-80 (about 5 per 10 s). Long runs (bubbles,
  jars, cards dealt, the reel) get a thinned, climbing run, not one sound per frame. The music carries the scene wipes.
- **Places.** No ambience: the picture is a drawn, abstract stage. (The amb bus is used for the narration.)

## Picture map (film seconds; cue ids from `video/out/cues.json`, `<scene>:<old effect>:<n>`)
| t (s) | on screen | cues | sound need |
|---|---|---|---|
| 0.55 | the title card drops onto the empty stage | land / open:thock:0 | one soft wooden knock |
| 1.80-4.44 | six cards flip over in turn | tick / open:tick:0-5 | light paper/card flicks (a card being flipped on a table), climbing |
| 5.52 | the first speech bubble "What's for dinner?" pops | pop / open:pop:0 | a clear cork / mouth pop |
| 5.94-6.50 | eight more bubbles fill the screen | pop / open:pop:1-8 | a quick run of smaller pops, climbing, thinned to 4-5 |
| 7.68, every scene change | the yellow iris wipe | whoosh / *:whoosh:n (14 total) | NOTHING on most wipes (the music carries cuts). At most 2-3 real cloth/stick swishes in the film: the iris into "the idea" (37.68) and into "the close" (129.98) |
| 8.78 | the notepad drops in with a bounce | land / list:thock:0 | wooden knock, a little heavier |
| 12.7-17.8 | handwritten lines appear | pop / list:pop:0-3 | soft pencil/pen tick or nothing (prefer a real pen tap or short pencil stroke) |
| 19.6-22.9 | recipe titles stamp onto the page: Pad Thai, Bolognese, Chicken Shawarma, French Onion Soup | land / list:thock:1-4 | four real rubber stamps on paper, the same stamp, slight variation |
| 25.15 | a counter rolls up to 126 | pop / list:pop:4 | one crisp tick on the final value |
| 26.49 | "It still does": the scroll sparkles | swell / list:sparkle:0 | a soft real chime (small bell, celesta-like glass) or nothing |
| 29.30 | the fridge slides in, doors shut | land / problem:thock:0 | a real fridge-door thunk (soft, rubber seal) |
| 29.8-30.1 | three question marks pop | pop / problem:pop:0-2 | three small pops |
| 32.99 | the fridge door opens | whoosh / problem:whoosh:0 | a real fridge door opening (seal unsticking) instead of a whoosh |
| 36.16 | a lone lemon gets an OUT stamp | hit / problem:stamp:0 | the rubber stamp, firm |
| 38.58 | a pot drops onto a burner | land / idea:thock:0 | a real metal pot set down on a hob (clank, short) |
| 40.6-44.5 | a fork, a grin, a table setting drop into the pot | pop + land / idea:pop:n, idea:thock:1-3 | each drop: a small real plop / clink into the pot (fork = metal clink) |
| **45.89** | **the pot bursts; the title "Down With Hunger" arrives** | swell / idea:sparkle:0 | **the music's DROP on the frame**; optionally one real impact (a big drum hit or a pot-lid crash, short top) |
| 46.22, 46.52 | the protester panel lands with a stamp; the wordmark slams in | hit / idea:stamp:0-1 | two heavy real stamps / table slams under the drop |
| 49.9 | the menu window pops up | pop / menu:pop:0 | soft pop |
| 50.4-50.8 | eight recipe cards are dealt onto a grid | tick / menu:tick:0-7 | a real card-deal riffle (playing cards dealt), thinned to 4 |
| 55.55 | a cuisine chip toggles | click / menu:switch:0 | the interface click |
| 56.82 | the globe spins | whoosh / menu:whoosh:0 | nothing, or a soft spin (a real globe/lazy-susan spin) |
| 58.34, 58.54 | a pin drops on the map; its label pops | land + pop / menu:thock:1, menu:pop:1 | a small push-pin tap |
| 63.6-63.9 | the pantry shelves open | whoosh + swell / pantry:whoosh:0, pantry:sparkle:0 | a real cupboard door opening, or nothing |
| 65.1-68.0 | jars drop onto three shelves (21 ticks, 5 pops) | tick / pantry:tick:n, pop / pantry:pop:n | real glass jars set down on a wooden shelf: thinned to ~8, climbing per shelf |
| 70.55 | the counter reaches 256 | pop / pantry:pop:4 | one crisp tick |
| 75.79 | a big "ON HAND" check stamp lands | hit / pantry:stamp:0 | the rubber stamp, firm |
| 81.75 | the "What can I make?" search panel opens | click / search:switch:0 | the interface click |
| 85.98-86.75 | "pineapple juice" types into the field | tick / search:tick:0-7 | a real laptop keyboard, one key per sounded character, quiet |
| 87.21 | a yellow chip appears | click + pop / search:switch:1, search:pop:1 | the interface click |
| 88.80 | "4 you can cook right now" | bell / search:ding:0 | the real service bell, light |
| 90.07 | Teriyaki Chicken lands first with a green tag | hit / search:stamp:0 | a lighter stamp |
| 90.99, 94.33 | results / near misses highlight | tick / search:tick:8-9 | nothing or one soft tick each |
| 98.81 | "No account needed" stamp | hit / search:stamp:1 | the rubber stamp |
| 99.9-100.6 | the visitor prompt types three words | pop / search:pop:2-4 | three soft keys |
| 105.35 | the recipe page pops up | pop / shop:pop:0 | soft pop |
| 110.03 | "Can I cook this?" switch flips | click / shop:switch:0 | the interface switch, clearly a toggle |
| 112.2-113.8 | ingredient rows colour in one by one | tick / shop:tick:0-7 | soft ticks, thinned to 4-5 |
| 116.94-118.75 | two lemon rows fly into a sticky note "1 lemon"; done | pop, whoosh, land, hit, bell / shop:* | a paper sticky note slapped on (paper slap), then the service bell once |
| 121.50 | the "Surprise me" button | pop / surprise:pop:0 | soft pop |
| 123.89 | the button is pressed | click / surprise:switch:0 | the interface click, firm |
| 124.5-127.3 | a slot reel spins through titles and slows | tick / surprise:tick:n (21) | a real ratchet / prize-wheel clicker slowing down (one recording, or sliced clicks thinning out) |
| 128.59-128.74 | the reel lands on a dish | bell + swell | the service bell, bright |
| 130.98-131.45 | close: hero art and wordmark land | land / close:thock:0-2 | two or three soft wooden knocks |
| 132.58 | the lede pops | pop / close:pop:0 | soft pop |
| **134.53** | **the brick placard "Down with hunger." slams on; end card** | hit / close:stamp:0 | the heaviest real stamp/slam; **the music's last chord on this frame**, ring to silence by 139.6 |

Narration line times (film s): l01 1.3 · l02 5.5 · l03 8.6 · l04 11.9 · l05 19.6 · l06 24.9 · l07 29.3 · l08 31.9 ·
l09 38.5 · l10 40.6 · l11 45.9 · l12 50.1 · l13 53.7 · l14 61.7 · l15 65.0 · l16 75.4 · l17 80.1 · l18 83.5 · l19 89.0 ·
l20 97.8 · l21 105.5 · l22 112.2 · l23 115.8 · l24 121.7 · l25 131.2 · l26 134.4 (exact frames in cues.json `lines`).
The voice runs most of the film: effects under speech must be short and kept out of 1-4 kHz where possible.

## Licences: what is allowed
Allowed (record each in the manifest, read on the item's own page): CC0 1.0 and public domain; CC BY 3.0 / 4.0
(credits in CREDITS.md and the site's credits, never required on screen); Mixkit Sound Effects / Stock Music Free
License (read the current text at https://mixkit.co/license/); Pixabay Content License (manual download only: list
Pixabay items for the user, never script them).
NOT allowed: NonCommercial (BY-NC), NoDerivatives (BY-ND), ShareAlike (BY-SA), Sampling+, "personal use only", custom
or unclear licences, disputed licences, YouTube rips, anything behind a login or paywall, AI-generated or
code-synthesized audio. Never fabricate a licence. Details: `<skill>/references/licences.md`.

## Quality bar
- SFX / foley: real recordings, close and clean. Prefer lossless WAV/FLAC (Mixkit WAV
  `assets.mixkit.co/active_storage/sfx/<id>/<id>.wav`) or Freesound's HQ preview
  (`cdn.freesound.org/previews/<id//1000>/<id>_<userid>-hq.ogg`). No clipping, floor under -55 dBFS between events,
  95 % rolloff above 12 kHz, no untreated room on foley, no voices / handling noise / background events.
- earshot: `realness` verdict "real or pro-produced" for every file used; `match` z >= 2.5 for the need it fills.
- Avoid cartoon-library clichés (slide whistles, boings, honks, cartoon "pops" made with a synth): the humour is in
  the picture and the narrator, the sound is real and clean.
- Music: professionally produced and mastered, full bandwidth, instrumental, steady tempo, 4/4, swung or straight
  ~98-110 BPM (or ~49-55 / ~196-220 half/double), so that a stretch to 104 BPM stays within 6 %. Ideally its structure
  has a light intro, a groove, a sparse breakdown, a full-band section and a clear button ending. Avoid: vocals,
  corporate ukulele + whistling, EDM, lo-fi hiss, trailer music, anything that imitates a famous TV theme, famous
  overused stock tracks.
- Mix: -16 LUFS integrated (matches the site's previous master and its quiet autoplay context), true peak <= -1 dBTP
  after AAC, the loudest moment on the drop (45.9 s), the end card 8-20 dB under it, a tail into silence.

## Files, manifests, tools
- Downloads: `audio/assets/<category>/` (audio files only; never a zip with programs; never run anything downloaded;
  git-ignored, never commit or publish them). Name: `<source>-<id>_<short-slug>.<ext>`.
- Manifests: `audio/assets/manifests/<category>.json`, a list of entries shaped like
  `<skill>/templates/manifest_entry.json`.
- Audit: `audio/assets/manifests/audit.json` + `audit.py`.
- Design: `audio/sounddesign.json` (lead) + `audio/design/<category>.json` (one designer each).
- Review output: `out/audio-review/<category or critic>/`. QA: `out/qa/`.
- Python: `C:/Users/Neema/.claude/repos/earshot/.venv/Scripts/python.exe` (has earshot, numpy, scipy, soundfile; the
  models are cached). Never bare `python` (the Microsoft Store stub).
- Be polite to the sites: sequential downloads, a pause between requests, at most ~40 files per category.
