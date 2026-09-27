import { createContext, type ReactNode, useContext } from "react";
import { AbsoluteFill } from "remotion";

import { easePress, lin, p, phraseAt, useT } from "./anim";
import narration from "./narration.json";
import { C } from "./theme";
import type { TimedScene } from "./timeline";

const TEXT: Record<string, string> = Object.fromEntries(narration.map((l) => [l.id, l.text]));

type SceneApi = {
  /** Scene length in seconds. */
  dur: number;
  /** When a line starts, in scene time. */
  at: (id: string) => number;
  /** When a line ends, in scene time. */
  end: (id: string) => number;
  /** When a phrase inside a line starts, in scene time. */
  phrase: (id: string, phrase: string) => number;
};

const Ctx = createContext<SceneApi | null>(null);

export function useScene() {
  const api = useContext(Ctx);
  if (!api) throw new Error("useScene outside a scene");
  return api;
}

export function SceneProvider({ scene, children }: { scene: TimedScene; children: ReactNode }) {
  const line = (id: string) => {
    const l = scene.lines.find((x) => x.id === id);
    if (!l) throw new Error(`${id} is not in scene ${scene.id}`);
    return l;
  };
  const api: SceneApi = {
    dur: scene.end - scene.start,
    at: (id) => line(id).start - scene.start,
    end: (id) => line(id).end - scene.start,
    phrase: (id, phrase) => phraseAt(TEXT[id], phrase, line(id).start - scene.start, line(id).end - scene.start),
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/** How long the iris takes to close over the old scene, and to open on the new. */
export const WIPE_IN = 0.32;
export const WIPE_OUT = 0.42;
const COVER = 1250; // radius that covers 1920×1080 from anywhere near the middle

/**
 * Each scene opens through a widening iris onto a yellow ground, and closes
 * under a yellow disc that grows over it — so a cut is always yellow for a
 * frame or two, the brand colour, never a hard jump.
 *
 * The disc and the iris both carry the keyline: a cartoon wipe is drawn, not
 * a crossfade.
 */
export function SceneFrame({
  children,
  first = false,
  last = false,
  origin = [960, 540],
  exit = [960, 540],
}: {
  children: ReactNode;
  first?: boolean;
  last?: boolean;
  origin?: [number, number];
  exit?: [number, number];
}) {
  const t = useT();
  const { dur } = useScene();

  const open = first ? 1 : p(t, 0, WIPE_OUT, easePress);
  const r = open * COVER;
  const close = last ? 0 : lin(t, dur - WIPE_IN, WIPE_IN);
  const closeR = close ** 1.6 * COVER;

  return (
    <AbsoluteFill style={{ background: C.yellow, overflow: "hidden" }}>
      {/* isolation keeps any z-indexed layer inside a scene from climbing
          above the wipe that is meant to cover it. */}
      <AbsoluteFill
        style={{
          isolation: "isolate",
          clipPath: open < 1 ? `circle(${r}px at ${origin[0]}px ${origin[1]}px)` : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {open < 1 && <Ring x={origin[0]} y={origin[1]} r={r} />}
      {close > 0 && (
        <div
          style={{
            position: "absolute",
            left: exit[0] - closeR,
            top: exit[1] - closeR,
            width: closeR * 2,
            height: closeR * 2,
            borderRadius: "50%",
            background: C.yellow,
            border: `12px solid ${C.ink}`,
            boxSizing: "border-box",
          }}
        />
      )}
    </AbsoluteFill>
  );
}

function Ring({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - r - 6,
        top: y - r - 6,
        width: (r + 6) * 2,
        height: (r + 6) * 2,
        borderRadius: "50%",
        border: `12px solid ${C.ink}`,
        boxSizing: "border-box",
      }}
    />
  );
}
