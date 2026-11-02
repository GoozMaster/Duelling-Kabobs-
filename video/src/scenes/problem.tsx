import type { CSSProperties, ReactNode } from "react";

import { drop, easeLand, p, pop, useT } from "../anim";
import { useScene } from "../scene";
import { C, DISPLAY, POP } from "../theme";
import { CuisineTag, Ground, Headline, Sfx, Sticker } from "../ui";

const F = { x: 960 - 290, y: 150, w: 580, h: 850, split: 290 };
const LINE = { stroke: C.ink, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/**
 * The problem. The list is stuck to the fridge by a magnet — right there, and
 * no help at all. Question marks; then the doors swing open on the recipe you
 * want to make, and question marks pop over what you might be missing. The
 * music has dropped to its light bars.
 */
export function Problem() {
  const t = useT();
  const { at, phrase } = useScene();

  const land = 0.45;
  const qs = phrase("l07", "can't tell you");
  const opens = at("l27") - 0.1;
  const swing = p(t, opens, 0.7, easeLand);
  const cardAt = opens + 0.45;
  const missing = phrase("l27", "what you're missing");

  return (
    <Ground>
      {/* floor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 985, bottom: 0, background: C.sand, borderTop: `6px solid ${C.ink}` }} />

      <div style={{ position: "absolute", left: F.x, top: F.y, width: F.w, height: F.h, transformOrigin: "50% 100%", transform: drop(t, land, 1100) }}>
        {/* the inside, seen once the doors are open */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 44,
            background: C.raised,
            border: `8px solid ${C.ink}`,
            boxShadow: POP,
            overflow: "hidden",
          }}
        >
          <Interior />
        </div>

        <Door top={0} height={F.split} angle={-112 * swing} handleY={F.split - 90}>
          {null}
        </Door>
        <Door top={F.split} height={F.h - F.split} angle={-104 * p(t, opens + 0.08, 0.7, easeLand)} handleY={40}>
          {/* the list, held up by a magnet */}
          <div style={{ position: "absolute", left: 120, top: 70, width: 300, height: 360, transform: "rotate(-4deg)" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: C.raised,
                border: `5px solid ${C.ink}`,
                borderRadius: 12,
                padding: "46px 26px",
              }}
            >
              <div style={{ fontFamily: DISPLAY, fontSize: 38, color: C.ink, marginBottom: 18 }}>THE LIST</div>
              {[200, 170, 230, 150, 190, 210].map((w, i) => (
                <div key={i} style={{ width: w, height: 10, borderRadius: 5, background: C.muted, opacity: 0.45, marginBottom: 24 }} />
              ))}
            </div>
            <div style={{ position: "absolute", left: 120, top: -22, width: 56, height: 56, borderRadius: "50%", background: C.yellow, border: `5px solid ${C.ink}` }} />
          </div>
        </Door>
      </div>
      <Sfx at={land} name="thock" volume={0.7} />
      <Sfx at={opens} name="whoosh" volume={0.35} />

      {/* question marks over the fridge */}
      {[
        { x: 560, y: 150, r: -14, s: 150 },
        { x: 1290, y: 110, r: 10, s: 190 },
        { x: 1360, y: 430, r: 18, s: 120 },
      ].map((q, i) => {
        const at = qs + i * 0.14;
        const s = pop(t, at);
        if (s <= 0) return null;
        const away = p(t, opens - 0.2, 0.4);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: q.x,
              top: q.y,
              fontFamily: DISPLAY,
              fontSize: q.s,
              color: C.brick,
              WebkitTextStroke: `10px ${C.ink}`,
              paintOrder: "stroke fill",
              textShadow: `8px 8px 0 ${C.ink}`,
              transform: `rotate(${q.r + Math.sin(t * 5 + i) * 5}deg) scale(${s * (1 - away)})`,
            }}
          >
            ?
          </div>
        );
      })}
      {[0, 1, 2].map((i) => (
        <Sfx key={i} at={qs + i * 0.14} name="pop" volume={0.35} />
      ))}

      <RecipeCard t={t} at={cardAt} missing={missing} />
      <Sfx at={cardAt} name="pop" volume={0.45} />
      {MISSING.map((row, i) => (
        <Sfx key={row} at={missing + i * 0.16} name="pop" volume={0.35} />
      ))}
    </Ground>
  );
}

