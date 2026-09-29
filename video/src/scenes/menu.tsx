import { bob, easeLand, easeReel, lin, mix, p, pop, useT } from "../anim";
import { Globe, project } from "../globe";
import { useScene } from "../scene";
import { C, PRESS } from "../theme";
import { click, Cursor, cursorAt, Ground, Headline, label, RecipeCard, Sfx, Sticker, Sunburst, text, Window } from "../ui";

const WIN = { x: 150, y: 70, w: 1620, h: 940 };
const PADX = 50;
const COLS = 4;
const GAP = 28;
const CARD_W = (WIN.w - 12 - PADX * 2 - GAP * (COLS - 1)) / COLS;
const CARD_H = 196;
const GRID_Y = 316;

const ALL: Array<[string, string]> = [
  ["Bolognese", "Italian"],
  ["Chicken Shawarma", "Mediterranean"],
  ["Pad Thai", "Asian"],
  ["French Onion Soup", "French"],
  ["Mac and Cheese", "American"],
  ["Challah", "Breads"],
  ["Lomo Saltado", "Latin"],
  ["Creme Brulee", "Desserts"],
  ["Teriyaki Chicken", "Asian"],
  ["Chicken Tikka Masala", "Indian"],
  ["Pancakes", "American"],
  ["Baba Ganoush", "Mediterranean"],
];
const ITALIAN = [
  "Bolognese",
  "Pasta Al Limone",
  "Pesto Genovese",
  "Fettuccine Alfredo",
  "Shrimp Risotto",
  "Gnocchi",
  "Spaghetti Alla Nerano",
  "Burst Cherry Tomato Pasta",
  "Instant Pot Mushroom Risotto",
  "Fresh Pasta",
  "Spaghetti with Meatballs",
  "Ina Garten Panzanella Salad",
];
// The real counts, largest first, as the filter row lists them.
const CHIPS: Array<[string, number]> = [
  ["All", 126],
  ["Asian", 35],
  ["American", 34],
  ["Italian", 19],
  ["Desserts", 13],
  ["Breads", 9],
  ["Latin", 6],
];

const GLOBE = { cx: 1390, cy: 575, size: 760 };
const ITALY: [number, number] = [12.5, 42.5];

/**
 * The menu. The collection deals onto the grid; a cursor browses it; the
 * Italian chip filters it; then the window slides aside for the globe, which
 * spins and settles on Italy for a pin.
 */
