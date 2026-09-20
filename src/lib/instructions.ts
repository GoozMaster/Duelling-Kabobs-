export type InstructionBlock =
  | { kind: "heading"; text: string }
  | { kind: "step"; text: string }

/**
 * Splits stored instruction text into renderable blocks.
 *
 * WHY THIS DOES SO LITTLE:
 * the imported text is not uniform, and the variants cannot be told apart
 * reliably.
 *   - "Beef Chow Mein": clean newline-separated steps, no numbering
 *   - "Khao Soi": bare "Step 1" / "Step 2" lines acting as headings
 *   - "Chinese Style Garlic Eggplant": "Step 1: Prepare the eggplant" headings
 *     AND surviving "1." "2." numbering beneath them
 *
 * Rendering an <ol> over these produces "1. Step 1" and "3. 1. Finely chop".
 * Stripping the stray numbers is worse: a leading "2." might be the recipe's
 * second step or the second sub-step under a heading, and those mean different
 * things to someone cooking. Guessing wrong does not look broken — it silently
 * reorders the method.
 *
 * So: every line is rendered verbatim, and only a line that is unambiguously a
 * heading — "Step" followed by a number and nothing else but an optional title
 * — is promoted. The worst case is text that looks slightly untidy rather than
 * text that is quietly wrong.
 */
export function parseInstructions(raw: string | null | undefined): InstructionBlock[] {
  if (!raw) return []

  const blocks: InstructionBlock[] = []

  for (const line of raw.split(/\r?\n/)) {
    const text = line.trim()
    if (!text) continue

    // "Step 1", "Step 2:", "Step 3: Prepare the eggplant", "Day 1: Prepare
    // Starter" — but not "Step away from the pan" or "Steps 1-3 can be done
    // ahead", where the digit does not follow the word directly.
    //
    // The length guard is measured, not guessed: across all 126 recipes, every
    // one of the 83 "Step N" lines is under 40 characters, because real
    // headings are short. It stops a future "Step 2 is when the dough should
    // have doubled…" — a sentence, not a heading — from being promoted.
    const heading =
      text.length <= 60 ? text.match(/^(Step|Day)\s*(\d+)\s*[:.\-–—]?\s*(.*)$/i) : null

    if (heading) {
      const [, word, number, title] = heading
      const label = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      blocks.push({
        kind: "heading",
        text: title ? `${label} ${number}: ${title}` : `${label} ${number}`,
      })
      continue
    }

    blocks.push({ kind: "step", text })
  }

  return blocks
}
