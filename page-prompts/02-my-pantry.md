# My Pantry

**Status:** Draft
**Page order:** 2 of 8 (roadmap build sequence step 3)

*Example of an efficient Claude Code prompt — this structure is what makes a plan-mode round trip land in one pass instead of several: **Objective** (one sentence, who it's for), **Data** (exact tables/fields, not vague), **States** (every UI state, especially edge cases), **Design system** (which existing tokens/components to reuse), **Out of scope** (what NOT to build), **Assets** (exact file paths, chosen before writing the prompt). This file is the fully worked version — use it as the model for the others.*

---

## Context from our planning (check before sending this prompt)

- This isn't placeholder data. Your pantry is a real, three-tier structure that already exists in your private chef skill's files:
  - **Staples** — `references/pantry-inventory.md` in the chef skill: ~150 shelf-stable items across 17 categories (Grains & Rice, Pasta & Noodles, Flours & Baking Staples, Nuts & Seeds, Legumes & Beans, Dried Herbs & Spices, Seasoning Blends/Rubs/Soup Bases, Oils, Vinegars, Sauces/Pastes/Condiments, Broths/Stocks/Bouillon, Wine, Canned/Jarred Goods, Dairy/Milk Alternatives/Creams, Sweeteners, Fresh Aromatics, Extracts/Flavored Waters, Specialty/International) — plus 7 base staples hardcoded in the skill's `SKILL.md` that don't fit a category: salt, pepper, butter, milk, eggs, water, general cooking oil.
  - **Standing proteins** — also hardcoded in `SKILL.md`, always assumed on hand: frozen salmon, frozen chicken thighs, frozen chicken breast, ground beef, sliced steak, frozen shrimp.
  - **Fridge / freezer** — the skill re-asks for these every conversation rather than storing them; this app upgrades that into a saved, editable list.
- You decided to keep the real 17-category structure for staples rather than flattening it into one list — that's reflected in the Design system section below.
- Hand Claude Code the actual contents of `references/pantry-inventory.md` and the two hardcoded lists from `SKILL.md` as seed data, rather than re-describing them from memory.

## Prompt to send to Claude Code

**Objective:** Let you, the admin, view and edit your pantry — organized the same way your chef skill already organizes it: categorized staples, a standing-proteins section, and simple fridge/freezer lists.

**Data:** Reads and writes the `pantry_items` table (columns: `id`, `section` [staple / standing_protein / fridge / freezer], `category` [one of the 17 staple categories — null for the other three sections], `name`, `created_at`). Single-admin table, gated behind the admin login — no per-user scoping or row-level security needed.

**States:** Empty state per section; adding an item (staples ask for a category, the other three don't); deleting an item (with confirm); loading; a save error. Staples and standing proteins are both always assumed on hand once added — no quantities or expiration dates in this MVP; fridge/freezer items are just a persistent list.

**Design system:** Reuse the `Card` and `Button` components from `components/ui`, styled with the Springfield Kitchen tokens already in `globals.css` (`--sk-*`). Four sections — Staples, Standing Proteins, Fridge, Freezer — staples alone gets a secondary grouping by category; reuse the tab pattern from `components/ui/tabs.tsx` for that inner grouping if it isn't too crowded, otherwise collapsible category headers.

**Out of scope:** No barcode scanning, no quantity tracking, no expiration dates, no suggested-items autocomplete, no per-category reordering UI. Just add/list/delete, categorized the way the source data already is.

**Assets:** None new — icon-only, no illustration needed for this page.

**Seed data:** Import directly from the chef skill's files — `references/pantry-inventory.md` (~150 items → staples, categorized) and the two hardcoded lists in `SKILL.md` (6 standing proteins, 7 base staples). Paste the actual file contents into the Claude Code prompt rather than re-describing them.
