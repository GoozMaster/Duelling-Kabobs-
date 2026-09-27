import type { ReactNode } from "react";

import { easeLand, easePress, mix, p, pop, useT, wobble } from "../anim";
import { Bottle, Box, FreezerBag, Jar } from "../art";
import { useScene } from "../scene";
import { C, POP } from "../theme";
import { Ground, Headline, label, Sfx, Stamp, Sticker, Sunburst } from "../ui";

const UNIT = { x: 250, y: 170, w: 1420, h: 830 };
const SHELF = [440, 690, 950]; // plank tops, in frame coordinates

type Item = { key: string; x: number; shelf: number; w: number; h: number; vb: string; art: ReactNode };

// Every name here is a real row from the pantry table.
const SPICES = [
  ["Cumin", C.brick],
  ["Paprika", C.gold],
  ["Sumac", C.basil],
  ["Saffron", C.teal],
  ["Turmeric", C.brick],
  ["Advieh", C.gold],
] as const;
const SAUCES = [
  ["Soy", C.ink],
  ["Fish", C.gold],
  ["Hoisin", C.brick],
  ["Sriracha", C.brick],
  ["Oyster", C.teal],
] as const;
const DRY = [
  ["Jasmine", C.tealSoft],
  ["Basmati", C.basilSoft],
  ["Arborio", C.brickSoft],
  ["Spaghetti", C.yellow],
  ["Rice noodle", C.sky],
  ["Ramen", C.sand],
] as const;
const COLD = [
  ["Chicken thighs", C.brickSoft],
  ["Salmon", C.gold],
  ["Shrimp", C.brickSoft],
  ["Ground beef", C.brick],
] as const;

/**
 * The pantry. It is already stocked — that is the point — so the cabinet
 * doors open on a full set of shelves, and each group of real staples hops as
 * the voice names it, its shelf label lighting up. The counter rolls to the
 * real total. Then one stamp.
 */