export function Menu() {
  const t = useT();
  const { phrase } = useScene();

  const winIn = 0.25;
  const dealAt = (i: number) => 0.8 + i * 0.06;

  const browse = phrase("l13", "Browse");
  const filter = phrase("l13", "filter by cuisine");
  const spin = phrase("l13", "spin the globe") - 0.15;
  const pick = phrase("l13", "pick a spot");
  const settle = Math.max(spin + 1.5, pick - 0.1);

  // Card i flips to the Italian list after the chip is pressed.
  const flip = (i: number) => lin(t, filter + 0.15 + i * 0.035, 0.26);
  const italian = t >= filter;

  const aside = p(t, spin - 0.1, 0.6, easeLand);

  // Cursor: in from the corner, across the first row, onto the Italian chip.
  const chipX = chipCentre(3);
  const cursor = cursorAt(t, [
    { t: browse - 0.4, x: 1900, y: 1100 },
    { t: browse + 0.3, x: WIN.x + PADX + CARD_W * 0.5, y: WIN.y + 76 + GRID_Y + 110 },
    { t: browse + 0.8, x: WIN.x + PADX + CARD_W * 1.5 + GAP, y: WIN.y + 76 + GRID_Y + 120 },
    { t: filter - 0.35, x: WIN.x + PADX + CARD_W * 2.5 + GAP * 2, y: WIN.y + 76 + GRID_Y + 110 },
    { t: filter - 0.05, x: WIN.x + chipX, y: WIN.y + 76 + 250 },
    { t: spin + 0.2, x: WIN.x + chipX + 40, y: WIN.y + 76 + 300 },
  ]);
  const hover = (i: number) => {
    const cx = WIN.x + PADX + (i % COLS) * (CARD_W + GAP);
    const cy = WIN.y + 76 + GRID_Y + Math.floor(i / COLS) * (CARD_H + GAP);
    return t < filter && cursor.x > cx && cursor.x < cx + CARD_W && cursor.y > cy && cursor.y < cy + CARD_H ? 1 : 0;
  };

  // The globe: 320° of spin, landing centred on Italy.
  const spinK = easeReel(lin(t, spin, settle - spin + 0.6));
  const rot: [number, number] = [mix(-ITALY[0] - 320, -ITALY[0], spinK), mix(-5, -ITALY[1] + 6, spinK)];
  const globeScale = pop(t, spin);
  const [px, py] = project(GLOBE.size, rot, ITALY);
  const pinAt = pick + 0.15;

  return (
    <Ground>
      <Sunburst speed={4} opacity={0.7} x={GLOBE.cx} y={GLOBE.cy} from={0} />

      <div
        style={{
          position: "absolute",
          left: WIN.x,
          top: WIN.y,
          width: WIN.w,
          height: WIN.h,
          transformOrigin: "0% 50%",
          transform: `translateX(${-640 * aside}px) scale(${pop(t, winIn) * (1 - 0.16 * aside)}) rotate(${-2 * aside}deg)`,
        }}
      >
        <Window url="Down With Hunger  ›  Recipes" style={{ width: "100%", height: "100%" }}>
          <div style={{ position: "absolute", left: PADX, top: 44 }}>
            <Headline size={84}>RECIPES</Headline>
            <div style={{ ...text(30, 500, C.muted), marginTop: 14 }}>126 recipes, no account needed.</div>
          </div>
          <div style={{ position: "absolute", right: PADX + 12, top: 58, display: "flex", gap: 18 }}>
            {["Browse the globe →", "Surprise me →"].map((l) => (
              <span
                key={l}
                style={{ ...text(28, 500), padding: "10px 26px", border: `4px solid ${C.ink}`, borderRadius: 999, background: C.raised, boxShadow: PRESS }}
              >
                {l}
              </span>
            ))}
          </div>

          <div style={{ position: "absolute", left: PADX, top: 222, display: "flex", gap: 16 }}>
            {CHIPS.map(([name, n], i) => {
              const on = italian ? name === "Italian" : name === "All";
              const pressed = name === "Italian" ? click(t, filter) : 0;
              return (
                <span
                  key={name}
                  style={{
                    ...text(26, 500),
                    padding: "8px 22px",
                    border: `4px solid ${C.ink}`,
                    borderRadius: 999,
                    background: on ? C.yellow : C.raised,
                    boxShadow: on ? PRESS : "none",
                    transform: `scale(${1 - pressed * 0.08}) scale(${pop(t, dealAt(0) - 0.3 + i * 0.04)})`,
                    display: "inline-flex",
                    gap: 10,
                  }}
                >
                  {name} <span style={{ color: on ? C.ink : C.muted }}>{n}</span>
                </span>
              );
            })}
          </div>

          {ALL.map(([title, cuisine], i) => {
            const k = flip(i);
            const showItalian = italian && k >= 0.5;
            const sx = Math.abs(Math.cos(k * Math.PI));
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: PADX + (i % COLS) * (CARD_W + GAP),
                  top: GRID_Y + Math.floor(i / COLS) * (CARD_H + GAP),
                  width: CARD_W,
                  height: CARD_H,
                  transform: `scale(${pop(t, dealAt(i))}) scaleX(${sx})`,
                }}
              >
                <RecipeCard
                  title={showItalian ? ITALIAN[i] : title}
                  cuisine={showItalian ? "Italian" : cuisine}
                  lift={hover(i)}
                  style={{ height: "100%", boxSizing: "border-box" }}
                />
              </div>
            );
          })}
        </Window>
      </div>
      {ALL.slice(0, 8).map((_, i) => (
        <Sfx key={i} at={dealAt(i)} name="tick" volume={0.35} />
      ))}
      <Sfx at={winIn} name="pop" volume={0.5} />
      <Sfx at={filter} name="switch" volume={0.6} />

      {/* the globe */}
      {globeScale > 0 && (
        <div
          style={{
            position: "absolute",
            left: GLOBE.cx - GLOBE.size / 2,
            top: GLOBE.cy - GLOBE.size / 2 + bob(t, 4, 6),
            width: GLOBE.size,
            height: GLOBE.size,
            transform: `scale(${globeScale})`,
          }}
        >
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", boxShadow: `18px 18px 0 ${C.ink}` }} />
          <Globe size={GLOBE.size} rotate={rot} />
          {t > pinAt - 0.3 && <Pin x={px} y={py} t={t} at={pinAt} />}
          {t > pinAt + 0.2 && (
            <div style={{ position: "absolute", left: px + 40, top: py - 190, transform: `scale(${pop(t, pinAt + 0.2)})`, transformOrigin: "0% 100%" }}>
              <Sticker radius={22} style={{ padding: "14px 26px" }}>
                <div style={label(24, C.basil)}>Italian</div>
                <div style={text(34, 600)}>19 recipes</div>
              </Sticker>
            </div>
          )}
        </div>
      )}
      <Sfx at={spin} name="whoosh" volume={0.35} />
      <Sfx at={pinAt} name="thock" volume={0.6} />
      <Sfx at={pinAt + 0.2} name="pop" volume={0.45} />

      {t > browse - 0.4 && t < spin + 0.4 && <Cursor x={cursor.x} y={cursor.y} pressed={click(t, filter)} />}
    </Ground>
  );
}

function chipCentre(index: number) {
  // Approximate chip widths at 26px Fredoka: label, count, padding and gap.
  let x = PADX;
  for (let i = 0; i < index; i++) {
    const [name, n] = CHIPS[i];
    x += (name.length + String(n).length + 1) * 14 + 44 + 8 + 16;
  }
  const [name, n] = CHIPS[index];
  return x + ((name.length + String(n).length + 1) * 14 + 52) / 2;
}

function Pin({ x, y, t, at }: { x: number; y: number; t: number; at: number }) {
  const fall = Math.min(1, Math.max(0, (t - (at - 0.3)) / 0.3));
  const dy = -220 * (1 - fall * fall);
  const squash = t > at ? 0.18 * Math.exp(-(t - at) * 8) * Math.cos((t - at) * 18) : 0;
  return (
    <svg
      viewBox="0 0 60 90"
      style={{
        position: "absolute",
        left: x - 30,
        top: y - 86 + dy,
        width: 60,
        height: 90,
        overflow: "visible",
        transformOrigin: "50% 100%",
        transform: `scale(${1 + squash}, ${1 - squash})`,
      }}
    >
      <path d="M30 86 C22 64 4 50 4 30 A26 26 0 0 1 56 30 C56 50 38 64 30 86 Z" fill={C.brick} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
      <circle cx="30" cy="30" r="10" fill={C.raised} stroke={C.ink} strokeWidth={4} />
    </svg>
  );
}
