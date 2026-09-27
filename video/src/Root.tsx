import "./fonts";

import { Composition } from "remotion";

import { Explainer, timeline } from "./Explainer";
import { FPS } from "./timeline";

export function Root() {
  return (
    <Composition
      id="Explainer"
      component={Explainer}
      durationInFrames={Math.round(timeline.duration * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
}
