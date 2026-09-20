# Add / Edit Recipe (manual form)

**Status:** Draft
**Page order:** 3 of 8 (roadmap build sequence step 4 — manual form only; URL import and CSV bulk upload are a later pass, step 8)

*Example of an efficient Claude Code prompt — this structure is what makes a plan-mode round trip land in one pass instead of several: **Objective** (one sentence, who it's for), **Data** (exact tables/fields, not vague), **States** (every UI state, especially edge cases), **Design system** (which existing tokens/components to reuse), **Out of scope** (what NOT to build), **Assets** (exact file paths, chosen before writing the prompt). See `02-my-pantry.md` for the fully worked version this shape is drawn from.*

---

## Context from our planning (check before sending this prompt)

- Two open schema questions genuinely need an answer before this prompt goes out, because they change the `ingredients` table shape:
  1. **Sub-components.** Several of your real recipes aren't flat ingredient lists — "Yeasted Doughnuts," for instance, is really three sub-recipes (dough, cinnamon sugar, chocolate glaze) under one title. Decide whether ingredients can be grouped by sub-component or get flattened into one list for this MVP.
  2. **Draft vs. published.** Is every recipe you add here public the moment you save it, or is there a draft/unpublished state so you can clean a recipe up before it shows on the public Recipes page?
- Admin-only — gated the same way as My Pantry, no per-user scoping.
- Cuisine is now a single shared list (not per-user), seeded from your real recipe collection's own categories: Drinks, Asian, Italian, American, French, Latin, Mediterranean, Indian, Breads, Desserts.
- This is deliberately the first page you populate with real content: after building it, hand-enter a first batch from your Google Doc ([Recipes — Neema's Recipe Collection](https://docs.google.com/document/d/1ssBIuWu0b_rvd1xnpOGbMF51gUmRNUzRdY_-hRsvMaI/edit)), picking a couple of awkward ones on purpose (the multi-component Yeasted Doughnuts, the dumpling recipe with its cooking-time table) so the form proves itself against real edge cases before the CSV bulk-upload pass tries to move the other ~145.

## Prompt to send to Claude Code

**Objective:** Admin-only manual recipe entry and editing — title, ingredients, instructions, cuisine.

**Data:** Writes to `recipes` (`id`, `title`, `instructions`, `cuisine`, `needs_review`, `created_at` — plus a published/draft flag if that's resolved above) and `ingredients` (`id`, `recipe_id`, `name`, `required` [bool], `substitution` [text, nullable] — plus sub-component grouping if that's resolved above).

**States:** Blank form; adding/removing ingredient rows; toggling an ingredient required vs. optional; adding free-text substitution notes; cuisine picker (dropdown from the shared `cuisines` list, with an "Other" option that adds a new value); save success; validation errors (missing title, zero ingredients); edit mode pre-filled from an existing recipe.

**Design system:** `Input`, `Label`, `Button`, `Dropdown-menu` from `components/ui`; Springfield Kitchen tokens.

**Out of scope (this pass):** URL import and CSV bulk upload — both come later, once this manual path and the schema are proven against real recipes.

**Assets:** None new.
