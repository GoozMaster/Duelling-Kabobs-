import { Img, staticFile } from "remotion";

import { bob, drop, pop, useT, wobble } from "../anim";
import { useScene } from "../scene";
import { C, DISPLAY, KEY, POP, STICKER } from "../theme";
import { Ground, Headline, label, Sfx, Sunburst, text } from "../ui";

const PANEL = { x: 1150, y: 220, size: 460 };

/**
 * The end card is the home page's own hero, so the video finishes where the
 * viewer already is: kicker, wordmark, lede, the two calls to action, and the
 * Down with Hunger panel — whose placard lands on the last line.
 */
export function Close() {
  const t = useT();
  const { at, phrase } = useScene();

  const wordmark = at("l25");
  const lede = phrase("l25", "Every dish");
  const placard = at("l26") + 0.1;

  return (
    <Ground>
      <Sunburst speed={6} x={PANEL.x + PANEL.size / 2} y={PANEL.y + PANEL.size / 2} size={3000} />

      <div style={{ position: "absolute", left: 150, top: 230, width: 900 }}>
        <div style={{ transform: `scale(${pop(t, 0.35)})`, transformOrigin: "0% 50%" }}>
          <span
            style={{
              ...label(26, C.teal),
              display: "inline-block",
              background: C.tealSoft,
              border: `${KEY}px solid ${C.ink}`,
              borderRadius: 999,
              padding: "8px 26px",
            }}
          >
            No shopping list required
          </span>
        </div>
        <div style={{ marginTop: 34 }}>
          {["DUELING", "KEBABS"].map((word, i) => (
            <div key={word} style={{ transform: `scale(${slam(t, wordmark + 0.05 + i * 0.22)})`, transformOrigin: "0% 60%" }}>
              <Headline size={200} style={{ lineHeight: 0.95 }}>
                {word}
              </Headline>
            </div>
          ))}
        </div>
        <div style={{ ...text(46, 500, C.muted), marginTop: 36, transform: `scale(${pop(t, lede)})`, transformOrigin: "0% 50%" }}>
          Every dish worth cooking, one menu away.
        </div>
        <div style={{ display: "flex", gap: 26, marginTop: 50, transform: `scale(${pop(t, lede + 0.9)})`, transformOrigin: "0% 50%" }}>
          <span style={button(true)}>Open the fridge</span>
          <span style={button(false)}>See a recipe</span>
        </div>
      </div>
      <Sfx at={wordmark + 0.05} name="thock" volume={0.5} />
      <Sfx at={wordmark + 0.27} name="thock" volume={0.5} />
      <Sfx at={lede + 0.9} name="pop" volume={0.35} />

      {/* the hero panel: a square scene, so radius-lg on its own sand ground */}
      <div
        style={{
          position: "absolute",
          left: PANEL.x,
          top: PANEL.y,
          width: PANEL.size,
          height: PANEL.size,
          transformOrigin: "50% 100%",
          transform: `${drop(t, 0.6, 900)} translateY(${bob(t, 3.6, 9)}px)`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 44,
            border: `9px solid ${C.ink}`,
            boxShadow: POP,
            overflow: "hidden",
            background: C.sand,
          }}
        >
          <Img src={staticFile("art/down-with-hunger.png")} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        {t > placard - 0.14 && (
          <div
            style={{
              position: "absolute",
              left: -50,
              bottom: -44,
              transform: `rotate(-3deg) scale(${slam(t, placard)})`,
              transformOrigin: "30% 50%",
              background: C.brick,
              color: C.raised,
              border: `${KEY}px solid ${C.ink}`,
              borderRadius: 16,
              padding: "16px 30px 10px",
              fontFamily: DISPLAY,
              fontSize: 54,
              letterSpacing: "0.02em",
              boxShadow: STICKER,
              whiteSpace: "nowrap",
            }}
          >
            DOWN WITH HUNGER
          </div>
        )}
      </div>
      <Sfx at={0.6} name="thock" volume={0.6} />
      <Sfx at={placard} name="stamp" volume={1} />
    </Ground>
  );
}

function slam(t: number, at: number) {
  if (t < at - 0.14) return 0;
  if (t < at) return 2.4 - 1.4 * ((t - (at - 0.14)) / 0.14);
  return 1 + wobble(t, at, 0.07);
}

const button = (primary: boolean) => ({
  ...label(32),
  padding: "22px 38px",
  border: `${KEY}px solid ${C.ink}`,
  borderRadius: 26,
  background: primary ? C.yellow : C.raised,
  boxShadow: STICKER,
});
