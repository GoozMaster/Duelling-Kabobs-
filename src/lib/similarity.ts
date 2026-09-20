/**
 * Title similarity for CSV duplicate detection.
 *
 * Dice's coefficient over character bigrams: 2·|shared bigrams| / (|a| + |b|).
 * Local, deterministic, no service and no cost — the whole app is built to run
 * at zero ongoing spend, so a hosted fuzzy-match API was never an option.
 *
 * Chosen over edit distance because it is insensitive to word order and to
 * inserted words, which is how recipe titles actually differ:
 *   "Chicken Teriyaki Stir-Fry" vs "Teriyaki Chicken Stir Fry"
 * Levenshtein scores that pair poorly; bigram overlap scores it high.
 */

export const DUPLICATE_THRESHOLD = 0.85

/** Lowercase, strip punctuation, collapse whitespace. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function bigrams(value: string): Map<string, number> {
  const counts = new Map<string, number>()

  for (let i = 0; i < value.length - 1; i++) {
    const pair = value.slice(i, i + 2)
    counts.set(pair, (counts.get(pair) ?? 0) + 1)
  }

  return counts
}

/** 0 = nothing in common, 1 = identical once normalized. */
export function titleSimilarity(a: string, b: string): number {
  const left = normalize(a)
  const right = normalize(b)

  if (!left || !right) return 0
  if (left === right) return 1

  // Bigrams need at least two characters; fall back to exact comparison, which
  // the equality check above has already ruled out.
  if (left.length < 2 || right.length < 2) return 0

  const leftGrams = bigrams(left)
  const rightGrams = bigrams(right)

  let shared = 0
  for (const [pair, count] of leftGrams) {
    const other = rightGrams.get(pair)
    if (other) shared += Math.min(count, other)
  }

  return (2 * shared) / (left.length - 1 + (right.length - 1))
}

export type TitleMatch<T> = { candidate: T; score: number }

/** The single best match at or above the threshold, if there is one. */
export function findBestMatch<T>(
  title: string,
  candidates: T[],
  titleOf: (candidate: T) => string,
  threshold = DUPLICATE_THRESHOLD,
): TitleMatch<T> | null {
  let best: TitleMatch<T> | null = null

  for (const candidate of candidates) {
    const score = titleSimilarity(title, titleOf(candidate))
    if (score >= threshold && (!best || score > best.score)) {
      best = { candidate, score }
    }
  }

  return best
}
