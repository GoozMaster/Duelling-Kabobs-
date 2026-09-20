# Admin Dashboard

**Status:** Draft (intentionally the thinnest of the eight)
**Page order:** 8 of 8 (roadmap build sequence step 10 — built last on purpose)

*Example of an efficient Claude Code prompt — this structure is what makes a plan-mode round trip land in one pass instead of several: **Objective** (one sentence, who it's for), **Data** (exact tables/fields, not vague), **States** (every UI state, especially edge cases), **Design system** (which existing tokens/components to reuse), **Out of scope** (what NOT to build), **Assets** (exact file paths, chosen before writing the prompt). See `02-my-pantry.md` for the fully worked version this shape is drawn from.*

---

## Context from our planning (check before sending this prompt)

- This page is deliberately built last, and deliberately left thin here, on purpose: the whole point of the ordering in the roadmap doc is that you'll know what's actually useful to see on a dashboard only after living with the other seven pages for a while — needs-review count, recent additions, and a pantry shortcut are guesses, not settled decisions.
- Before sending this prompt, revisit it and replace the guesses below with what you've actually found yourself wanting.

## Prompt to send to Claude Code (revise before sending — see note above)

**Objective:** Admin-only overview page — a starting point, not a final answer.

**Data:** Likely reads `recipes` (needs-review count, recent additions) and `pantry_items` (a shortcut into My Pantry). Revise once you know what's actually useful.

**States:** TBD — genuinely open.

**Design system:** Reuse the `Card` layout patterns already established on the other admin pages.

**Out of scope:** TBD.

**Assets:** None expected.
