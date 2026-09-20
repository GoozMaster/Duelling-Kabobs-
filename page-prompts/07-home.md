# Home

**Status:** Draft
**Page order:** 7 of 8 (roadmap build sequence step 9) — deliberately near the end, once there's real recipe data to feature

*Example of an efficient Claude Code prompt — this structure is what makes a plan-mode round trip land in one pass instead of several: **Objective** (one sentence, who it's for), **Data** (exact tables/fields, not vague), **States** (every UI state, especially edge cases), **Design system** (which existing tokens/components to reuse), **Out of scope** (what NOT to build), **Assets** (exact file paths, chosen before writing the prompt). See `02-my-pantry.md` for the fully worked version this shape is drawn from.*

---

## Context from our planning (check before sending this prompt)

- The homepage isn't starting from nothing — "The Sunburst" is already built (`src/app/page.tsx`, `components/home/*`): the `Overture` intro, `Sunburst` hero, `CuisineDiscs`, `PantryProof`, scroll-triggered `Reveal` sections, and a sky/clouds CTA footer. This prompt is a targeted revision, not a rebuild.
- The one confirmed change: `Overture`'s scroll-driven kebab-duel intro becomes a ~3-second animation that autoplays once on load, then reveals the rest of the page — no scroll trigger. Keep `Overture`'s existing staging (nav bar underneath, sunburst hero behind it) as the frame the clip resolves into.
- That intro clip is a real generated video/GIF asset that needs to be created first (see the roadmap doc's visual & animation asset workflow section) — pick the tool, generate it, and drop the file into `src/assets/` *before* sending this prompt, not during.
- The `ACCOUNT_HREF` constant in `page.tsx` currently points at the placeholder anchor `#start` — this is the point where it gets replaced with the real `/login` route built in `01-admin-login.md`.
- New addition beyond the original build: a real recipe highlight/showcase section, now that Recipes and Recipe Detail exist with real content. Decide what "featured" means (most recent? manually flagged?) before sending this prompt.

## Prompt to send to Claude Code

**Objective:** Revise the existing Home page: swap the scroll-driven intro for a ~3-second autoplay clip, wire the login link to the real `/login` route, and add a real recipe highlight section.

**Data:** Reads a small number of featured `recipes` for the highlight section [confirm the "featured" rule above].

**States:** Intro clip playing (first ~3s, no user interaction needed); intro resolved → homepage revealed; recipe highlight populated vs. empty (before any recipes exist).

**Design system:** No changes to the existing Springfield Kitchen styling in `home.module.css` — only `Overture`'s trigger mechanism and asset change, plus the new highlight section styled to match the existing sections.

**Out of scope:** Redesigning `Sunburst`, `CuisineDiscs`, or `PantryProof` — those stay as already built.

**Assets:** The generated ~3-second dueling-kebabs video/GIF clip — exact file path once it's created and placed in `src/assets/`.
