import { bob, easeLand, easeReel, lin, p, pop, useT } from "../anim";
import { Globe } from "../globe";
import { useScene } from "../scene";
import { C, PRESS } from "../theme";
import { click, Cursor, cursorAt, Ground, Headline, RecipeCard, Sfx, Sunburst, text, Window } from "../ui";

const WIN = { x: 150, y: 70, w: 1620, h: 940 };
const PADX = 50;
const COLS = 4;
const GAP = 28;
const CARD_W = (WIN.w - 12 - PADX * 2 - GAP * (COLS - 1)) / COLS;
const CARD_H = 196;
const GRID_Y = 316;
const BAR = { y: 76 }; // the window's title bar

type Card = [string, string];

const ALL: Card[] = [
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
const ITALIAN: Card[] = [
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
].map((title) => [title, "Italian"]);
// From src/lib/vegan-menu.ts, with each recipe's cuisine from the database.
const VEGAN: Card[] = [
  ["Baba Ganoush", "Mediterranean"],
  ["Baguettes", "Breads"],
  ["Bang Bang Mien", "Asian"],
  ["Chinese Style Garlic Eggplant", "Asian"],
  ["Crushed Tomato Sauce", "Italian"],
  ["Cucumber Salad", "Asian"],
  ["Deviled Chickpea Bites", "American"],
  ["Focaccia Muffins", "Breads"],
  ["Garlic Smashed Potatoes", "American"],
  ["Ina Garten Panzanella Salad", "Italian"],
  ["Pizza Dough", "Italian"],
  ["Creamy Coconut Cucumber Salad", "Asian"],
];
// The Christmas menu in src/lib/special-menus.ts, in page order: six dishes.
const CHRISTMAS: Card[] = [
  ["Vegan Zucchini Gratin", "American"],
  ["Holiday Star Bread", "Breads"],
  ["All American Beef Stew", "American"],
  ["Mashed Potatoes", "American"],
  ["Savory Meat and Mushroom Hand Pies", "American"],
  ["Super Green Salad", "American"],
];
// Twelve of the 31 recipes an ingredient search for "chicken" returns: the
// ones it stars in, rather than the ones that only use the stock.
const CHICKEN: Card[] = [
  ["Teriyaki Chicken", "Asian"],
  ["Chicken Shawarma", "Mediterranean"],
  ["Chicken Tikka Masala", "Indian"],
  ["Chicken Kabab (Jujeh Kabab)", "Persian"],
  ["Chicken Fried Rice", "Asian"],
  ["Taiwanese Fried Chicken", "Asian"],
  ["Instant Pot Honey Garlic Chicken", "Asian"],
  ["Khao Soi (Chiang Mai Noodle Soup)", "Asian"],
  ["Pomegranate Khoresh with Chicken", "Persian"],
  ["Barberry Khoresh (Khoresh-e Zereshk)", "Persian"],
  ["Orange Khoresh (Khoresh-e Porteqal)", "Persian"],
  ["Rice Veiled in Pastry (Polow-ye Pardehi)", "Persian"],
];
const CHICKEN_COUNT = 31;

// The real counts as of 2026-11-01, cuisines largest first, then the menus.
const CHIPS: Array<[string, number]> = [
  ["All", 169],
  ["American", 37],
  ["Asian", 36],
  ["Desserts", 32],
  ["Italian", 23],
  ["Vegan", 68],
  ["Christmas", 6],
];
const MENU_FROM = 5; // chips from here on are the special menus

const GLOBE = { cx: 1390, cy: 575, size: 760 };
const QUERY = "chicken";
const SEARCH = { right: PADX + 12, top: 140, w: 600, h: 64 };

/**
 * The menu. The collection deals onto the grid; the cuisine, vegan and
 * Christmas filters each reshuffle it; the window slides aside for the globe,
 * which spins; then it comes back for an ingredient search.
 */
export function Menu() {
  const t = useT();
  const { at, phrase } = useScene();

  const winIn = 0.25;
  const dealAt = (i: number) => 0.8 + i * 0.06;

  const browse = phrase("l13", "Browse");
  const filter = phrase("l13", "filter by cuisine");
  const vegan = phrase("l13", "see every vegan");
  const holiday = phrase("l13", "browse holiday menus");
  const spin = phrase("l13", "spin the globe") - 0.15;
  const back = at("l28") - 0.35;
  const searchClick = phrase("l28", "Search the ingredient") - 0.25;
  const typeStart = searchClick + 0.2;
  const PER_CHAR = 0.07;
  const typed = Math.max(0, Math.min(QUERY.length, Math.floor((t - typeStart) / PER_CHAR) + 1));
  const typedEnd = typeStart + QUERY.length * PER_CHAR;
  const results = typedEnd + 0.15;

  // What the grid shows, and when each change starts (card i follows 35ms later).
  const states: Array<{ at: number; cards: Card[] }> = [
    { at: -1, cards: ALL },
    { at: filter + 0.15, cards: ITALIAN },
    { at: vegan + 0.15, cards: VEGAN },
    { at: holiday + 0.15, cards: CHRISTMAS },
    { at: results, cards: CHICKEN },
  ];
  const cardAt = (i: number) => {
    let s = 0;
    while (s + 1 < states.length && t >= states[s + 1].at + i * 0.035) s++;
    const k = s > 0 ? lin(t, states[s].at + i * 0.035, 0.26) : 1;
    return { card: (k >= 0.5 ? states[s] : states[s - 1] ?? states[s]).cards[i], k };
  };
  const chipOn =
    t >= results ? "" : t >= holiday ? "Christmas" : t >= vegan ? "Vegan" : t >= filter ? "Italian" : "All";

  const aside = p(t, spin - 0.1, 0.6, easeLand) * (1 - p(t, back, 0.5, easeLand));

  // Cursor: browses the first row, presses each filter, leaves for the globe,
  // then comes back to the search field.
  const chip = (i: number) => ({ x: WIN.x + chipCentre(i), y: WIN.y + BAR.y + 250 });
  const field = { x: WIN.x + WIN.w - SEARCH.right - SEARCH.w + 80, y: WIN.y + BAR.y + SEARCH.top + SEARCH.h / 2 };
  const cursor = cursorAt(t, [
    { t: browse - 0.4, x: 1900, y: 1100 },
    { t: browse + 0.3, x: WIN.x + PADX + CARD_W * 0.5, y: WIN.y + BAR.y + GRID_Y + 110 },
    { t: browse + 0.8, x: WIN.x + PADX + CARD_W * 1.5 + GAP, y: WIN.y + BAR.y + GRID_Y + 120 },
    { t: filter - 0.05, ...chip(4) },
    { t: vegan - 0.05, ...chip(5) },
    { t: holiday - 0.05, ...chip(6) },
    { t: spin + 0.3, x: 1900, y: 1150 },
    { t: back + 0.5, x: 1900, y: 1150 },
    { t: searchClick, ...field },
    { t: results + 0.6, x: field.x + 60, y: field.y + 240 },
  ]);
  const hover = (i: number) => {
    const cx = WIN.x + PADX + (i % COLS) * (CARD_W + GAP);
    const cy = WIN.y + BAR.y + GRID_Y + Math.floor(i / COLS) * (CARD_H + GAP);
    return t < filter && cursor.x > cx && cursor.x < cx + CARD_W && cursor.y > cy && cursor.y < cy + CARD_H ? 1 : 0;
  };
  const pressed = Math.max(click(t, filter), click(t, vegan), click(t, holiday), click(t, searchClick));

  // The globe: a fast spin that settles into a slow turn, then away.
  const spinK = easeReel(lin(t, spin, 2.4));
  const rot: [number, number] = [-360 * spinK - (t - spin) * 12, -18];
  const globeScale = pop(t, spin) * (1 - p(t, back, 0.3, easeLand));

  const subtitle = t >= results ? `${CHICKEN_COUNT} recipes with chicken.` : `${CHIPS[0][1]} recipes, no account needed.`;

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
            <div style={{ ...text(30, 500, C.muted), marginTop: 14 }}>{subtitle}</div>
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

          {/* the ingredient search, as the site words it */}
          <div
            style={{
              position: "absolute",
              right: SEARCH.right,
              top: SEARCH.top,
              width: SEARCH.w,
              height: SEARCH.h,
              boxSizing: "border-box",
              border: `4px solid ${C.ink}`,
              borderRadius: 16,
              background: C.raised,
              boxShadow: t >= searchClick ? PRESS : "none",
              display: "flex",
              alignItems: "center",
              padding: "0 22px",
              ...text(26, 500, typed && t >= typeStart ? C.ink : C.muted),
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {t >= typeStart ? (
              <>
                {QUERY.slice(0, typed)}
                <span style={{ width: 3, height: 32, marginLeft: 2, background: C.ink, opacity: Math.floor(t * 3) % 2 }} />
              </>
            ) : (
              "Search by ingredient, e.g. chicken, tomatoes"
            )}
          </div>

          <div style={{ position: "absolute", left: PADX, top: 222, display: "flex", gap: 16, alignItems: "center" }}>
            {CHIPS.map(([name, n], i) => {
              const on = name === chipOn;
              const press = name === "Italian" ? click(t, filter) : name === "Vegan" ? click(t, vegan) : name === "Christmas" ? click(t, holiday) : 0;
              return (
                <span key={name} style={{ display: "inline-flex", alignItems: "center", gap: 16 }}>
                  {i === MENU_FROM && <span style={{ width: 4, height: 44, borderRadius: 2, background: C.ink, opacity: 0.3 }} />}
                  <span
                    style={{
                      ...text(26, 500),
                      padding: "8px 22px",
                      border: `4px solid ${C.ink}`,
                      borderRadius: 999,
                      background: on ? (i >= MENU_FROM ? C.basilSoft : C.yellow) : C.raised,
                      boxShadow: on ? PRESS : "none",
                      transform: `scale(${1 - press * 0.08}) scale(${pop(t, dealAt(0) - 0.3 + i * 0.04)})`,
                      display: "inline-flex",
                      gap: 10,
                    }}
                  >
                    {name} <span style={{ color: on ? C.ink : C.muted }}>{n}</span>
                  </span>
                </span>
              );
            })}
          </div>

          {ALL.map((_, i) => {
            const { card, k } = cardAt(i);
            const sx = Math.abs(Math.cos(k * Math.PI));
            if (!card && k >= 0.5) return null;
            const shown = card ?? ALL[i];
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
                  title={shown[0]}
                  cuisine={shown[1]}
                  lift={hover(i)}
                  titleSize={shown[0].length > 26 ? 28 : 34}
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
      <Sfx at={vegan} name="switch" volume={0.6} />
      <Sfx at={holiday} name="switch" volume={0.6} />
      <Sfx at={searchClick} name="switch" volume={0.55} />
      {Array.from(QUERY, (_, i) => i)
        .filter((i) => i % 2 === 0)
        .map((i) => (
          <Sfx key={`k${i}`} at={typeStart + i * PER_CHAR} name="tick" volume={0.3} />
        ))}
      <Sfx at={results} name="pop" volume={0.45} />

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
        </div>
      )}
      <Sfx at={spin} name="whoosh" volume={0.35} />

      {t > browse - 0.4 && t < results + 0.8 && !(t > spin + 0.3 && t < back + 0.5) && (
        <Cursor x={cursor.x} y={cursor.y} pressed={pressed} />
      )}
    </Ground>
  );
}

function chipCentre(index: number) {
  // Approximate chip widths at 26px Fredoka: label, count, padding and gap,
  // plus the divider before the menus.
  let x = PADX;
  for (let i = 0; i < index; i++) {
    const [name, n] = CHIPS[i];
    x += (name.length + String(n).length + 1) * 14 + 44 + 8 + 16;
    if (i + 1 === MENU_FROM) x += 20;
  }
  const [name, n] = CHIPS[index];
  return x + ((name.length + String(n).length + 1) * 14 + 52) / 2;
}
