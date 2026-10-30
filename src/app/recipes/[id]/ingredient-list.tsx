"use client"

import { useState } from "react"

export type MarkedIngredient = {
  id: string
  name: string
  required: boolean
  substitution: string | null
  /** Set when the recipe is on the vegan menu and this line needs a swap. */
  veganSwap?: string | null
  onHand: boolean
}

export type MarkedGroup = {
  label: string | null
  items: MarkedIngredient[]
}

type Props = {
  groups: MarkedGroup[]
  /** Required ingredients the viewer already has, and how many there are. */
  have: number
  totalRequired: number
  /** True when the viewer's saved pantry counted, not just the base staples. */
  usedPantry: boolean
}

/**
 * The ingredient list, as its own card, with an opt-in shopping view.
 *
 * A white card with the keyline, a yellow title strip and the sticker shadow,
 * so the list reads as the thing you cook from rather than more text on the
 * page's cream. On wide screens it rides alongside the method (the caller
 * makes it sticky), so it is still in view at the last step.
 *
 * OFF BY DEFAULT, ALWAYS. The recipe is the thing people came for; a wall of
 * red and green before anyone asked for it would be reading the page at them.
 * The toggle is also not remembered between visits — a stored preference would
 * mean arriving at a recipe already coloured in by a decision made days ago on
 * a different one.
 *
 * Colour is never the only signal. Each row that changes also gains a word —
 * "have it" or "need it" — so the list still works for anyone who cannot
 * separate the two greens and reds, and so it still makes sense printed.
 *
 * Optional ingredients stay neutral whichever way the switch is thrown. They
 * cannot stop you cooking, so colouring them "need it" would pad the shopping
 * list with things you do not need to buy.
 */
export function IngredientList({ groups, have, totalRequired, usedPantry }: Props) {
  const [showing, setShowing] = useState(false)

  const short = totalRequired - have
  const count = groups.reduce((sum, group) => sum + group.items.length, 0)

  return (
    <section
      aria-labelledby="ingredients-title"
      className="overflow-hidden rounded-[var(--sk-radius-lg)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] shadow-[var(--sk-shadow-pop)]"
    >
      <div className="flex items-center justify-between gap-3 border-b-[3px] border-[var(--sk-outline)] bg-[var(--sk-yellow)] px-5 py-4 text-[var(--sk-on-yellow)]">
        <h2 id="ingredients-title" className="font-display text-2xl leading-none">
          Ingredients
        </h2>
        {count > 0 && (
          <span className="text-base font-semibold">
            {count} {count === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="text-muted-foreground px-5 py-8 text-center">
          No ingredients written up for this one yet.
        </p>
      ) : (
        <>
          {/* A switch with nothing to check against is a control that does
              nothing, so it only appears once there is a list to colour in. */}
          <div className="flex flex-col gap-2 border-b-2 border-[var(--sk-outline)]/15 px-5 py-3">
            <button
              type="button"
              role="switch"
              aria-checked={showing}
              onClick={() => setShowing((current) => !current)}
              className="focus-visible:ring-ring/50 inline-flex w-fit items-center gap-3 rounded-[var(--sk-radius-pill)] py-1 text-base font-semibold focus-visible:ring-[3px] focus-visible:outline-none"
            >
              {/* The track and knob are drawn rather than themed, so the switch
                  reads as the same cartoon hardware as the buttons: hard
                  keyline, flat fill, no blur. Travel = 44 wide − 2×2 border −
                  2×2 padding − 16 knob = 20px. */}
              <span
                aria-hidden
                className="inline-flex h-6 w-11 shrink-0 items-center rounded-[var(--sk-radius-pill)] border-2 p-[2px] transition-colors duration-100"
                style={{
                  borderColor: "var(--sk-outline)",
                  background: showing ? "var(--sk-basil)" : "var(--sk-sand)",
                }}
              >
                <span
                  className="block size-4 shrink-0 rounded-full transition-transform duration-150 ease-[var(--sk-ease-press)]"
                  style={{
                    background: "var(--sk-surface-raised)",
                    border: "2px solid var(--sk-outline)",
                    transform: showing ? "translateX(20px)" : "translateX(0)",
                  }}
                />
              </span>
              Can I cook this?
            </button>

            {showing && (
              <p className="text-[15px]">
                {short === 0 ? (
                  <span className="font-semibold text-[var(--sk-basil)]">
                    You have everything for this.
                  </span>
                ) : (
                  <>
                    <span className="font-semibold">
                      You have {have} of {totalRequired}.
                    </span>{" "}
                    {short} to pick up, marked below.
                  </>
                )}
                {!usedPantry && (
                  <span className="text-muted-foreground"> Based on kitchen staples only.</span>
                )}
              </p>
            )}
          </div>

          {groups.map((group, index) => (
            <div key={group.label ?? `ungrouped-${index}`}>
              {group.label && (
                <h3 className="font-display border-b-2 border-[var(--sk-outline)]/15 bg-[var(--sk-sand)] px-5 py-2 text-base text-[var(--sk-ink)]">
                  {group.label}
                </h3>
              )}
              <ul className="px-5 py-2">
                {group.items.map((item) => {
                  const marked = showing && item.required
                  const hasIt = marked && item.onHand

                  return (
                    <li
                      key={item.id}
                      className="grid grid-cols-[14px_1fr] items-baseline gap-3 border-b border-[var(--sk-outline)]/12 py-2.5 text-[17px] leading-snug last:border-b-0"
                      /* The bar sits in the row's own left padding rather than
                         on a wrapper, so switching the view never reflows. */
                      style={
                        marked
                          ? {
                              marginInline: -20,
                              paddingLeft: 16,
                              paddingRight: 20,
                              borderLeft: `4px solid ${hasIt ? "var(--sk-basil)" : "var(--sk-brick)"}`,
                              background: hasIt ? "var(--sk-basil-soft)" : "var(--sk-brick-soft)",
                            }
                          : undefined
                      }
                    >
                      <span
                        aria-hidden
                        className="size-3 translate-y-[1px] rounded-full border-2 border-[var(--sk-outline)] bg-[var(--sk-yellow)]"
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="flex items-baseline justify-between gap-3">
                          <span>{item.name}</span>
                          {marked ? (
                            <span
                              className="shrink-0 text-sm font-semibold"
                              style={{ color: hasIt ? "var(--sk-basil)" : "var(--sk-brick)" }}
                            >
                              {hasIt ? "have it" : "need it"}
                            </span>
                          ) : (
                            !item.required && (
                              <span className="text-muted-foreground shrink-0 text-sm">
                                optional
                              </span>
                            )
                          )}
                        </span>
                        {item.veganSwap && (
                          <span className="text-[15px] font-semibold text-[var(--sk-basil)]">
                            (vegan: {item.veganSwap})
                          </span>
                        )}
                        {item.substitution && (
                          <span className="text-muted-foreground text-[15px]">
                            or {item.substitution}
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </>
      )}
    </section>
  )
}
