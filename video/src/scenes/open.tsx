import { bob, drop, easePress, lin, p, pop, useT } from "../anim";
import { useScene } from "../scene";
import { C, DISPLAY, KEY, STICKER } from "../theme";
import { Ground, Headline, Sfx, Sticker, Sunburst, text } from "../ui";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/**
 * Cold open. A tear-off calendar runs through the week — "every single
 * night" — and then the question arrives, and keeps arriving, until the
 * screen is full of it. One gag: the multiplying bubbles.
 */
export function Open() {
  const t = useT();
  const { at, end } = useScene();

  const land = 0.55;
  // Pages tear across the first line, finishing as it ends.
  const flipStart = at("l01") + 0.5;
  const flipEvery = (end("l01") - 0.2 - flipStart) / (DAYS.length - 1);
  const flips = DAYS.slice(1).map((_, i) => flipStart + i * flipEvery);

  const q = at("l02");
  // The calendar is shoved aside by the first bubble.
  const shove = p(t, q - 0.1, 0.5, easePress);

  const bubbles: Array<{ x: number; y: number; size: number; rot: number; at: number; tail: "l" | "r" }> = [
    { x: 960, y: 520, size: 120, rot: -3, at: q, tail: "l" },
    { x: 380, y: 230, size: 56, rot: -8, at: q + 0.42, tail: "r" },
    { x: 1540, y: 250, size: 62, rot: 6, at: q + 0.5, tail: "l" },
    { x: 330, y: 820, size: 60, rot: 5, at: q + 0.58, tail: "r" },
    { x: 1580, y: 830, size: 54, rot: -6, at: q + 0.66, tail: "l" },
    { x: 960, y: 140, size: 46, rot: 3, at: q + 0.74, tail: "l" },
    { x: 980, y: 930, size: 50, rot: -4, at: q + 0.82, tail: "r" },
    { x: 230, y: 520, size: 40, rot: -12, at: q + 0.9, tail: "r" },
    { x: 1700, y: 540, size: 42, rot: 10, at: q + 0.98, tail: "l" },
  ];

  return (
    <Ground>
      <Sunburst speed={7} opacity={lin(t, 0, 0.6)} />

      {/* ---- the calendar */}
      <div
        style={{
          position: "absolute",
          left: 960 - 280,
          top: 190,
          width: 560,
          height: 640,
          transformOrigin: "50% 100%",
          transform: `translate(${-1350 * shove}px, ${160 * shove}px) rotate(${-32 * shove}deg) ${drop(t, land, 900)}`,
        }}
      >
        <div style={{ transform: `translateY(${bob(t, 3.2, 6)}px)`, width: "100%", height: "100%", position: "relative" }}>
          {/* The page underneath the next tear, drawn first. */}
          {DAYS.map((day, i) => {
            // Sunday is never torn off; it is the page the calendar leaves on.
            const tornAt = flips[i];
            if (tornAt !== undefined && t > tornAt + 0.6) return null;
            const k = tornAt === undefined ? 0 : lin(t, tornAt, 0.55);
            return (
              <div
                key={day}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: DAYS.length - i,
                  transformOrigin: "20% 0%",
                  transform: `translate(${k * 520}px, ${-k * 260 + k * k * 500}px) rotate(${k * 38}deg)`,
                  opacity: tornAt === undefined ? 1 : 1 - lin(t, tornAt + 0.35, 0.2),
                }}
              >
                <CalendarPage day={day} />
              </div>
            );
          })}
        </div>
      </div>
      {flips.map((f, i) => (
        <Sfx key={i} at={f} name="tick" volume={0.55} />
      ))}
      <Sfx at={land} name="thock" volume={0.6} />

      {/* ---- the question, multiplying */}
      {bubbles.map((b, i) => {
        const s = pop(t, b.at);
        if (s <= 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              transform: `translate(-50%, -50%) rotate(${b.rot + Math.sin(t * 2 + i) * 1.5}deg) scale(${s})`,
              zIndex: i === 0 ? 20 : 10,
            }}
          >
            <Bubble size={b.size} tail={b.tail} />
          </div>
        );
      })}
      <Sfx at={q} name="pop" volume={0.7} />
      {bubbles.slice(1).map((b, i) => (
        <Sfx key={i} at={b.at} name="pop" volume={0.28} />
      ))}
    </Ground>
  );
}

function CalendarPage({ day }: { day: string }) {
  return (
    <Sticker radius={30} depth={STICKER} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ height: 120, background: C.brick, borderBottom: `${KEY}px solid ${C.ink}`, position: "relative" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: 30,
              left: 70 + i * 100,
              width: 26,
              height: 50,
              borderRadius: 14,
              background: C.surface,
              border: `5px solid ${C.ink}`,
            }}
          />
        ))}
      </div>
      <div style={{ textAlign: "center", paddingTop: 60 }}>
        <Headline size={170} style={{ display: "inline-block" }}>
          {day}
        </Headline>
        <div style={{ ...text(46, 600, C.muted), marginTop: 36, letterSpacing: "0.06em" }}>DINNER · 6:30 PM</div>
      </div>
    </Sticker>
  );
}

function Bubble({ size, tail }: { size: number; tail: "l" | "r" }) {
  const bw = Math.max(5, size * 0.07);
  const W = size * 0.8;
  const H = size * 0.7;
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontSize: size,
          color: C.ink,
          letterSpacing: "0.03em",
          lineHeight: 1,
          padding: `${size * 0.42}px ${size * 0.6}px ${size * 0.3}px`,
          background: C.raised,
          border: `${bw}px solid ${C.ink}`,
          borderRadius: size * 0.7,
          boxShadow: `${size * 0.1}px ${size * 0.1}px 0 ${C.ink}`,
          whiteSpace: "nowrap",
        }}
      >
        WHAT&apos;S FOR DINNER?
      </div>
      {/* In pixels, with y=0 on the inner edge of the bubble's border: the
          tail is drawn open at the top, then a white patch erases the border
          between its two sides so the outline runs continuously round both. */}
      <svg
        width={W}
        height={H}
        style={{
          position: "absolute",
          top: `calc(100% - ${bw}px)`,
          [tail === "l" ? "left" : "right"]: size * 0.9,
          transform: tail === "r" ? "scaleX(-1)" : undefined,
          overflow: "visible",
        }}
      >
        <path
          d={`M${0.08 * W} 0 L${0.2 * W} ${H} L${0.78 * W} 0`}
          fill={C.raised}
          stroke={C.ink}
          strokeWidth={bw}
          strokeLinejoin="round"
        />
        <rect x={0.08 * W + bw * 0.7} y={-2} width={0.7 * W - bw * 1.4} height={bw + 2.5} fill={C.raised} />
      </svg>
    </div>
  );
}
