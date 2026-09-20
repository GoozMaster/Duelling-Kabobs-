# Recipe Detail

**Status:** Draft
**Page order:** 5 of 8 (roadmap build sequence step 6)

*Example of an efficient Claude Code prompt — this structure is what makes a plan-mode round trip land in one pass instead of several: **Objective** (one sentence, who it's for), **Data** (exact tables/fields, not vague), **States** (every UI state, especially edge cases), **Design system** (which existing tokens/components to reuse), **Out of scope** (what NOT to build), **Assets** (exact file paths, chosen before writing the prompt). See `02-my-pantry.md` for the fully worked version this shape is drawn from.*

---

## Context from our planning (check before sending this prompt)

- One page, two audiences: public visitors get a read-only view; you, signed in as admin, get edit/delete/clear-needs-review controls on the same page rather than a separate admin route.
- If the sub-component grouping question from `03-add-edit-recipe.md` was resolved as "yes, support sub-components," this page's ingredient list needs to render those groups (e.g., "For the dough," "For the glaze") rather than one flat list — make sure that decision is settled and mentioned in this prompt.
- Requires the draft/published decision too: a public visitor hitting the URL for an unpublished recipe should get a not-found state, not the recipe.

## Prompt to send to Claude Code

**Objective:** Full recipe view for anyone; edit, delete, and "mark reviewed" controls appear only when signed in as admin.

**Data:** Reads one `recipes` row and its `ingredients`; admin mode also writes to both (edit fields, delete the row, clear `needs_review`).

**States:** Public view — title, instructions, ingredient list with substitution notes shown, cuisine tag; admin view adds edit/delete buttons and a "mark reviewed" button when `needs_review` is true; loading; not-found (invalid id, or an unpublished recipe requested by a public visitor).

**Design system:** Reuse the card/heading treatment from the Recipes page; `Badge` from `components/ui` for cuisine and (admin-only) needs-review.

**Out of scope:** No comments, ratings, or sharing controls.

**Assets:** None new.
