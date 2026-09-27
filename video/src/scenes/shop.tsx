import { easeLand, easePress, lin, p, pop, useT } from "../anim";
import { Lemon } from "../art";
import { useScene } from "../scene";
import { C, POP, PRESS } from "../theme";
import { click, Cursor, cursorAt, CuisineTag, Ground, Headline, label, Sfx, Stamp, Sticker, Sunburst, text, Window } from "../ui";

const WIN = { x: 90, y: 60, w: 1260, h: 960 };
const ORIGIN = { x: WIN.x + 6, y: WIN.y + 6 + 76 };
const PADX = 56;
const ROWS_Y = 350;
const ROW_H = 66;

// Eight of the recipe's sixteen real ingredient lines, with the verdict the
// site's matcher gives each against the saved pantry.
const ROWS: Array<[string, boolean]> = [
  ["2 tablespoons olive oil", true],
  ["1 tablespoon lemon zest", false],
  ["1 tablespoon freshly squeezed lemon juice", false],
  ["3 cloves garlic, minced", true],
  ["2 teaspoons sweet paprika", true],
  ["2 teaspoons ground cumin", true],
  ["1 teaspoon ground turmeric", true],
  ["2 pounds boneless, skinless chicken thighs", true],
];

const NOTE = { x: 1420, y: 250, w: 420, h: 470 };

/**
 * The quick shop. One recipe, one switch: the list colours itself in, and the
 * only thing on it that is not already in the kitchen goes onto the note.
 */
