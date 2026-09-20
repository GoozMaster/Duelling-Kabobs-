# Search / "What can I make?"

**Status:** Draft
**Page order:** 6 of 8 (roadmap build sequence step 7)

*Example of an efficient Claude Code prompt — this structure is what makes a plan-mode round trip land in one pass instead of several: **Objective** (one sentence, who it's for), **Data** (exact tables/fields, not vague), **States** (every UI state, especially edge cases), **Design system** (which existing tokens/components to reuse), **Out of scope** (what NOT to build), **Assets** (exact file paths, chosen before writing the prompt). See `02-my-pantry.md` for the fully worked version this shape is drawn from.*

---

## Context from our planning (check before sending this prompt)

- This is the core feature of the whole app, and it's built deliberately last (after Recipes, Recipe Detail, and My Pantry all have real data) so the matching logic can be tuned against reality instead of guessed at against an empty database.
- Two modes on one page, not two separate pages:
  - **Public:** visitor types an ingredient list on the spot. Nothing is saved — it resets on refresh. No pantry, no account.
  - **Admin (signed in):** pulls automatically from your saved pantry (`pantry_items`) instead of a typed list.
- Matching rule from the original scope: a recipe matches if all **required** ingredients are on hand (or covered by a stored substitution); missing **optional** ingredients don't disqualify a match.
- The exact fuzzy/normalization rules are still open — case-insensitive matching and stripping common qualifiers ("boneless," "fresh," "low-sodium," "large") were the original intent, but the precise word list and matching approach need to be nailed down before this prompt, since it's the single most important piece of logic in the app. Consider writing a short, explicit list of qualifiers to strip rather than leaving it to Claude Code to invent one.
- No AI-powered fallback of any kind — this was cut project-wide to keep the app at $0 ongoing cost.

## Prompt to send to Claude Code

**Objective:** Let anyone find recipes they can make right now — from a typed ingredient list if they're a public visitor, or automatically from the saved pantry if signed in as admin.

**Data:** Reads `recipes`, `ingredients` (including substitutions); admin mode also reads `pantry_items`.

**States:** Public — empty input, typing/adding ingredients, results list, no-matches state; Admin — pre-filled from the pantry automatically, a link back to My Pantry to adjust it, same results UI; loading.

**Design system:** `Input`, `Badge`, `Card` from `components/ui`; Springfield Kitchen tokens.

**Out of scope:** No AI or web-search fallback when nothing matches (cut from the original private skill with no replacement); no saved search history for public visitors.

**Assets:** None new.

**Shared logic note:** the fuzzy-matching/normalization rule should be one utility function used by both modes, not duplicated — say so explicitly in the prompt.