export function Pantry() {
  const t = useT();
  const { at, phrase } = useScene();

  const unitIn = 0.4;
  const groups: Array<{ at: number; items: Item[] }> = [
    {
      at: phrase("l15", "Spices"),
      items: SPICES.map(([name, lid], i) => ({ key: name, x: 300 + i * 108, shelf: 0, w: 96, h: 144, vb: "0 0 80 120", art: <Jar lid={lid} label={name} /> })),
    },
    {
      at: phrase("l15", "sauces"),
      items: SAUCES.map(([name, body], i) => ({ key: name, x: 1010 + i * 124, shelf: 0, w: 88, h: 188, vb: "0 0 70 150", art: <Bottle body={body} label={name} /> })),
    },
    {
      at: phrase("l15", "rice, noodles"),
      items: DRY.map(([name, body], i) => ({ key: name, x: 330 + i * 215, shelf: 1, w: 146, h: 186, vb: "0 0 110 140", art: <Box body={body} label={name} /> })),
    },
    {
      at: phrase("l15", "the proteins"),
      items: COLD.map(([name, fill], i) => ({ key: name, x: 520 + i * 250, shelf: 2, w: 176, h: 150, vb: "0 0 130 124", art: <FreezerBag label={name} fill={fill} /> })),
    },
  ];
  const STAGGER = 0.06;
  const opens = phrase("l14", "already stocked") - 0.05;
  const doors = p(t, opens, 0.75, easeLand);
  const lit = (shelf: number) =>
    groups.some((g) => g.items[0].shelf === shelf && t >= g.at && t < g.at + 1.3);

  const countAt = phrase("l15", "More than two hundred");
  const count = Math.round(mix(0, 256, p(t, countAt, 1.6, easePress)));
  const stampAt = at("l16") + 0.35;

  return (
    <Ground>
      <Sunburst speed={4} opacity={0.6} y={1100} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 40, display: "flex", justifyContent: "center", transform: `scale(${pop(t, unitIn + 0.2)})` }}>
        <Headline size={100}>THE PANTRY</Headline>
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${UNIT.x + UNIT.w / 2}px ${UNIT.y + UNIT.h / 2}px`,
          transform: `scale(${pop(t, unitIn)})`,
        }}
      >
      <div style={{ position: "absolute", left: UNIT.x, top: UNIT.y, width: UNIT.w, height: UNIT.h }}>
        <Sticker bg={C.surface} radius={30} depth={POP} style={{ position: "absolute", inset: 0 }}>
          {/* freezer bin on the bottom shelf */}
          <div
            style={{
              position: "absolute",
              left: 200,
              right: 200,
              top: SHELF[2] - UNIT.y - 200,
              height: 200,
              background: C.tealSoft,
              border: `6px solid ${C.ink}`,
              borderRadius: "20px 20px 0 0",
              borderBottom: "none",
            }}
          />
        </Sticker>
        {SHELF.map((y, i) => (
          <div
            key={y}
            style={{
              position: "absolute",
              left: -24,
              right: -24,
              top: y - UNIT.y,
              height: 30,
              background: C.gold,
              border: `6px solid ${C.ink}`,
              borderRadius: 10,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: i === 2 ? UNIT.w / 2 - 110 : 60,
                top: 18,
                ...label(22, lit(i) ? C.ink : C.raised),
                background: lit(i) ? C.yellow : C.ink,
                border: `4px solid ${C.ink}`,
                padding: "4px 16px",
                borderRadius: 999,
              }}
            >
              {["Spices & sauces", "Rice & noodles", "Freezer"][i]}
            </span>
          </div>
        ))}
      </div>

      {groups.flatMap((g) =>
        g.items.map((item, i) => {
          const hopAt = g.at + 0.1 + i * STAGGER;
          return (
            <svg
              key={item.key}
              viewBox={item.vb}
              style={{
                position: "absolute",
                left: item.x,
                top: SHELF[item.shelf] - item.h + 3,
                width: item.w,
                height: item.h,
                overflow: "visible",
                transformOrigin: "50% 100%",
                transform: hop(t, hopAt),
              }}
            >
              {item.art}
            </svg>
          );
        }),
      )}

      {/* the cabinet doors, hinged on the outer edges */}
      {doors < 1 &&
        [0, 1].map((side) => {
          const angle = (side ? 1 : -1) * 105 * doors;
          if (Math.abs(angle) > 90) return null;
          return (
            <div
              key={side}
              style={{
                position: "absolute",
                left: UNIT.x + (side ? UNIT.w / 2 : 0),
                top: UNIT.y,
                width: UNIT.w / 2,
                height: UNIT.h,
                transformOrigin: side ? "100% 50%" : "0% 50%",
                transform: `perspective(2600px) rotateY(${angle}deg)`,
                boxSizing: "border-box",
                background: C.sand,
                border: `6px solid ${C.ink}`,
                borderRadius: side ? "0 30px 30px 0" : "30px 0 0 30px",
              }}
            >
              <div style={{ position: "absolute", inset: 46, border: `5px solid ${C.ink}`, borderRadius: 18, opacity: 0.5 }} />
              <div
                style={{
                  position: "absolute",
                  top: UNIT.h / 2 - 34,
                  [side ? "left" : "right"]: 24,
                  width: 30,
                  height: 68,
                  borderRadius: 15,
                  background: C.gold,
                  border: `5px solid ${C.ink}`,
                }}
              />
            </div>
          );
        })}
      </div>
      <Sfx at={opens} name="whoosh" volume={0.35} />
      <Sfx at={opens + 0.3} name="sparkle" volume={0.35} />
      {groups.flatMap((g) => g.items.map((item, i) => <Sfx key={item.key} at={g.at + 0.1 + i * STAGGER + 0.34} name="tick" volume={0.25} />))}
      {groups.map((g) => (
        <Sfx key={g.at} at={g.at + 0.1} name="pop" volume={0.3} />
      ))}

      {/* the count */}
      {t > countAt - 0.1 && (
        <div style={{ position: "absolute", left: 1560, top: 60, transform: `rotate(7deg) scale(${pop(t, countAt)})` }}>
          <Sticker bg={C.yellow} radius={28} depth={POP} style={{ padding: "16px 30px 12px", textAlign: "center" }}>
            <Headline size={104} color={C.raised}>
              {count}
            </Headline>
            <div style={{ ...label(24), marginTop: 6 }}>pantry items</div>
          </Sticker>
        </div>
      )}
      <Sfx at={countAt} name="pop" volume={0.5} />

      <Stamp at={stampAt} color={C.basil} size={150} rotate={-8} style={{ left: 560, top: 410 }}>
        ON HAND
      </Stamp>
      <Sfx at={stampAt} name="stamp" volume={0.9} />
    </Ground>
  );
}

/** A little jump in place: up on an arc, then the landing squash. */
function hop(t: number, at: number) {
  const d = t - at;
  if (d < 0) return "none";
  if (d < 0.34) {
    const k = d / 0.34;
    return `translateY(${-64 * Math.sin(Math.PI * k)}px) scale(0.95, 1.07)`;
  }
  const w = wobble(t, at + 0.34, 0.12);
  return `scale(${1 + w}, ${1 - w})`;
}
