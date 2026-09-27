import { easeReel, lin, pop, useT } from "../anim";
import { useScene } from "../scene";
import { C, POP, PRESS, STICKER } from "../theme";
import { click, Cursor, cursorAt, CuisineTag, Disc, Ground, Headline, label, Sfx, Sticker, Sunburst, text } from "../ui";

// Real titles for the strip; the reel lands on the last.
const TITLES: Array<[string, string]> = [
  ["Pancakes", "American"],
  ["Pesto Genovese", "Italian"],
  ["Chicken Fried Rice", "Asian"],
  ["Flan", "Desserts"],
  ["Elote", "Latin"],
  ["French Onion Soup", "French"],
  ["Baguettes", "Breads"],
  ["Crab Cakes", "American"],
  ["Pad Thai", "Asian"],
  ["Shrimp Risotto", "Italian"],
  ["Baba Ganoush", "Mediterranean"],
  ["Chicken Tikka Masala", "Indian"],
  ["Hashbrowns", "American"],
  ["Char Siu Pork", "Asian"],
];
const WINNER: [string, string] = ["Mongolian Beef", "Asian"];
const STRIP = [...Array.from({ length: 38 }, (_, i) => TITLES[i % TITLES.length]), WINNER, TITLES[3], TITLES[7]];
const LAND = 38;

const VIEW = { x: 110, y: 380, w: 1700, h: 250 };
const TILE = 400;
const GAP = 28;
const PITCH = TILE + GAP;
const SPIN = 4.1;

/**
 * Surprise me. The nav's Recipes menu, a click, and the reel: it leaves fast
 * and spends its last third crawling — the site's own reel curve — before it
 * lands on tonight's dinner.
 */
