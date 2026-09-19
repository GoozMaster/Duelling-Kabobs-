# Chef/Recipe App — Build Handoff Document

**Status:** Scope locked via process interview. Ready for build phase.
**Origin:** Build-to-learn portfolio track (idea #3) — absorbs GoozMaster's private "chef" pantry-matching skill into a deployed, public, zero-ongoing-cost web app.

---

## 1. Goal

Turn the private pantry-chef Claude skill into a real, deployed, public proof-of-concept web app for recipe management and ingredient-based recipe lookup. Built to demonstrate AI tooling / development skills as part of a portfolio, alongside a companion portfolio website. Must run at **$0 ongoing cost** — no API usage of any kind in the live app.

## 2. Accounts

- **Single account type.** No tiers, no gated features.
- Auth via Supabase Auth: email/password **and** Google OAuth.
- No AI usage anywhere in the running app, so there's no cost-based reason to differentiate users. (An earlier "owner tier" for GoozMaster + Crystal was considered and explicitly dropped once all AI-dependent features were cut or replaced with non-AI equivalents.)

## 3. Recipe Intake

Three ways to add a recipe, all available to every user:

### 3a. Manual form
Fields: title, ingredients, instructions, cuisine style.
- Each ingredient is tagged **required** or **optional/garnish** by the user.
- Each ingredient has an optional free-text **substitution** field (user's own knowledge, e.g., "buttermilk → milk + lemon juice"). No AI generation — purely user-entered.

### 3b. URL import (non-AI)
- Parses **schema.org/structured recipe markup** (Recipe schema, common on most modern recipe sites) — no LLM call.
- Always shows a **pre-filled, editable form** with whatever was successfully extracted — never a hard failure. Partial extraction is fine; user fills the gaps.
- Falls back to the blank manual form if a site has no structured markup at all.

### 3c. CSV bulk upload
- **One row per recipe.**
- Columns: `title`, `instructions`, `cuisine`, `ingredients` (ingredients packed into a single cell, separated by **semicolons** — e.g., `chicken thighs; soy sauce; ginger; scallions`).
- No required/optional tags or substitutions captured at this stage.
- Every bulk-imported recipe is flagged **"needs review"**:
  - Badge shown wherever the recipe appears (recipe list, search results, detail page).
  - Until reviewed, **all ingredients are treated as required by default** in search matching (safest assumption — recipe still shows up in results, just may under-match).
  - User manually tags required/optional (and adds substitutions) later via the recipe detail/edit page to clear the "needs review" state.
- This is also the path for GoozMaster's **Google Doc migration** — he fills out the CSV template from his existing doc rather than a custom parser.
- **Repeatable / redundancy uploads:** the CSV upload stays available indefinitely (not one-time-only), in case GoozMaster keeps the Google Doc updated as a parallel backup and wants to re-sync periodically.
  - Duplicate detection: fuzzy match on `title`.
  - Possible duplicates are shown **side-by-side** (existing vs. incoming) for the user to choose **overwrite / skip / keep both** — never a silent overwrite or silent skip.

## 4. Cuisine / Style

- **Per-user dropdown**, not global. Each account has its own growing list.
- Seeded with a curated starter list of common cuisines.
- Includes an "Other" option — typing a new value adds it to *that user's* dropdown for future recipes.
- Never shared or visible across accounts (avoids clutter/spam from public signups).

## 5. Pantry / Inventory (per user)

Mirrors the structure of the original private skill, now persistent and editable per account:
1. **Pantry staples** — sticky, shelf-stable, always assumed on hand once added.
2. **Fridge items** — optional, persistent (user-managed list, not re-entered each session).
3. **Freezer items** — optional, persistent (user-managed list, not re-entered each session).

*(Note: the original skill's "always-available staples" — salt, pepper, butter, milk, eggs, water, oil — and hardcoded "standing proteins" list were specific to GoozMaster's personal setup and were not explicitly carried into the multi-tenant app design. Confirm during build whether the app should ship a default staples list for new accounts, or start every user's pantry empty.)*

## 6. Search / Matching ("What can I make?")

- **Fuzzy/normalized ingredient matching**: case-insensitive, strips common qualifiers (e.g., "boneless," "low-sodium," "fresh," "large") so pantry entries match recipe ingredients loosely rather than requiring exact strings.
- A recipe is a match if:
  - All **required** ingredients are on hand, OR covered by a stored substitution the user has on hand instead.
  - Missing **optional** ingredients don't disqualify a match.
- **No AI-powered web search fallback.** The original private skill's "search the web when nothing matches" feature was cut entirely — no non-AI equivalent was viable, and it was the one feature with no cost-free substitute.

## 7. Privacy

- All recipes and pantry data are **private to their owner**. No shared/public discovery layer, no browsing other users' recipes.
- A "make this recipe public" toggle was discussed as a **possible future feature**, explicitly out of scope for this build.

## 8. Pages (MVP set)

1. **Landing / Login**
2. **Dashboard** — overview, possibly a "what can I make right now" shortcut
3. **My Recipes** — list/grid, filterable by cuisine
4. **My Pantry** — staples / fridge / freezer editor
5. **Search / Lookup** — the core "what can I make" matching feature and results
6. **Recipe Detail** — full view, edit (including clearing "needs review" tags), delete
7. **Add Recipe** — manual form / URL import / CSV upload, as one page with mode toggle (not a modal, given form complexity)

## 9. Tech Stack

- **Frontend:** Next.js, hosted on **Vercel** (free/hobby tier)
- **Backend / DB / Auth:** **Supabase** (free tier — Postgres + built-in Auth)
- **No Anthropic API, no third-party search API, no LLM usage of any kind in the running app.** This chat (the design/build conversation with Claude) is the only place AI is used — to design and write the code itself, not to power any live app feature.

## 10. Explicitly Out of Scope (for now)

- Any AI-powered feature at runtime (URL parsing was originally AI-based, then replaced with non-AI schema.org parsing; substitutions were originally AI-generated, then replaced with manual user entry; web search fallback was cut with no replacement).
- Owner/admin account tier (dropped once no AI costs remained to gate).
- Public/shared recipe discovery.
- Global (cross-user) cuisine list.
- Rate-limiting / spend caps (moot — no billed API usage exists in the app).

## 11. Open Items to Resolve During Build

- Whether new accounts start with a default/seeded pantry staples list, or an empty pantry (see note in section 5).
- Exact starter list of cuisines to seed the per-user dropdown with.
- CSV template file itself (column headers, example row) — should be produced as a downloadable template in-app before GoozMaster does his Google Doc migration.
- Specific schema.org parsing library/approach for the URL importer.

---

*This document reflects the full scope as confirmed through a structured process interview. Treat it as the locked reference for the build phase — bring it into the dedicated project for this app.*
