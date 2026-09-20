# Recipes (public browse)

**Status:** Draft
**Page order:** 4 of 8 (roadmap build sequence step 5)

*Example of an efficient Claude Code prompt — this structure is what makes a plan-mode round trip land in one pass instead of several: **Objective** (one sentence, who it's for), **Data** (exact tables/fields, not vague), **States** (every UI state, especially edge cases), **Design system** (which existing tokens/components to reuse), **Out of scope** (what NOT to build), **Assets** (exact file paths, chosen before writing the prompt). See `02-my-pantry.md` for the fully worked version this shape is drawn from.*

---

## Context from our planning (check before sending this prompt)

- Public page, no account needed to view it. This is the showcase half of the pivot — anyone can browse everything you've published.
- Depends on the draft/published decision from `03-add-edit-recipe.md`: the query here needs to know whether it's `WHERE published = true` or just `SELECT *`.
- Worth deciding before this prompt: should the "needs review" badge (used internally while you're cleaning up a bulk-imported recipe) even be visible to public visitors, or is it admin-only? It probably shouldn't show to the public, but that's not yet an explicit decision.
- Cuisine filter uses the shared list seeded from your real collection: Drinks, Asian, Italian, American, French, Latin, Mediterranean, Indian, Breads, Desserts.
- Sort order and pagination-vs-infinite-scroll are still open — pick one before sending this prompt so Claude Code isn't guessing.

## Prompt to send to Claude Code

**Objective:** Public page where anyone can browse and filter your published recipes by cuisine — no account required.

**Data:** Reads `recipes` (filtered to published only, if that state exists) and the shared `cuisines` list for the filter control.

**States:** Grid/list of recipe cards; empty state (no recipes yet, or none matching the selected filter); cuisine filter (dropdown or chip row); loading; [pagination or infinite scroll — decide before sending].

**Design system:** `Card` from `components/ui`; Springfield Kitchen tokens; consider echoing the cuisine-badge visual language from `components/home/cuisine-discs.tsx` for the filter chips, since that's already an established pattern on the homepage.

**Out of scope:** No admin edit controls here — those live on Recipe Detail. No "needs review" badge shown to public visitors [confirm].

**Assets:** None new — uses whatever cover imagery, if any, gets attached per recipe (none planned for MVP unless you want one).
