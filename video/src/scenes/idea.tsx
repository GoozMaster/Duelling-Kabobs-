import type { ReactNode } from "react";

import { bob, drop, easeGravity, easeLand, lin, p, pop, useT, wobble } from "../anim";
import { Burst, DuelCooks, Drumstick, Flame, Plates, Pot, Puff, RubberChicken } from "../art";
import { useScene } from "../scene";
import { C } from "../theme";
import { Ground, Headline, Sfx, Sunburst } from "../ui";

const POT = { x: 720, y: 530, w: 480, h: 400 };
const MOUTH = { x: 960, y: POT.y + 170 };

/**
 * The idea. Food, humour and family go into one pot, which rattles, and bursts
 * into the name: the two cooks from the site's overture, clashing skewers
 * under the wordmark. The score's glockenspiel run and hit land on the same
 * frame as the burst.
 */
export function Idea() {
  const t = useT();
  const { at, phrase } = useScene();

  const land = 0.5;
  const parts: Array<{ word: string; at: number; art: ReactNode; w: number; h: number; vb: string }> = [
    { word: "FOOD", at: phrase("l10", "One part food"), art: <Drumstick />, w: 170, h: 160, vb: "-5 -10 125 120" },
    { word: "HUMOR", at: phrase("l10", "One part humor"), art: <RubberChicken />, w: 220, h: 170, vb: "0 -10 150 125" },
    { word: "FAMILY", at: phrase("l10", "feeding the family"), art: <Plates />, w: 200, h: 170, vb: "0 -10 140 125" },
  ];
  const FALL = 0.55;

  const burst = at("l11");
  const rattleFrom = phrase("l10", "All of it");
  const rattle = t > rattleFrom && t < burst ? lin(t, rattleFrom, burst - rattleFrom) : 0;
  const shake = rattle * 7 * Math.sin(t * 60);
  const lastIn = Math.max(...parts.map((q) => q.at + FALL));
  const lid = parts.reduce((acc, q) => Math.max(acc, Math.max(0, 1 - Math.abs(t - (q.at + FALL * 0.8)) / 0.18)), 0);

  const after = t >= burst + 0.18;
  // Grows past 1 so even its valleys clear the frame's far corners.
  const star = t >= burst - 0.02 && t < burst + 0.55 ? 1.45 * lin(t, burst - 0.02, 0.24) : 0;
  const starFade = 1 - lin(t, burst + 0.3, 0.25);

  // the title
  const cooksIn = p(t, burst + 0.2, 0.5, easeLand);
  const clash = burst + 0.62;
  const spark = t > clash ? pop(t, clash) * (1 - lin(t, clash + 0.9, 0.4)) : 0;
  const quiver = wobble(t, clash, 4);

  return (
    <Ground>
      {!after && (
        <>
          <Sunburst speed={5} opacity={0.6} y={700} />
          {/* counter and burner */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 930, bottom: 0, background: C.sand, borderTop: `6px solid ${C.ink}` }} />
          <div style={{ position: "absolute", left: 960 - 250, top: 905, width: 500, height: 44, borderRadius: 22, background: C.ink }} />
          <svg viewBox="0 0 60 70" style={{ position: "absolute", left: 960 - 45, top: 845, width: 90, height: 105, overflow: "visible", opacity: lin(t, land, 0.3) }}>
            <Flame flicker={t} />
          </svg>

          {/* the recipe, word by word — under what falls past it */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 110, display: "flex", justifyContent: "center", alignItems: "center", gap: 34 }}>
            {parts.map((q, i) => {
              const s = pop(t, q.at);
              return (
                <div key={q.word} style={{ display: "flex", alignItems: "center", gap: 34 }}>
                  {i > 0 && <Headline size={96} color={C.raised} style={{ transform: `scale(${s})` }}>+</Headline>}
                  <Headline size={120} style={{ transform: `scale(${s}) rotate(${(i - 1) * 3}deg)` }}>
                    {q.word}
                  </Headline>
                </div>
              );
            })}
          </div>
          {/* what goes in */}
          {parts.map((q) => {
            const k = (t - (q.at - FALL * 0.2)) / FALL;
            if (k < 0 || k > 1.1) return null;
            const e = easeGravity(Math.min(1, k));
            const y = -q.h + (MOUTH.y - q.h * 0.4 + q.h) * e;
            const s = k > 0.85 ? 1 - (k - 0.85) * 4 : 1;
            return (
              <svg
                key={q.word}
                viewBox={q.vb}
                style={{
                  position: "absolute",
                  left: MOUTH.x - q.w / 2,
                  top: y - q.h / 2,
                  width: q.w,
                  height: q.h,
                  overflow: "visible",
                  transform: `rotate(${k * 200}deg) scale(${Math.max(0, s)})`,
                }}
              >
                {q.art}
              </svg>
            );
          })}

          {/* the pot, in front of anything falling into it */}
          <svg
            viewBox="0 0 240 200"
            style={{
              position: "absolute",
              left: POT.x + shake,
              top: POT.y,
              width: POT.w,
              height: POT.h,
              overflow: "visible",
              transformOrigin: "50% 100%",
              transform: `${drop(t, land, 900)} scale(${1 + 0.08 * lin(t, burst - 0.25, 0.25)})`,
            }}
          >
            {/* steam rises once everything is in */}
            {t > lastIn &&
              [0, 1, 2, 3].map((i) => {
                const age = ((t - lastIn) * 0.9 + i * 0.25) % 1;
                return <Puff key={i} x={100 + i * 14 + Math.sin(age * 6 + i) * 10} y={60 - age * 70} r={8 + age * 12} />;
              })}
            <Pot lidLift={lid * 34 + rattle * Math.abs(Math.sin(t * 38)) * 12} lidTilt={lid * -12 + rattle * Math.sin(t * 45) * 6} />
          </svg>

        </>
      )}
      <Sfx at={land} name="thock" volume={0.7} />
      {parts.map((q) => (
        <Sfx key={q.word} at={q.at} name="pop" volume={0.45} />
      ))}
      {parts.map((q) => (
        <Sfx key={q.word + "in"} at={q.at + FALL * 0.8} name="thock" volume={0.35} />
      ))}

      {/* ---- the burst, and what it reveals */}
      {after && (
        <>
          <Sunburst speed={14} opacity={1} y={560} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 80, display: "flex", justifyContent: "center" }}>
            <div style={{ transform: `scale(${slam(t, burst + 0.32)}) rotate(-2deg) translateY(${bob(t, 3.4, 5)}px)` }}>
              <Headline size={176}>DUELING KEBABS</Headline>
            </div>
          </div>
          <DuelCooks
            left={-760 * (1 - cooksIn)}
            right={760 * (1 - cooksIn)}
            leanL={quiver}
            leanR={-quiver}
            clash={spark}
            style={{ position: "absolute", left: 290, top: 330, width: 1340, height: 782 }}
          />
        </>
      )}
      {star > 0 && (
        <svg
          viewBox="-100 -100 200 200"
          style={{
            position: "absolute",
            left: MOUTH.x - 1600,
            top: MOUTH.y - 1600,
            width: 3200,
            height: 3200,
            transform: `scale(${star}) rotate(${star * 30}deg)`,
            opacity: starFade,
          }}
        >
          <Burst points={16} outer={100} inner={68} fill={C.yellow} strokeWidth={1} />
        </svg>
      )}
      <Sfx at={burst} name="sparkle" volume={0.55} />
      <Sfx at={burst + 0.32} name="stamp" volume={0.6} />
      <Sfx at={clash} name="stamp" volume={0.9} />
    </Ground>
  );
}

/** A title slam: huge, then down past rest, then settled. */
function slam(t: number, at: number) {
  if (t < at - 0.14) return 0;
  if (t < at) return 2.6 - 1.6 * ((t - (at - 0.14)) / 0.14);
  return 1 + wobble(t, at, 0.08);
}
