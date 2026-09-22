"use client"

import { useState } from "react"

export type MarkedIngredient = {
  id: string
  name: string
  required: boolean
  substitution: string | null
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
 * The ingredient list, with an opt-in shopping view.
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

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">Ingredients</h2>

        <button
          type="button"
          role="switch"
          aria-checked={showing}
          onClick={() => setShowing((current) => !current)}
          className="border-border bg-card hover:-translate-y-0.5 focus-visible:ring-ring/50 inline-flex items-center gap-2 rounded-[var(--sk-radius-pill)] border-2 px-3 py-1.5 text-sm font-medium shadow-[var(--sk-shadow-press)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] hover:shadow-[var(--sk-shadow-sticker)] focus-visible:ring-[3px] focus-visible:outline-none"
        >
          Can I cook this?
          {/* The track and knob are drawn rather than themed, so the switch
              reads as the same cartoon hardware as the buttons: hard keyline,
              flat fill, no blur. */}
          <span
            aria-hidden
            className="border-outline relative inline-block h-5 w-9 rounded-[var(--sk-radius-pill)] border-2 transition-colors duration-100"
            style={{
              borderColor: "var(--sk-outline)",
              background: showing ? "var(--sk-basil)" : "var(--sk-sand)",
            }}
          >
            <span
              className="absolute top-[1px] h-3 w-3 rounded-full transition-transform duration-150 ease-[var(--sk-ease-press)]"
              style={{
                background: "var(--sk-surface-raised)",
                border: "2px solid var(--sk-outline)",
                transform: showing ? "translateX(19px)" : "translateX(2px)",
              }}
            />
          </span>
        </button>
      </div>

      {showing && (
        <p className="text-sm">
          {short === 0 ? (
            <span className="font-medium text-[var(--sk-basil)]">
              You have everything for this.
            </span>
          ) : (
            <>
              <span className="font-medium">
                {have} of {totalRequired} ingredients in
              </span>{" "}
              <span className="text-muted-foreground">
                — {short} to pick up, marked below.
              </span>
            </>
          )}
          {!usedPantry && (
            <span className="text-muted-foreground">
              {" "}
              Based on kitchen staples only.
            </span>
          )}
        </p>
      )}

      {groups.length === 0 ? (
        <p className="text-muted-foreground text-sm">No ingredients recorded yet.</p>
      ) : (
        groups.map((group, index) => (
          <div key={group.label ?? `ungrouped-${index}`} className="flex flex-col gap-1.5">
            {group.label && (
              <h3 className="text-muted-foreground text-sm font-medium">{group.label}</h3>
            )}
            {/* overflow-hidden so a highlighted row's fill takes the list's
                rounded corners instead of squaring off against them. */}
            <ul className="border-border overflow-hidden rounded-[var(--sk-radius-md)] border px-4 py-2">
              {group.items.map((item) => {
                const marked = showing && item.required
                const hasIt = marked && item.onHand

                return (
                  <li
                    key={item.id}
                    className="border-border/40 flex flex-col gap-0.5 border-b py-2 text-sm last:border-b-0"
                    /* The bar sits in the row's own left padding rather than on
                       a wrapper, so switching the view never reflows the list. */
                    style={
                      marked
                        ? {
                            marginLeft: -16,
                            marginRight: -16,
                            paddingLeft: 12,
                            paddingRight: 16,
                            borderLeft: `4px solid ${hasIt ? "var(--sk-basil)" : "var(--sk-brick)"}`,
                            background: hasIt
                              ? "var(--sk-basil-soft)"
                              : "var(--sk-brick-soft)",
                          }
                        : undefined
                    }
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span>{item.name}</span>
                      {marked ? (
                        <span
                          className="shrink-0 text-xs font-semibold"
                          style={{
                            color: hasIt ? "var(--sk-basil)" : "var(--sk-brick)",
                          }}
                        >
                          {hasIt ? "have it" : "need it"}
                        </span>
                      ) : (
                        !item.required && (
                          <span className="text-muted-foreground shrink-0 text-xs">
                            optional
                          </span>
                        )
                      )}
                    </span>
                    {item.substitution && (
                      <span className="text-muted-foreground text-xs">
                        or {item.substitution}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}
