"use client"

import { useState } from "react"

import type { InstructionBlock } from "@/lib/instructions"

/**
 * The method, as a checklist: tick a step to strike it through, "Reset" clears
 * every tick. State is plain component state on purpose, so every page load
 * starts unticked — a half-finished tick list from a previous cook would be
 * wrong the next time.
 *
 * The panel uses a sand-tinted surface (a token that has its own night value)
 * so the method reads as a distinct block against the page and the white
 * ingredient card.
 */
export function MethodSteps({ blocks }: { blocks: InstructionBlock[] }) {
  const [done, setDone] = useState<ReadonlySet<number>>(new Set())

  function toggle(index: number) {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  return (
    <div className="flex max-w-[68ch] flex-col gap-5 rounded-[var(--sk-radius-lg)] border-[3px] border-[var(--sk-outline)] bg-[color-mix(in_srgb,var(--sk-sand)_40%,var(--sk-surface))] p-5 text-[var(--sk-ink)] shadow-[var(--sk-shadow-sticker)] sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="text-base font-semibold">
          {done.size} of {blocks.filter((b) => b.kind === "step").length} steps done
        </span>
        <button
          type="button"
          onClick={() => setDone(new Set())}
          disabled={done.size === 0}
          className="inline-flex items-center rounded-[var(--sk-radius-pill)] border-2 border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] px-4 py-1 text-base font-semibold shadow-[var(--sk-shadow-press)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] hover:-translate-y-0.5 hover:shadow-[var(--sk-shadow-sticker)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50 disabled:hover:translate-y-0"
        >
          Reset
        </button>
      </div>

      {blocks.map((block, index) =>
        block.kind === "heading" ? (
          <h3 key={index} className="font-display text-xl">
            {block.text}
          </h3>
        ) : (
          <label
            key={index}
            className="flex cursor-pointer items-start gap-3 text-lg leading-[1.7]"
          >
            <input
              type="checkbox"
              checked={done.has(index)}
              onChange={() => toggle(index)}
              className="mt-[0.6em] size-5 shrink-0 cursor-pointer accent-[var(--sk-teal)]"
            />
            <span className={done.has(index) ? "line-through opacity-60" : undefined}>
              {block.text}
            </span>
          </label>
        ),
      )}
    </div>
  )
}
