import type { CSSProperties } from "react";

import { easePress, lin, p, pop, useT } from "../anim";
import { Pot, Puff } from "../art";
import { useScene } from "../scene";
import { C, POP, PRESS, STICKER } from "../theme";
import { click, Cursor, cursorAt, Ground, Headline, label, RecipeCard, Sfx, Stamp, Sticker, Sunburst, text, Window } from "../ui";

const WIN = { x: 160, y: 50, w: 1600, h: 990 };
const ORIGIN = { x: WIN.x + 6, y: WIN.y + 6 + 76 }; // content origin in the frame
const PANEL = { x: 60, y: 190, w: 1468 };
const INPUT = { x: 36, y: 136, w: 1180, h: 78 };
const ADD = { x: INPUT.x + INPUT.w + 24, w: 180 };

const TYPED = "pineapple juice";

// The site's real answer for this search against the saved pantry, in its
// real order: ranked by how many typed ingredients a recipe uses, then by
// completeness. Wording is the result card's own.
const RESULTS: Array<{ title: string; cuisine: string; have: number; total: number; need?: string }> = [
  { title: "Teriyaki Chicken", cuisine: "Asian", have: 10, total: 10 },
  { title: "Black Rice", cuisine: "Asian", have: 3, total: 3 },
  { title: "Fresh Pasta", cuisine: "Italian", have: 4, total: 4 },
  { title: "Pancakes", cuisine: "American", have: 7, total: 7 },
  { title: "Vietnamese Pasta (Nui Xao Bo)", cuisine: "Asian", have: 11, total: 12, need: "Elbow pasta (1 box)" },
  { title: "Asian Fusion Spicy Garlic Noodles", cuisine: "Asian", have: 9, total: 10, need: "3 tbsp finely grated parmesan cheese" },
];

/**
 * "What can I make?", driven. Home page CTA → the page → type an extra →
 * the site's real results for it → the visitor's view of the same page.
 */