export function Surprise() {
  const t = useT();
  const { phrase } = useScene();

  const menuIn = 0.35;
  const hit = phrase("l24", "hit Surprise me") + 0.4;
  const pageIn = hit + 0.25;
  const spinStart = pageIn + 0.35;
  const k = easeReel(lin(t, spinStart, SPIN));
  const startX = 2 * PITCH;
  const x = startX + (LAND * PITCH - startX) * k; // strip position of the tile under the pointer
  const landed = t >= spinStart + SPIN;

  // A tick each time a tile edge crosses the pointer.
  const ticks: number[] = [];
  let last = -1;
  for (let f = 0; f <= SPIN * 30; f++) {
    const tt = spinStart + f / 30;
    const kk = easeReel(f / (SPIN * 30));
    const idx = Math.floor((startX + (LAND * PITCH - startX) * kk + PITCH / 2) / PITCH);
    if (idx !== last && (ticks.length === 0 || tt - ticks[ticks.length - 1] > 0.05)) ticks.push(tt);
    last = idx;
  }

  // Third item of the dropdown: top 225, border and padding 16, rows of 67px.
  const menuItemY = 225 + 16 + 67 * 2 + 30;
  const cursor = cursorAt(t, [
    { t: 0.6, x: 1500, y: 1100 },
    { t: 1.4, x: 1330, y: 140 },
    { t: hit - 0.05, x: 1300, y: menuItemY },
    { t: hit + 0.8, x: 1500, y: 900 },
  ]);
  const onItem = t > 1.4 + (hit - 1.45) * 0.8 && t < pageIn;

  return (
    <Ground>
      <Sunburst speed={5} opacity={0.7} y={500} />

      {/* ---- the nav, with its Recipes menu open */}
      {t < pageIn + 0.2 && (
        <div style={{ opacity: 1 - lin(t, pageIn - 0.1, 0.25), transform: `translateY(${-60 * lin(t, pageIn - 0.1, 0.25)}px)` }}>
          <div style={{ position: "absolute", left: 150, right: 150, top: 70, transform: `scale(${pop(t, menuIn)})` }}>
            <Sticker radius={30} depth={STICKER} style={{ height: 120, display: "flex", alignItems: "center", padding: "0 40px", gap: 22 }}>
              <Disc src="italian-chef.jpg" size={70} />
              <Headline size={46} shadow={false}>
                DUELING KEBABS
              </Headline>
              <span style={{ flex: 1 }} />
              <span style={label(26)}>What can I make?</span>
              <span style={{ ...label(26), marginLeft: 36, background: C.yellow, border: `4px solid ${C.ink}`, borderRadius: 14, padding: "6px 16px" }}>Recipes ▾</span>
              <span style={{ ...label(26), marginLeft: 36 }}>Log in</span>
            </Sticker>
          </div>
          {t > menuIn + 0.4 && (
            <div style={{ position: "absolute", left: 1180, top: 225, transformOrigin: "80% 0%", transform: `scale(${pop(t, menuIn + 0.4)})` }}>
              <Sticker radius={22} depth={POP} style={{ padding: 10, width: 340 }}>
                {["All recipes", "By cuisine", "Surprise me"].map((item) => {
                  const focus = item === "Surprise me" && onItem;
                  return (
                    <div key={item} style={{ ...label(28), padding: "16px 20px", borderRadius: 12, background: focus ? C.yellow : "transparent" }}>
                      {item}
                    </div>
                  );
                })}
              </Sticker>
            </div>
          )}
        </div>
      )}
      <Sfx at={menuIn} name="pop" volume={0.4} />
      <Sfx at={menuIn + 0.4} name="tick" volume={0.4} />
      <Sfx at={hit} name="switch" volume={0.6} />

      {/* ---- the page */}
      {t > pageIn && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", transform: `scale(${pop(t, pageIn)})` }}>
            <Headline size={120} style={{ display: "inline-block" }}>
              SURPRISE ME
            </Headline>
            <div style={{ ...text(32, 500, C.muted), marginTop: 18 }}>One recipe out of 126, picked at random.</div>
          </div>

          <div style={{ position: "absolute", left: VIEW.x, top: VIEW.y, width: VIEW.w, height: VIEW.h, transform: `scale(${pop(t, pageIn + 0.1)})` }}>
            <Sticker radius={30} bg={C.surface} depth={POP} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 18, left: 0, height: VIEW.h - 48, transform: `translateX(${VIEW.w / 2 - 6 - TILE / 2 - x}px)` }}>
                {STRIP.map(([title, cuisine], i) => {
                  const won = landed && i === LAND;
                  const near = Math.abs(i * PITCH - x) < PITCH * 3;
                  if (!near) return null;
                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: i * PITCH,
                        top: 0,
                        width: TILE,
                        height: VIEW.h - 48,
                        boxSizing: "border-box",
                        background: won ? C.yellow : C.raised,
                        border: `4px solid ${C.ink}`,
                        borderRadius: 22,
                        boxShadow: PRESS,
                        padding: "26px 28px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transform: won ? `scale(${1 + 0.06 * Math.exp(-(t - spinStart - SPIN) * 5)})` : undefined,
                      }}
                    >
                      <span style={text(36, 600)}>{title}</span>
                      <span>
                        <CuisineTag size={22}>{cuisine}</CuisineTag>
                      </span>
                    </div>
                  );
                })}
              </div>
            </Sticker>
            {/* the pointer */}
            {[-1, 1].map((d) => (
              <svg
                key={d}
                viewBox="0 0 60 44"
                style={{ position: "absolute", left: VIEW.w / 2 - 30, top: d < 0 ? -30 : VIEW.h - 14, width: 60, height: 44, transform: d > 0 ? "scaleY(-1)" : undefined, overflow: "visible" }}
              >
                <path d="M4 4 H56 L30 40 Z" fill={C.brick} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
              </svg>
            ))}
          </div>
        </>
      )}
      {ticks.map((tt, i) => (
        <Sfx key={i} at={tt} name="tick" volume={0.32} />
      ))}

      {/* ---- tonight's dinner */}
      {landed && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 720, display: "flex", justifyContent: "center", transform: `scale(${pop(t, spinStart + SPIN + 0.15)})` }}>
          <Sticker radius={30} depth={POP} style={{ padding: "30px 46px", display: "flex", alignItems: "center", gap: 46 }}>
            <div>
              <div style={label(24, C.muted)}>Tonight you are making</div>
              <Headline size={78} style={{ marginTop: 10 }}>
                MONGOLIAN BEEF
              </Headline>
            </div>
            <div style={{ display: "flex", gap: 18 }}>
              <span style={{ ...text(30, 600), padding: "16px 30px", borderRadius: 16, border: `4px solid ${C.ink}`, background: C.yellow, boxShadow: PRESS }}>Cook this</span>
              <span style={{ ...text(30, 500), padding: "16px 30px", borderRadius: 16, border: `4px solid ${C.ink}`, background: C.raised }}>Spin again</span>
            </div>
          </Sticker>
        </div>
      )}
      <Sfx at={spinStart + SPIN} name="ding" volume={0.5} />
      <Sfx at={spinStart + SPIN + 0.15} name="sparkle" volume={0.45} />

      {t > 0.6 && t < hit + 0.8 && <Cursor x={cursor.x} y={cursor.y} pressed={click(t, hit)} />}
    </Ground>
  );
}
