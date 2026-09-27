import type { ReactNode } from "react";

import { bob, drop, easePress, lin, mix, p, pop, useT } from "../anim";
import { Pencil } from "../art";
import { useScene } from "../scene";
import { C, POP } from "../theme";
import { CuisineTag, Disc, Ground, Headline, label, Sfx, Sticker, Sunburst, text } from "../ui";

const PAD = { x: 500, y: 110, w: 920, h: 900 };
const ROW = 104;
const FIRST_ROW = 250;

// Real titles, in the order the collection lists them by cuisine — the tail
// that scrolls past once "the list kept growing".
const MORE = [
  ["Spaghetti with Meatballs", "Italian"],
  ["Sourdough", "Breads"],
  ["Crème Anglaise", "Desserts"],
  ["Mongolian Beef", "Asian"],
  ["Mac and Cheese", "American"],
  ["Lomo Saltado", "Latin"],
  ["Chicken Tikka Masala", "Indian"],
  ["Cinnamon Babka", "Breads"],
  ["Baba Ganoush", "Mediterranean"],
  ["Red Wine Braised Short Ribs", "French"],
  ["Taiwanese Fried Chicken", "Asian"],
  ["Pasta Al Limone", "Italian"],
  ["Elote", "Latin"],
  ["Creme Brulee", "Desserts"],
  ["Dolsot Bibimbap", "Asian"],
  ["Crab Cakes", "American"],
  ["Challah", "Breads"],
  ["Shrimp Risotto", "Italian"],
  ["Luong Family Eggrolls", "Asian"],
  ["French Onion Soup", "French"],
  ["Instant Pot Chili", "American"],
  ["Pesto Genovese", "Italian"],
  ["Flan", "Desserts"],
  ["Char Siu Pork", "Asian"],
  ["Focaccia Muffins", "Breads"],
  ["Mojo Steak", "Latin"],
  ["Gnocchi a la Parisienne", "French"],
  ["Beef and Broccoli", "Asian"],
  ["Ultimate Banana Bread", "American"],
  ["Pearl Couscous Salad", "Mediterranean"],
  ["Meringue Kisses", "Desserts"],
];

/**
 * The backstory. A notepad drops in and the reasons get written down; the
 * page turns to four real favourites, each stamped with its cuisine badge;
 * then the list starts to run and the counter rolls up to the real number.
 */