export function Search() {
  const t = useT();
  const { at, phrase } = useScene();

  // ---- beat 1: the home page's own button
  const openAt = phrase("l17", "Open, What") + 0.1;
  const winAt = openAt + 0.22;

  // ---- beat 2: typing an extra
  const typeStart = phrase("l18", "pineapple juice") - 0.35;
  const PER_CHAR = 0.055;
  const typeEnd = typeStart + TYPED.length * PER_CHAR;
  const addAt = typeEnd + 0.4;
  const typed = t < typeStart ? "" : t < addAt ? TYPED.slice(0, Math.floor((t - typeStart) / PER_CHAR) + 1) : "";

  // ---- beat 3: results
  const resultsAt = at("l19") - 0.15;
  const cookAll = phrase("l19", "Everything you can cook");
  const nearMiss = phrase("l19", "near misses");
  const dealAt = (i: number) => (i === 0 ? resultsAt : i < 4 ? cookAll + (i - 1) * 0.1 : nearMiss + (i - 4) * 0.12);
  const cut = phrase("l19", "just made the cut") + 0.15;

  // ---- beat 4: a visitor
  const visitor = at("l20") - 0.2;
  const noAccount = phrase("l20", "No account needed") + 0.1;
  const visitorTypes = phrase("l20", "Type in what you have");

  const scroll = -390 * p(t, resultsAt - 0.2, 0.8, easePress) * (1 - p(t, visitor, 0.7, easePress));
  const asVisitor = t >= visitor + 0.35;
  const swap = lin(t, visitor + 0.2, 0.3);
  const lift = -58 * p(t, visitor + 0.35, 0.45, easePress);

  const addX = ORIGIN.x + PANEL.x + ADD.x + ADD.w / 2;
  const addY = ORIGIN.y + PANEL.y + INPUT.y + INPUT.h / 2;
  const cursor = cursorAt(t, [
    { t: 0.4, x: 1500, y: 1060 },
    { t: openAt - 0.05, x: 700, y: 640 },
    { t: winAt + 0.5, x: 900, y: 700 },
    { t: typeStart - 0.3, x: ORIGIN.x + PANEL.x + INPUT.x + 600, y: addY + 20 },
    { t: addAt - 0.05, x: addX, y: addY },
    { t: resultsAt, x: addX + 40, y: addY + 120 },
  ]);

  const pending = t > addAt && t < resultsAt;

  return (
    <Ground>
      <Sunburst speed={5} opacity={0.8} y={600} />

      {/* ---- the home page hero, briefly */}
      {t < winAt + 0.3 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", opacity: 1 - lin(t, winAt, 0.2) }}>
          <div style={{ transform: `scale(${pop(t, 0.3)})` }}>
            <Headline size={150} style={{ display: "inline-block" }}>
              WHAT CAN I MAKE?
            </Headline>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 70, transform: `scale(${pop(t, 0.55)})` }}>
            <HomeButton primary pressed={click(t, openAt)}>
              Open the fridge
            </HomeButton>
            <HomeButton>See a recipe</HomeButton>
          </div>
        </div>
      )}
      <Sfx at={openAt} name="switch" volume={0.6} />

      {/* ---- the page */}
      {t > winAt && (
        <div
          style={{
            position: "absolute",
            left: WIN.x,
            top: WIN.y,
            width: WIN.w,
            height: WIN.h,
            transformOrigin: "35% 60%",
            transform: `scale(${pop(t, winAt)})`,
          }}
        >
          <Window url="Dueling Kebabs  ›  What can I make?" style={{ width: "100%", height: "100%" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2000, transform: `translateY(${scroll}px)` }}>
              <div style={{ position: "absolute", left: 60, top: 40 }}>
                <Headline size={80}>WHAT CAN I MAKE?</Headline>
                <div style={{ ...text(30, 500, C.muted), marginTop: 16, position: "relative", height: 40 }}>
                  <span style={{ position: "absolute", whiteSpace: "nowrap", opacity: 1 - swap }}>Matched against your saved pantry.</span>
                  <span style={{ position: "absolute", whiteSpace: "nowrap", opacity: swap }}>
                    Type what you have in. Nothing is saved — it resets when you leave.
                  </span>
                </div>
              </div>

              {/* the panel */}
              <Sticker radius={30} depth={POP} style={{ position: "absolute", left: PANEL.x, top: PANEL.y, width: PANEL.w, height: 360 + lift }}>
                <div style={{ position: "absolute", left: 36, top: 30, ...text(28, 400), opacity: 1 - swap, whiteSpace: "nowrap" }}>
                  Using your pantry — <b style={{ fontWeight: 600 }}>256 items</b>.{" "}
                  <span style={{ textDecoration: "underline", textUnderlineOffset: 6 }}>Adjust it</span>. Anything you add below counts as well.
                </div>
                <div style={{ position: "absolute", left: 36, top: 88 + lift, ...text(28, 600) }}>
                  {asVisitor ? "What do you have?" : "Anything else you have?"}
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: INPUT.x,
                    top: INPUT.y + lift,
                    width: INPUT.w,
                    height: INPUT.h,
                    boxSizing: "border-box",
                    border: `4px solid ${C.ink}`,
                    borderRadius: 16,
                    background: C.raised,
                    display: "flex",
                    alignItems: "center",
                    padding: "0 26px",
                    boxShadow: typed ? `0 0 0 6px ${C.brickSoft}` : "none",
                  }}
                >
                  <span style={text(32, 400, typed ? C.ink : C.muted)}>{typed || "chicken thighs"}</span>
                  {t > typeStart - 0.3 && t < addAt && Math.floor(t * 3) % 2 === 0 && (
                    <span style={{ width: 3, height: 40, background: C.ink, marginLeft: typed ? 3 : -208 }} />
                  )}
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: ADD.x,
                    top: INPUT.y + lift,
                    width: ADD.w,
                    height: INPUT.h,
                    boxSizing: "border-box",
                    border: `4px solid ${C.ink}`,
                    borderRadius: 16,
                    background: C.yellow,
                    display: "grid",
                    placeItems: "center",
                    ...text(32, 600),
                    boxShadow: PRESS,
                    transform: `scale(${1 - 0.06 * click(t, addAt)})`,
                  }}
                >
                  Add
                </div>
                <div style={{ position: "absolute", left: 36, top: 238 + lift, display: "flex", gap: 14 }}>
                  {!asVisitor && t > addAt && <Chip at={addAt + 0.03} t={t} label={TYPED} />}
                  {asVisitor && (
                    <>
                      <Chip at={visitorTypes} t={t} label="chicken thighs" />
                      <Chip at={visitorTypes + 0.35} t={t} label="lemon" />
                      <Chip at={visitorTypes + 0.7} t={t} label="rice" />
                    </>
                  )}
                </div>
                <div style={{ position: "absolute", left: 36, top: 306 + lift, ...text(22, 400, C.muted) }}>
                  Salt, pepper, butter, milk, eggs, water and cooking oil are assumed — no need to list them.
                </div>
              </Sticker>

              {/* results */}
              {pending && <Cooking t={t} since={addAt} />}
              {t > resultsAt && (
                <div style={{ position: "absolute", left: PANEL.x, top: 600, width: PANEL.w, opacity: 1 - lin(t, visitor, 0.3) }}>
                  <div style={{ transform: `scale(${pop(t, resultsAt)})`, transformOrigin: "0% 50%" }}>
                    <Headline size={58}>
                      4 YOU CAN COOK RIGHT NOW
                    </Headline>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26, marginTop: 30 }}>
                    {RESULTS.map((r, i) => {
                      const s = pop(t, dealAt(i));
                      const ready = r.have === r.total;
                      const highlight = !ready && t > nearMiss;
                      return (
                        <div key={r.title} style={{ transform: `scale(${s})`, position: "relative" }}>
                          <RecipeCard
                            title={r.title}
                            cuisine={r.cuisine}
                            titleSize={32}
                            lift={i === 0 ? 1 - lin(t, cut + 1.2, 0.5) : 0}
                            meta={
                              <span style={text(22, ready ? 600 : 400, ready ? C.basil : C.muted)}>
                                {ready ? "All ingredients in" : `${r.have} of ${r.total} ingredients`}
                              </span>
                            }
                            note={
                              r.need ? (
                                <span
                                  style={{
                                    ...text(22, 500, highlight ? C.brick : C.muted),
                                    background: highlight ? C.brickSoft : "transparent",
                                    borderRadius: 8,
                                    padding: "2px 8px",
                                    marginLeft: -8,
                                    alignSelf: "flex-start",
                                  }}
                                >
                                  Need: {r.need}
                                </span>
                              ) : undefined
                            }
                            style={{ height: "100%", boxSizing: "border-box" }}
                          />
                          {i === 0 && (
                            <Stamp at={cut} color={C.basil} size={40} rotate={8} style={{ right: 26, top: 58 }}>
                              MADE THE CUT
                            </Stamp>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Window>
          <Stamp at={noAccount} color={C.teal} size={110} rotate={-6} style={{ left: 400, top: 640 }}>
            NO ACCOUNT NEEDED
          </Stamp>
        </div>
      )}
      <Sfx at={winAt} name="pop" volume={0.5} />
      {Array.from({ length: Math.ceil(TYPED.length / 2) }, (_, i) => (
        <Sfx key={i} at={typeStart + i * 2 * PER_CHAR} name="tick" volume={0.35} />
      ))}
      <Sfx at={addAt} name="switch" volume={0.55} />
      <Sfx at={addAt + 0.03} name="pop" volume={0.4} />
      <Sfx at={resultsAt} name="ding" volume={0.45} />
      <Sfx at={cut} name="stamp" volume={0.5} />
      <Sfx at={cookAll} name="tick" volume={0.35} />
      <Sfx at={nearMiss} name="tick" volume={0.35} />
      <Sfx at={noAccount} name="stamp" volume={0.75} />
      {[0, 0.35, 0.7].map((d) => (
        <Sfx key={d} at={visitorTypes + d} name="pop" volume={0.3} />
      ))}

      {t > 0.4 && t < resultsAt + 0.6 && <Cursor x={cursor.x} y={cursor.y} pressed={Math.max(click(t, openAt), click(t, addAt))} />}
    </Ground>
  );
}

function HomeButton({ children, primary = false, pressed = 0 }: { children: string; primary?: boolean; pressed?: number }) {
  const style: CSSProperties = {
    ...label(34),
    padding: "22px 40px",
    border: `6px solid ${C.ink}`,
    borderRadius: 28,
    background: primary ? C.yellow : C.raised,
    boxShadow: pressed ? PRESS : STICKER,
    transform: `translate(${pressed * 4}px, ${pressed * 4}px)`,
  };
  return <span style={style}>{children}</span>;
}

function Chip({ t, at, label: name }: { t: number; at: number; label: string }) {
  const s = pop(t, at);
  if (s <= 0) return null;
  return (
    <span
      style={{
        ...text(28, 500),
        display: "inline-flex",
        gap: 12,
        alignItems: "center",
        background: C.yellow,
        border: `4px solid ${C.ink}`,
        borderRadius: 999,
        padding: "4px 22px",
        transform: `scale(${s})`,
      }}
    >
      {name} <span aria-hidden>×</span>
    </span>
  );
}

/** The site's waiting state: something being cooked, not a spinner. */
function Cooking({ t, since }: { t: number; since: number }) {
  const k = t - since;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 590, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${pop(t, since + 0.1)})` }}>
      <svg viewBox="0 -60 240 260" style={{ width: 220, height: 238, overflow: "visible" }}>
        {[0, 1, 2].map((i) => {
          const age = (k * 1.2 + i / 3) % 1;
          return <Puff key={i} x={96 + i * 24 + Math.sin(age * 5 + i) * 8} y={50 - age * 90} r={10 + age * 12} />;
        })}
        <Pot lidLift={Math.abs(Math.sin(k * 14)) * 10} lidTilt={Math.sin(k * 11) * 5} />
      </svg>
      {/* The pot scene's own caption and the loader's sub-line, verbatim. */}
      <div style={{ ...text(34, 600), marginTop: 10 }}>Checking the shelves…</div>
      <div style={{ ...text(24, 400, C.muted), marginTop: 6 }}>Matching 126 recipes against your 1 ingredient and staples</div>
    </div>
  );
}
