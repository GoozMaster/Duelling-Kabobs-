# Chef App — Page Prompts Index

One file per page from the site map, each holding a draft prompt to paste into Claude Code (in plan mode — see the roadmap doc for why). Work through them in build order. Update the status column here as you go, so this table alone tells you how much is left before the site is done.

**Legend:** Draft = drafted from our planning conversations, not yet reviewed by you · Ready = reviewed/finalized, ready to send to Claude Code · Built = Claude Code has completed it and it's working in the app.

| # | Page | File | Status |
| --- | --- | --- | --- |
| 1 | Admin Login | `01-admin-login.md` | Draft |
| 2 | My Pantry | `02-my-pantry.md` | Draft |
| 3 | Add / Edit Recipe (manual form) | `03-add-edit-recipe.md` | Draft |
| 4 | Recipes (public browse) | `04-recipes.md` | Draft |
| 5 | Recipe Detail | `05-recipe-detail.md` | Draft |
| 6 | Search / "What can I make?" | `06-search-what-can-i-make.md` | Draft |
| 7 | Home | `07-home.md` | Draft |
| 8 | Admin Dashboard | `08-admin-dashboard.md` | Draft |

**Not a page, but still needed first:** the database schema (build sequence step 1 in the roadmap doc) isn't page-specific, so it doesn't get its own file here — say the word if you want that drafted too before you start on `01-admin-login.md`.

## The shape every prompt follows

*Example of an efficient Claude Code prompt — this structure is what makes a plan-mode round trip land in one pass instead of several: **Objective** (one sentence, who it's for), **Data** (exact tables/fields, not vague), **States** (every UI state, especially edge cases), **Design system** (which existing tokens/components to reuse), **Out of scope** (what NOT to build), **Assets** (exact file paths, chosen before writing the prompt). See `02-my-pantry.md` for the fully worked version this shape is drawn from.*

## Updating this file as you go

When you finalize a page's prompt, change its status to **Ready**. When Claude Code finishes building it, change it to **Built**. No other bookkeeping needed — this table is the whole progress record.
