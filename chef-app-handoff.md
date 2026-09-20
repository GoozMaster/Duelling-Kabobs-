# Chef/Recipe App — Build Handoff Document

**Status:** Scope revised (single-admin pivot, 2026-09-19). See the living build roadmap for full detail and rationale: https://claude.ai/code/artifact/9fe52a21-2fea-403e-b860-09be0f74a7f5
**Origin:** Build-to-learn portfolio track (idea #3) — absorbs GoozMaster's private "chef" pantry-matching skill into a deployed, public, zero-ongoing-cost web app.

---

## 1. Goal

Turn the private pantry-chef Claude skill into a real, deployed, public proof-of-concept web app — now specifically a personal recipe showcase you curate, with a lightweight public matching tool layered on top. Built to demonstrate AI tooling / development skills as part of a portfolio, alongside a companion portfolio website. Must run at **$0 ongoing cost** — no API usage of any kind in the live app.

## 2. Accounts

- **Single admin account.** Only GoozMaster can sign in, and only the admin can add, edit, or delete recipes and manage the pantry. There is no general user-account system, no invited-user tier, and no sign-up flow for anyone else.
- Admin auth via Supabase Auth: email/password **and** Google OAuth, both scoped to the one recognized admin identity rather than a roles table.
- Everyone else uses the site with no account at all — see §7.
- No AI usage anywhere in the running app, so there's no cost-based reason to differentiate users further.

## 3. Recipe Intake

Three ways to add a recipe, all **admin-only**:

### 3a. Manual form
Fields: title, ingredients, instructions, cuisine style.
- Each ingredient is tagged **required** or **optional/garnish**.
- Each ingredient has an optional free-text **substitution** field (your own knowledge, e.g., "buttermilk → milk + lemon juice"). No AI generation — purely manual entry.
- **Open question:** several real recipes (e.g., Yeasted Doughnuts) are really 2–3 sub-recipes under one title — a dough, a coating, a glaze. Decide whether the schema groups ingredients by sub-component or flattens everything into one list for MVP.

### 3b. URL import (non-AI)
- Parses **schema.org/structured recipe markup** — no LLM call.
- Always shows a **pre-filled, editable form** with whatever was successfully extracted — never a hard failure.
- Falls back to the blank manual form if a site has no structured markup.

### 3c. CSV bulk upload
- **One row per recipe.**
- Columns: `title`, `instructions`, `cuisine`, `ingredients` (packed into one cell, semicolon-separated).
- Every bulk-imported recipe is flagged **"needs review"** until you manually tag required/optional and add substitutions.
- This is the path for migrating your real recipe collection: **[Recipes — Neema's Recipe Collection](https://docs.google.com/document/d/1ssBIuWu0b_rvd1xnpOGbMF51gUmRNUzRdY_-hRsvMaI/edit)** — roughly 150 recipes across 10 categories (Drinks, Asian, Italian, American, French, Latin, Mediterranean, Indian, Breads, Desserts). Stays available indefinitely for re-syncing as that doc keeps changing.
- Duplicate detection: fuzzy match on `title`. Possible duplicates shown side-by-side for overwrite / skip / keep-both — never a silent overwrite or skip.

## 4. Cuisine / Style

- **Single shared list**, not per-user (there's only one account that can add recipes, so a per-user list no longer makes sense).
- Seeded directly from your real recipe collection's own categories: Drinks, Asian, Italian, American, French, Latin, Mediterranean, Indian, Breads, Desserts.
- Includes an "Other" option for anything new you add later.

## 5. Pantry / Inventory (admin's own)

Mirrors the structure of the original private skill, persistent and editable, admin-only:
1. **Pantry staples** — sticky, shelf-stable, always assumed on hand once added.
2. **Fridge items** — optional, persistent.
3. **Freezer items** — optional, persistent.

**Open item:** the original skill's hardcoded "always-available staples" (salt, pepper, butter, milk, eggs, water, oil) and "standing proteins" list aren't recorded anywhere the build process can read automatically — they need to come from you directly to seed this page.

## 6. Search / Matching ("What can I make?")

Two modes on one page:
- **Admin mode** (signed in): pulls automatically from your own persistent pantry (§5).
- **Public mode** (no account): visitors type an ingredient list on the spot. Nothing is saved — it resets on refresh. No pantry, no account, no persistence for public visitors.

Both modes share the same matching logic:
- **Fuzzy/normalized ingredient matching**: case-insensitive, strips common qualifiers ("boneless," "low-sodium," "fresh," "large").
- A recipe matches if all **required** ingredients are on hand (or covered by a stored substitution). Missing **optional** ingredients don't disqualify a match.
- **No AI-powered web search fallback** — cut entirely, no cost-free substitute exists.

## 7. Privacy & Visibility

- **Recipes are public by default.** The whole point of this pivot is a showcase: anyone can browse the full recipe library and view recipe detail pages without an account.
- **Open question:** is every admin-added recipe public immediately, or is there a draft/unpublished state for recipes still being cleaned up before they go live?
- Only the admin can add, edit, or delete recipes, or manage the pantry. Public visitors get read-only recipe browsing plus the ephemeral ingredient-matching tool in §6.
- No public visitor accounts exist, so there's nothing per-visitor to keep private in the first place.

## 8. Pages (MVP set)

| Page | Audience | Purpose |
| --- | --- | --- |
| Home | Public | Showcase entry point — a ~3-second animated intro clip (dueling-kebabs), then reveals the page: a recipe highlight and links to browse/search |
| Recipes | Public | Browse/filter all published recipes by cuisine |
| Recipe Detail | Public view, admin edit | Full recipe view for anyone; edit/delete/clear-needs-review controls appear only when signed in as admin |
| Search / "What can I make?" | Both (different modes) | Public: ephemeral typed ingredient list. Admin: pulls from the saved pantry |
| Admin Login | Admin only | Single-account sign-in |
| My Pantry | Admin only | Staples/fridge/freezer editor |
| Add / Edit Recipe | Admin only | Manual form / URL import / CSV upload, one page with a mode toggle |
| Admin Dashboard | Admin only | Overview — needs-review count, recent additions, shortcuts. Built last, once it's clear what's actually useful to show |

## 9. Tech Stack

- **Frontend:** Next.js, hosted on **Vercel** (free/hobby tier)
- **Backend / DB / Auth:** **Supabase** (free tier — Postgres + built-in Auth)
- **No Anthropic API, no third-party search API, no LLM usage of any kind in the running app.**

## 10. Explicitly Out of Scope (for now)

- Any AI-powered feature at runtime.
- Multiple admin/invited-user accounts — a single admin identity only, for this build.
- Persistent accounts or saved state for public visitors (no pantry, no favorites, no login).
- Rate-limiting / spend caps (moot — no billed API usage exists in the app).

## 11. Open Items to Resolve During Build

- Whether ingredients can be grouped by sub-component (several real recipes are multi-part) or get flattened for MVP.
- Whether recipes need a draft/unpublished state, or are public the moment they're added.
- Your actual pantry staples/standing-proteins list — needed directly from you to seed §5.
- Specific schema.org parsing library/approach for the URL importer.
- Exact fuzzy-match/normalization rules for ingredient matching (§6).

---

*This document reflects the single-admin pivot confirmed 2026-09-19. The living build roadmap (linked above) carries the full build sequence, site map, and rationale — treat this file as the locked reference for scope, and the roadmap doc as the working plan.*
