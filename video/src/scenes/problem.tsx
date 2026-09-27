import type { CSSProperties, ReactNode } from "react";

import { drop, easeLand, p, pop, useT } from "../anim";
import { Lemon } from "../art";
import { useScene } from "../scene";
import { C, DISPLAY, POP } from "../theme";
import { Ground, Sfx, Stamp } from "../ui";

const F = { x: 960 - 290, y: 150, w: 580, h: 850, split: 290 };
const LINE = { stroke: C.ink, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/**
 * The problem. The list is stuck to the fridge by a magnet — right there, and
 * no help at all. Question marks; the doors swing open; there is a hole on the
 * shelf where the lemon should be. The music has dropped to the minor walk.
 */
export function Problem() {
  const t = useT();
  const { phrase } = useScene();

  const land = 0.45;
  const qs = phrase("l07", "can't tell you");
  const opens = phrase("l08", "in your pantry") - 0.1;
  const swing = p(t, opens, 0.7, easeLand);
  const out = phrase("l08", "out of lemons") + 0.25;

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
          <Interior t={t} out={out} />
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

      <Stamp at={out} size={110} rotate={-12} style={{ left: 930, top: 700 }}>
        OUT
      </Stamp>
      <Sfx at={out} name="stamp" volume={0.8} />
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

function Interior({ t, out }: { t: number; out: number }) {
  const shelf = (y: number) => <line x1={0} x2={F.w} y1={y} y2={y} {...LINE} strokeWidth={8} />;
  const pulse = t > out - 0.6 ? 1 + 0.05 * Math.sin((t - out) * 12) * Math.exp(-Math.max(0, t - out) * 2) : 1;
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

      {/* bottom shelf: eggs, and a lemon-shaped hole */}
      <rect x={60} y={660} width={230} height={60} rx={12} fill={C.sand} {...LINE} />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={95 + i * 54} cy={652} rx={22} ry={28} fill={C.raised} {...LINE} strokeWidth={5} />
      ))}
      <g transform={`translate(340 600) scale(${pulse * 1.35})`} style={{ transformOrigin: "60px 45px" }}>
        <g opacity={0.25}>
          <Lemon />
        </g>
        <path
          d="M14 46 C8 40 10 34 18 30 C30 12 54 6 76 12 C92 16 104 26 108 36 C114 38 116 44 110 50 C108 66 94 80 70 84 C46 88 24 78 16 62 C8 58 8 50 14 46 Z"
          fill="none"
          stroke={C.ink}
          strokeWidth={5}
          strokeDasharray="12 10"
        />
      </g>
    </svg>
  );
}