function Door({
  top,
  height,
  angle,
  handleY,
  children,
}: {
  top: number;
  height: number;
  angle: number;
  handleY: number;
  children: ReactNode;
}) {
  // Past 90° the viewer is looking at the inside of the door.
  const back = angle < -90;
  const face: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: top === 0 ? "44px 44px 10px 10px" : "10px 10px 44px 44px",
    border: `8px solid ${C.ink}`,
    background: back ? C.surface : C.raised,
  };
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: F.w,
        height,
        transformOrigin: "0% 50%",
        transform: `perspective(2400px) rotateY(${angle}deg)`,
      }}
    >
      <div style={face}>
        {!back && (
          <>
            <div
              style={{
                position: "absolute",
                right: 36,
                top: handleY,
                width: 30,
                height: 140,
                borderRadius: 15,
                background: C.ink,
              }}
            />
            {children}
          </>
        )}
        {back &&
          [0.3, 0.62].map((k) => (
            <div key={k} style={{ position: "absolute", left: 30, right: 30, top: height * k, height: 16, borderRadius: 8, background: C.ink, opacity: 0.8 }} />
          ))}
      </div>
    </div>
  );
}

function Interior() {
  const shelf = (y: number) => <line x1={0} x2={F.w} y1={y} y2={y} {...LINE} strokeWidth={8} />;
  return (
    <svg width={F.w - 16} height={F.h - 16} viewBox={`0 0 ${F.w} ${F.h}`} style={{ position: "absolute", inset: 0, background: C.tealSoft }}>
      {/* freezer: ice trays and a frosty bag */}
      <rect x={0} y={0} width={F.w} height={F.split} fill={C.sky} opacity={0.5} />
      <rect x={60} y={170} width={180} height={70} rx={12} fill={C.raised} {...LINE} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={76 + i * 56} y={184} width={40} height={40} rx={8} fill={C.tealSoft} {...LINE} strokeWidth={4} />
      ))}
      <path d="M300 240 C300 170 330 150 380 150 H470 C510 150 520 180 520 240 Z" fill={C.raised} {...LINE} />
      <path d="M300 240 H520" {...LINE} />
      {shelf(F.split)}

      {/* fridge shelves */}
      {shelf(520)}
      {shelf(730)}
      {/* milk */}
      <path d="M70 510 V380 L100 340 H170 L200 380 V510 Z" fill={C.raised} {...LINE} />
      <path d="M70 380 H200" {...LINE} />
      <rect x={90} y={410} width={90} height={50} rx={8} fill={C.sky} {...LINE} strokeWidth={4} />
      {/* pickles */}
      <rect x={250} y={400} width={110} height={110} rx={16} fill={C.basilSoft} {...LINE} />
      <rect x={244} y={376} width={122} height={34} rx={8} fill={C.basil} {...LINE} />
      {/* cheese */}
      <path d="M390 510 L520 510 L520 440 Z" fill={C.gold} {...LINE} />
      <circle cx={480} cy={490} r={10} fill={C.sand} />

      {/* bottom shelf: eggs */}
      <rect x={60} y={660} width={230} height={60} rx={12} fill={C.sand} {...LINE} />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={95 + i * 54} cy={652} rx={22} ry={28} fill={C.raised} {...LINE} strokeWidth={5} />
      ))}
    </svg>
  );
}

// Rows of the card as bars, not invented quantities; the two rows marked are
// the ones the question marks land on.
const ROWS = [250, 300, 210, 280, 240, 190];
const MISSING = [1, 3];
const CARD = { x: 960 - 260, y: 230, w: 520, h: 640 };

function RecipeCard({ t, at, missing }: { t: number; at: number; missing: number }) {
  const s = pop(t, at);
  if (s <= 0) return null;
  return (
    <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, transform: `rotate(-3deg) scale(${s})` }}>
      <Sticker radius={26} depth={POP} style={{ position: "absolute", inset: 0, padding: "40px 40px" }}>
        <Headline size={50}>RED WINE BRAISED</Headline>
        <Headline size={50}>SHORT RIBS</Headline>
        <div style={{ marginTop: 18 }}>
          <CuisineTag size={24}>French</CuisineTag>
        </div>
        <div style={{ marginTop: 34 }}>
          {ROWS.map((w, i) => {
            const k = MISSING.indexOf(i);
            const q = k >= 0 ? pop(t, missing + k * 0.16) : 0;
            return (
              <div key={i} style={{ position: "relative", display: "flex", alignItems: "center", gap: 18, height: 50 }}>
                <span style={{ width: 12, height: 12, borderRadius: "50%", background: C.ink }} />
                <span style={{ width: w, height: 12, borderRadius: 6, background: q > 0 ? C.brick : C.muted, opacity: q > 0 ? 0.8 : 0.45 }} />
                {q > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      left: w + 50,
                      top: -26,
                      fontFamily: DISPLAY,
                      fontSize: 80,
                      color: C.brick,
                      WebkitTextStroke: `8px ${C.ink}`,
                      paintOrder: "stroke fill",
                      textShadow: `5px 5px 0 ${C.ink}`,
                      transform: `rotate(${k ? 12 : -10}deg) scale(${q})`,
                    }}
                  >
                    ?
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </Sticker>
    </div>
  );
}