export function Shop() {
  const t = useT();
  const { phrase } = useScene();

  const winIn = 0.35;
  const flipAt = phrase("l21", "flip") + 0.3;
  const on = p(t, flipAt, 0.22, easePress);

  const greenAt = phrase("l22", "What you have");
  const redAt = phrase("l22", "What you need");
  const haves = ROWS.map((r, i) => [i, r[1]] as const).filter(([, h]) => h);
  const colourAt = (i: number) =>
    ROWS[i][1] ? greenAt + haves.findIndex(([j]) => j === i) * 0.09 : redAt + (i - 1) * 0.16;

  const lemonAt = phrase("l23", "it's a lemon");
  const noteAt = lemonAt - 0.3;
  const flyK = lin(t, lemonAt, 0.75);
  const landed = t > lemonAt + 0.75;
  const doneAt = phrase("l23", "Shopping list") + 0.55;

  const switchX = ORIGIN.x + WIN.w - 12 - PADX - 100;
  const switchY = ORIGIN.y + 268;
  const cursor = cursorAt(t, [
    { t: 1.2, x: 1700, y: 1100 },
    { t: 2.4, x: 900, y: 360 },
    { t: flipAt - 0.05, x: switchX, y: switchY },
    { t: flipAt + 1.2, x: switchX + 120, y: switchY + 260 },
  ]);

  // The lemon's arc from the need rows to the note.
  const from = { x: ORIGIN.x + 820, y: ORIGIN.y + ROWS_Y + ROW_H * 1.5 - 40 };
  const to = { x: NOTE.x + 40, y: NOTE.y + 180 };
  const fx = from.x + (to.x - from.x) * easePress(flyK);
  const fy = from.y + (to.y - from.y) * flyK - Math.sin(flyK * Math.PI) * 260;

  return (
    <Ground>
      <Sunburst speed={4} opacity={0.7} x={NOTE.x + NOTE.w / 2} y={NOTE.y + 200} />

      <div style={{ position: "absolute", left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, transform: `scale(${pop(t, winIn)})` }}>
        <Window url="Dueling Kebabs  ›  Chicken Shawarma" style={{ width: "100%", height: "100%" }}>
          <div style={{ position: "absolute", left: PADX, top: 34, ...text(26, 400, C.muted), textDecoration: "underline", textUnderlineOffset: 6 }}>
            ← All recipes
          </div>
          <div style={{ position: "absolute", left: PADX, top: 88 }}>
            <Headline size={86}>CHICKEN SHAWARMA</Headline>
          </div>
          <div style={{ position: "absolute", left: PADX, top: 196 }}>
            <CuisineTag size={24}>Mediterranean</CuisineTag>
          </div>

          <div style={{ position: "absolute", left: PADX, right: PADX, top: 250, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={text(40, 600)}>Ingredients</span>
            <span
              style={{
                ...text(28, 600),
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
                padding: "10px 16px 10px 26px",
                border: `4px solid ${C.ink}`,
                borderRadius: 999,
                background: C.raised,
                boxShadow: PRESS,
                transform: `scale(${1 - 0.06 * click(t, flipAt)})`,
              }}
            >
              Can I cook this?
              <span
                style={{
                  width: 84,
                  height: 44,
                  borderRadius: 999,
                  border: `4px solid ${C.ink}`,
                  background: on > 0.5 ? C.basil : C.sand,
                  position: "relative",
                  boxSizing: "border-box",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: 3 + on * 40,
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: C.raised,
                    border: `4px solid ${C.ink}`,
                    boxSizing: "border-box",
                  }}
                />
              </span>
            </span>
          </div>

          {ROWS.map(([name, have], i) => {
            const k = p(t, colourAt(i), 0.3, easeLand);
            const shown = t >= colourAt(i);
            const tint = have ? C.basil : C.brick;
            const bump = !have && t > redAt ? 1 + 0.025 * Math.sin((t - colourAt(i)) * 14) * Math.exp(-(t - colourAt(i)) * 3) : 1;
            return (
              <div
                key={name}
                style={{
                  position: "absolute",
                  left: PADX - 20,
                  right: PADX - 20,
                  top: ROWS_Y + i * ROW_H,
                  height: ROW_H - 8,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 22px 0 20px",
                  background: shown ? (have ? C.basilSoft : C.brickSoft) : "transparent",
                  borderLeft: `8px solid ${shown ? tint : "transparent"}`,
                  transform: `scale(${bump})`,
                  transformOrigin: "0% 50%",
                }}
              >
                <span style={{ ...text(30, 400), display: "flex", gap: 18, alignItems: "center" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.ink }} />
                  {name}
                </span>
                {shown && (
                  <span style={{ ...label(22, tint), transform: `scale(${k})` }}>{have ? "have it" : "need it"}</span>
                )}
              </div>
            );
          })}
        </Window>
      </div>
      <Sfx at={winIn} name="pop" volume={0.5} />
      <Sfx at={flipAt} name="switch" volume={0.7} />
      {ROWS.map((r, i) => (
        <Sfx key={i} at={colourAt(i)} name="tick" volume={r[1] ? 0.25 : 0.45} />
      ))}

      {/* the note */}
      {t > noteAt && (
        <div style={{ position: "absolute", left: NOTE.x, top: NOTE.y, width: NOTE.w, height: NOTE.h, transform: `rotate(4deg) scale(${pop(t, noteAt)})` }}>
          <Sticker bg={C.yellow} radius={18} depth={POP} style={{ position: "absolute", inset: 0, padding: "40px 36px" }}>
            <div style={{ position: "absolute", left: "50%", top: -26, width: 150, height: 44, marginLeft: -75, background: C.tealSoft, border: `4px solid ${C.ink}`, borderRadius: 6, transform: "rotate(-3deg)" }} />
            <Headline size={52} color={C.raised}>
              SHOPPING
            </Headline>
            <Headline size={52} color={C.raised} style={{ marginTop: 4 }}>
              LIST
            </Headline>
            {landed && (
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 50, transform: `scale(${pop(t, lemonAt + 0.75)})`, transformOrigin: "0% 50%" }}>
                <span style={{ width: 46, height: 46, border: `5px solid ${C.ink}`, borderRadius: 10, background: C.raised, position: "relative" }}>
                  {t > doneAt && (
                    <svg viewBox="0 0 120 120" style={{ position: "absolute", left: -12, top: -20, width: 76, height: 76, transform: `scale(${pop(t, doneAt)})` }}>
                      <path d="M22 62 L50 90 L104 22" fill="none" stroke={C.basil} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span style={text(46, 600)}>1 lemon</span>
              </div>
            )}
          </Sticker>
          <Stamp at={doneAt} color={C.basil} size={96} rotate={-14} style={{ left: 70, top: 320 }}>
            DONE
          </Stamp>
        </div>
      )}
      <Sfx at={noteAt} name="pop" volume={0.5} />
      <Sfx at={lemonAt} name="whoosh" volume={0.3} />
      <Sfx at={lemonAt + 0.75} name="thock" volume={0.5} />
      <Sfx at={doneAt} name="stamp" volume={0.8} />
      <Sfx at={doneAt + 0.05} name="ding" volume={0.35} />

      {t > lemonAt && !landed && (
        <svg
          viewBox="-5 -5 125 95"
          style={{
            position: "absolute",
            left: fx - 60,
            top: fy - 45,
            width: 150,
            height: 112,
            overflow: "visible",
            transform: `rotate(${flyK * 400}deg) scale(${1 - 0.35 * flyK})`,
          }}
        >
          <Lemon />
        </svg>
      )}

      {t > 1.2 && t < flipAt + 1.3 && <Cursor x={cursor.x} y={cursor.y} pressed={click(t, flipAt)} />}
    </Ground>
  );
}