export function List() {
  const t = useT();
  const { at, phrase } = useScene();

  const land = 0.7;
  const titleAt = at("l03") + 1.2;

  const reasons: Array<[string, number]> = [
    ["Worth making twice", phrase("l04", "Every recipe")],
    ["Learned over the years", phrase("l04", "Learned")],
    ["Cooked for family", phrase("l04", "cooked for family")],
    ["Tweaked until it's right", phrase("l04", "and tweaked")],
  ];
  const WRITE = 0.75;

  const turn = at("l05") - 0.5;
  const turned = p(t, turn, 0.5, easePress);

  const favourites: Array<[string, string, string, number]> = [
    ["Pad Thai", "Asian", "japanese-sushi.jpg", phrase("l05", "Pad Thai")],
    ["Bolognese", "Italian", "italian-chef.jpg", phrase("l05", "Bolognese")],
    ["Chicken Shawarma", "Mediterranean", "persian-kebab.jpg", phrase("l05", "Chicken Shawarma")],
    ["French Onion Soup", "French", "french-baker.jpg", phrase("l05", "French Onion")],
  ];

  // Growing: the rows start to run upward and keep accelerating.
  const grow = at("l06") + 0.1;
  const dt = Math.max(0, t - grow);
  const scroll = 300 * dt ** 1.7;

  const countFrom = grow + 0.15;
  const count = Math.round(mix(4, 126, p(t, countFrom, 1.9, easePress)));
  const stillDoes = phrase("l06", "It still does");

  // The pencil follows whichever line is being written.
  const writing = reasons.find(([, s]) => t >= s - 0.1 && t <= s + WRITE + 0.2);
  const pencilRow = writing ? reasons.indexOf(writing) : -1;
  const pencilK = writing ? lin(t, writing[1], WRITE) : 0;
  const pencilLen = writing ? writing[0].length * 27 : 0;

  return (
    <Ground>
      <Sunburst speed={4} opacity={0.8} />

      <div
        style={{
          position: "absolute",
          left: PAD.x,
          top: PAD.y,
          width: PAD.w,
          height: PAD.h,
          transformOrigin: "50% 100%",
          transform: `${drop(t, land, 1000)} translateY(${bob(t, 3.8, 5)}px)`,
        }}
      >
        {/* page two, underneath */}
        <Page>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${-scroll}px)` }}>
            <PageTitle>FAVORITES</PageTitle>
            {favourites.map(([title, cuisine, art, when], i) => {
              const s = pop(t, when);
              return (
                <Row key={title} index={i}>
                  <div style={{ display: "flex", alignItems: "center", gap: 26, transform: `scale(${s})`, transformOrigin: "0% 50%" }}>
                    <Disc src={art} size={82} />
                    <span style={{ ...text(48, 600), whiteSpace: "nowrap" }}>{title}</span>
                    <CuisineTag size={26}>{cuisine}</CuisineTag>
                  </div>
                </Row>
              );
            })}
            {MORE.map(([title, cuisine], i) => (
              <Row key={title} index={i + favourites.length}>
                <div style={{ display: "flex", alignItems: "center", gap: 22, paddingLeft: 108, opacity: lin(t, grow - 0.3, 0.3) }}>
                  <span style={{ ...text(44, 500), whiteSpace: "nowrap" }}>{title}</span>
                  <CuisineTag size={24}>{cuisine}</CuisineTag>
                </div>
              </Row>
            ))}
          </div>
        </Page>

        {/* page one, torn back over the binding */}
        {turned < 1 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "50% 0%",
              transform: `perspective(2200px) rotateX(${-100 * turned}deg)`,
              opacity: 1 - lin(t, turn + 0.3, 0.15),
            }}
          >
            <Page>
              <PageTitle>
                <span style={{ clipPath: `inset(0 ${100 - 100 * lin(t, titleAt, 0.6)}% 0 0)`, display: "inline-block" }}>
                  THE LIST
                </span>
              </PageTitle>
              {reasons.map(([line, s], i) => {
                const k = lin(t, s, WRITE);
                const ticked = pop(t, s + WRITE + 0.05);
                return (
                  <Row key={line} index={i}>
                    <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          border: `5px solid ${C.ink}`,
                          borderRadius: 12,
                          background: C.raised,
                          position: "relative",
                          flexShrink: 0,
                        }}
                      >
                        {ticked > 0 && (
                          <svg viewBox="0 0 120 120" style={{ position: "absolute", left: -14, top: -22, width: 84, height: 84, transform: `scale(${ticked})` }}>
                            <path d="M22 62 L50 90 L104 22" fill="none" stroke={C.basil} strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{ ...text(54, 500), clipPath: `inset(-10px ${100 - 100 * k}% -10px 0)` }}>{line}</span>
                    </div>
                  </Row>
                );
              })}
              {pencilRow >= 0 && (
                <svg
                  viewBox="-10 -30 190 80"
                  style={{
                    position: "absolute",
                    left: 266 + pencilK * pencilLen - 10,
                    top: FIRST_ROW + pencilRow * ROW - 6 + Math.sin(t * 40) * 3,
                    width: 190,
                    height: 80,
                    overflow: "visible",
                  }}
                >
                  <Pencil />
                </svg>
              )}
            </Page>
          </div>
        )}

        {/* the binding sits over both pages */}
        <div
          style={{
            position: "absolute",
            left: -10,
            right: -10,
            top: -18,
            height: 70,
            background: C.ink,
            borderRadius: 20,
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
          }}
        >
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} style={{ width: 22, height: 44, borderRadius: 11, background: C.sand, border: `4px solid ${C.ink}` }} />
          ))}
        </div>
      </div>
      <Sfx at={land} name="thock" volume={0.6} />
      {reasons.map(([, s]) => (
        <Sfx key={s} at={s + WRITE + 0.05} name="pop" volume={0.22} />
      ))}
      <Sfx at={turn} name="whoosh" volume={0.22} />
      {favourites.map(([title, , , when]) => (
        <Sfx key={title} at={when} name="thock" volume={0.45} />
      ))}

      {/* the counter */}
      {t > countFrom - 0.1 && (
        <div
          style={{
            position: "absolute",
            left: 1450,
            top: 120,
            transform: `rotate(6deg) scale(${pop(t, countFrom)})`,
            transformOrigin: "50% 50%",
          }}
        >
          <Sticker bg={C.yellow} radius={30} depth={POP} style={{ padding: "22px 34px 16px", textAlign: "center" }}>
            <Headline size={130} color={C.raised} style={{ fontVariantNumeric: "tabular-nums" }}>
              {count}
            </Headline>
            <div style={{ ...label(30), marginTop: 8 }}>recipes</div>
          </Sticker>
          {t > stillDoes && (
            <div style={{ position: "absolute", left: -40, top: 250, transform: `rotate(-5deg) scale(${pop(t, stillDoes)})` }}>
              <Sticker bg={C.basil} radius={999} style={{ padding: "10px 26px", ...label(28, C.raised) }}>
                and counting
              </Sticker>
            </div>
          )}
        </div>
      )}
      <Sfx at={countFrom} name="pop" volume={0.5} />
      <Sfx at={stillDoes} name="sparkle" volume={0.4} />
    </Ground>
  );
}

function Page({ children }: { children: ReactNode }) {
  return (
    <Sticker radius={26} depth={POP} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* ruled lines and the margin */}
      <svg style={{ position: "absolute", inset: 0 }} width={PAD.w} height={PAD.h}>
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} x2={PAD.w} y1={FIRST_ROW + 70 + i * ROW} y2={FIRST_ROW + 70 + i * ROW} stroke={C.teal} strokeWidth={3} opacity={0.22} />
        ))}
        <line x1={150} x2={150} y1={0} y2={PAD.h} stroke={C.brick} strokeWidth={4} opacity={0.45} />
      </svg>
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </Sticker>
  );
}

function PageTitle({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: "absolute", left: 190, top: 96 }}>
      <Headline size={96}>{children}</Headline>
    </div>
  );
}

function Row({ index, children }: { index: number; children: ReactNode }) {
  return <div style={{ position: "absolute", left: 180, right: 20, top: FIRST_ROW + index * ROW, height: 80, display: "flex", alignItems: "center" }}>{children}</div>;
}

