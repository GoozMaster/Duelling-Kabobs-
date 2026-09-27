import type { ComponentType } from "react";
import { AbsoluteFill, Html5Audio, Sequence, staticFile } from "remotion";

import timing from "./narration-timing.json";
import { SceneFrame, SceneProvider, WIPE_IN } from "./scene";
import { Close } from "./scenes/close";
import { Idea } from "./scenes/idea";
import { List } from "./scenes/list";
import { Menu } from "./scenes/menu";
import { Open } from "./scenes/open";
import { Pantry } from "./scenes/pantry";
import { Problem } from "./scenes/problem";
import { Search } from "./scenes/search";
import { Shop } from "./scenes/shop";
import { Surprise } from "./scenes/surprise";
import { C } from "./theme";
import { buildTimeline, FPS, type Timeline } from "./timeline";
import { Sfx } from "./ui";

export const timeline = buildTimeline(timing);

type Entry = { Comp: ComponentType; origin?: [number, number]; exit?: [number, number] };

// Where each scene's iris opens and the previous one's disc closes: on the
// thing the eye should land on next, so the wipe points somewhere.
const SCENES: Record<string, Entry> = {
  open: { Comp: Open, exit: [960, 520] },
  list: { Comp: List, origin: [960, 520], exit: [1300, 200] },
  problem: { Comp: Problem, origin: [960, 560], exit: [960, 600] },
  idea: { Comp: Idea, origin: [960, 700], exit: [960, 540] },
  menu: { Comp: Menu, origin: [960, 540], exit: [1300, 560] },
  pantry: { Comp: Pantry, origin: [960, 560], exit: [960, 560] },
  search: { Comp: Search, origin: [960, 400], exit: [1200, 600] },
  shop: { Comp: Shop, origin: [700, 500], exit: [960, 560] },
  surprise: { Comp: Surprise, origin: [960, 560], exit: [960, 540] },
  close: { Comp: Close, origin: [960, 540] },
};

const f = (seconds: number) => Math.round(seconds * FPS);

/**
 * The music sits well under the voice and comes up between lines. Levels are
 * against the narrator's -20dBFS average: the bed (itself -20dBFS RMS) drops to
 * about -37 under speech — 17dB down, clear of every consonant — and rises to
 * about -27 between lines, where it carries the picture. A line ducks
 * it 150ms before it starts and lets it back up over half a second after — a
 * fast release pumps audibly, which is the one thing a bed must never do.
 */
function musicVolume(seconds: number, tl: Timeline) {
  const UP = 0.42;
  const UNDER = 0.14;
  let duck = 0;
  for (const line of Object.values(tl.lines)) {
    const attack = Math.min(1, Math.max(0, (seconds - (line.start - 0.15)) / 0.15));
    const release = Math.min(1, Math.max(0, 1 - (seconds - line.end) / 0.5));
    duck = Math.max(duck, Math.min(attack, release));
  }
  const fadeIn = Math.min(1, seconds / 0.4);
  return fadeIn * (UP + (UNDER - UP) * duck);
}

export function Explainer() {
  const tl = timeline;
  return (
    <AbsoluteFill style={{ background: C.surface }}>
      <Html5Audio src={staticFile("music/score.wav")} volume={(frame) => musicVolume(frame / FPS, tl)} />

      {Object.values(tl.lines).map((line) => (
        <Sequence key={line.id} from={f(line.start)} layout="none">
          <Html5Audio src={staticFile(`vo/${line.id}.wav`)} />
        </Sequence>
      ))}

      {tl.scenes.map((scene, i) => {
        const { Comp, origin, exit } = SCENES[scene.id];
        return (
          <Sequence key={scene.id} from={f(scene.start)} durationInFrames={f(scene.end) - f(scene.start)} name={scene.id}>
            <SceneProvider scene={scene}>
              <SceneFrame first={i === 0} last={i === tl.scenes.length - 1} origin={origin} exit={exit}>
                <Comp />
              </SceneFrame>
            </SceneProvider>
          </Sequence>
        );
      })}

      {tl.scenes.slice(1).map((scene) => (
        <Sequence key={scene.id} from={f(scene.start - WIPE_IN - 0.08)} layout="none">
          <Sfx at={0} name="whoosh" volume={0.3} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
