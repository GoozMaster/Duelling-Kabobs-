# Chef App — Master Build Prompt

*Generated 2026-09-20 from `chef-app-handoff.md`, `chef-app-build-roadmap.md`, and `page-prompts/01–08` in the Chef App Claude Project, plus the real seed data in the private `chef` skill's own files. This file consolidates those into one prompt per page/section so you can hand the whole thing to Claude Code instead of pasting eight separate files.*

---

## How to use this file

1. Open this repo in Claude Code and start in **plan mode**.
2. Paste (or point Claude Code at) this whole file, with this instruction:

   > Work through the numbered sections below **in order**, starting with Section 0. Treat each section as its own plan → build round trip: propose a plan for that section only, wait for my approval, implement it, then stop and move to the next section rather than building ahead. Do not start a later section until the one before it is working.

3. Sections are ordered so nothing gets built before the data or auth it depends on exists — don't reorder them.
4. A few items below are marked **ASSUMED DEFAULT** — reasonable choices made to avoid Claude Code guessing, but not decisions you were asked to confirm word-for-word. Skim those before Section 0; edit this file directly if you want something different, since a correction here is far cheaper than a correction after Claude Code has built against the wrong assumption.

---

## Resolved decisions (apply throughout)

These were open questions in the original page-prompt drafts. They're now settled and every section below is written against them:

- **Ingredient sub-components:** supported. Ingredients can carry an optional group label (e.g. "Dough", "Cinnamon Sugar", "Glaze") so multi-part recipes like Yeasted Doughnuts render as labeled groups instead of one flat list. Ungrouped ingredients just have a null group.
- **Draft vs. published:** no draft state. Every recipe is public the instant it's saved — no `published` flag, no unpublished/not-found branch to build.
- **Recipes page:** alphabetical by title, infinite scroll (not paginated).
- **Home "featured" recipes:** random. No `featured` flag/column — the Home page selects N recipes at random on each load.

**ASSUMED DEFAULT** (edit this file if you want something else, then hand it to Claude Code):
- Admin is recognized via an `ADMIN_EMAIL` environment variable checked against the signed-in Supabase user's email — not a roles table.
- A non-admin email that successfully authenticates via Supabase (email/password or Google) is immediately signed back out with an on-screen explanation, rather than left in a signed-in-but-powerless state.
- The "needs review" badge (used for CSV-imported recipes awaiting cleanup) is admin-only — never shown to public visitors.
- URL import uses schema.org/JSON-LD parsing via `cheerio` (already zero-cost, no LLM) — see Section 3.
- Duplicate detection on CSV import uses a simple title-similarity check (e.g. Dice's coefficient / trigram similarity ≥ 0.85) implemented as a small local utility — no new paid service.

---

## Section 0 — Database schema (foundation, not a page)

**Objective:** Stand up the Postgres schema in Supabase that every other section depends on. Single-admin model — no per-user scoping, no multi-tenant rows anywhere.

**Tables:**

`cuisines`
- `name` (text, primary key)
- `created_at` (timestamptz, default now())
- Seed rows: Drinks, Asian, Italian, American, French, Latin, Mediterranean, Indian, Breads, Desserts, Other

`recipes`
- `id` (uuid, primary key, default gen_random_uuid())
- `title` (text, not null)
- `instructions` (text, not null)
- `cuisine` (text, references `cuisines(name)`)
- `needs_review` (boolean, not null, default false) — true only for CSV bulk imports awaiting cleanup
- `created_at` (timestamptz, not null, default now())
- No `published` column, no `featured` column (see Resolved decisions above)

`ingredients`
- `id` (uuid, primary key, default gen_random_uuid())
- `recipe_id` (uuid, references `recipes(id)` on delete cascade)
- `group_label` (text, nullable) — e.g. "Dough", "Glaze"; null = ungrouped
- `sort_order` (int, not null, default 0) — controls display order within a recipe/group
- `name` (text, not null)
- `required` (boolean, not null, default true) — false = optional/garnish
- `substitution` (text, nullable) — free-text, admin-entered, never AI-generated

`pantry_items`
- `id` (uuid, primary key, default gen_random_uuid())
- `section` (text, not null, check in `('staple','standing_protein','fridge','freezer')`)
- `category` (text, nullable) — one of the staple categories in the Appendix; null for the other three sections
- `name` (text, not null)
- `created_at` (timestamptz, not null, default now())

**Row Level Security:**
- `cuisines`, `recipes`, `ingredients`: public `SELECT`; `INSERT`/`UPDATE`/`DELETE` restricted to the admin only. Propose in your plan whether that's enforced via a Postgres policy comparing `auth.jwt() ->> 'email'` to the admin email (hardcoded in the policy, kept in sync with `ADMIN_EMAIL`) or purely at the application layer in Server Actions — flag the tradeoff explicitly rather than picking silently.
- `pantry_items`: no public access at all — `SELECT`/`INSERT`/`UPDATE`/`DELETE` all admin-only. This is private data, not part of the showcase.

**Out of scope:** no per-user tables, no roles table, no soft-delete/audit columns.

---

## Section 1 — Admin Login

**Objective:** A single-admin login page at `/login`, replacing the `#start` placeholder, using Supabase Auth. Only the recognized admin account should ever end up signed in.

**Data:** Auth only — no application tables. Uses the existing `src/lib/supabase/client.ts` and `server.ts` helpers.

**States:** Login form (email + password); "Sign in with Google" button; loading while authenticating; wrong-password error; a non-admin email that authenticates successfully via Supabase but fails the admin check (sign out immediately + explain why — see Resolved decisions); already-signed-in admin visiting `/login` (redirect straight to the Admin Dashboard); successful sign-in (redirect to Admin Dashboard).

**Admin check:** compare the signed-in user's email to `ADMIN_EMAIL` (new env var — add it to `.env.example` and remind me to set it in `.env.local` and in Vercel).

**Design system:** `Card`, `Button`, `Input`, `Label` from `components/ui`, styled with the Springfield Kitchen tokens already in `src/app/globals.css` (`--sk-*`). Error text in `--sk-brick`.

**Out of scope:** No sign-up flow, no password reset UI in this pass, no roles table. The admin account itself is created directly in the Supabase dashboard, not through a UI flow.

**Assets:** None new.

---

## Section 2 — My Pantry

**Objective:** Let the admin view and edit their pantry, organized the same way the private `chef` skill already organizes it: categorized staples, a standing-proteins section, and simple fridge/freezer lists.

**Data:** Reads and writes `pantry_items` (see Section 0). Admin-only, gated behind `/login` — no per-user scoping, no RLS beyond "admin only."

**States:** Empty state per section; adding an item (staples ask for a category from the fixed list in the Appendix; the other three sections don't); deleting an item (with confirm); loading; a save error. Staples and standing proteins are both always assumed on hand once added — no quantities, no expiration dates in this MVP; fridge/freezer items are just a persistent list.

**Design system:** Reuse `Card` and `Button` from `components/ui`, styled with the Springfield Kitchen tokens. Four sections — Staples, Standing Proteins, Fridge, Freezer — staples alone gets a secondary grouping by category; reuse the tab pattern from `components/ui/tabs.tsx` for that inner grouping if it isn't too crowded, otherwise collapsible category headers.

**Out of scope:** No barcode scanning, no quantity tracking, no expiration dates, no suggested-items autocomplete, no per-category reordering UI. Just add/list/delete, categorized the way the source data already is.

**Assets:** None new.

**Seed data:** Import directly from the Appendix below — the real ~150-item categorized staple inventory, the 6 standing proteins, and the 7 base staples, pulled straight from the private chef skill's own files. Seed these on first migration/setup rather than requiring the admin to hand-type them.

---

## Section 3 — Add / Edit Recipe

**Objective:** Admin-only recipe entry and editing, covering all three intake modes on one page with a mode toggle: manual form, URL import, CSV bulk upload.

**Data:** Writes to `recipes` (`title`, `instructions`, `cuisine`, `needs_review`) and `ingredients` (`name`, `required`, `substitution`, `group_label`, `sort_order`) as defined in Section 0.

**Build-order tip:** implement and prove out the manual form first (it's the foundation the other two modes feed into), then layer in URL import, then CSV bulk — but all three belong on this one page/toggle before this section is considered done, since that's the full spec for this page.

### 3a. Manual form
**States:** Blank form; adding/removing ingredient rows; assigning an ingredient to a group (free-text group label, optional — leave blank for a flat/ungrouped recipe); reordering within a group; toggling an ingredient required vs. optional; adding free-text substitution notes; cuisine picker (dropdown from `cuisines`, with an "Other" option that inserts a new value into the table); save success; validation errors (missing title, zero ingredients); edit mode pre-filled from an existing recipe, including its existing groups.

### 3b. URL import (non-AI)
Parses schema.org/JSON-LD structured recipe markup server-side via `cheerio` — no LLM call, no third-party API. Look for a `<script type="application/ld+json">` block whose `@type` is (or includes) `"Recipe"`; map `name` → title, `recipeIngredient` → flat ingredient rows (default `required: true`, no group, admin re-groups/tags manually afterward), `recipeInstructions` → joined into the instructions field (handle both a plain string and an array of `HowToStep` objects), `recipeCuisine` → attempt a case-insensitive match against `cuisines`, otherwise leave blank for the admin to pick. **Always shows a pre-filled, editable form** with whatever was extracted — never a hard failure. Falls back to the blank manual form if no structured markup is found. `needs_review` stays `false` here — the admin reviews via the editable form before saving, not after.

### 3c. CSV bulk upload
One row per recipe. Columns: `title`, `instructions`, `cuisine`, `ingredients` (packed into one cell, semicolon-separated — flat, no sub-component support from CSV; admin can add groups later via edit). Every bulk-imported recipe is saved with `needs_review = true` until the admin manually tags required/optional and adds substitutions. Duplicate detection: fuzzy-match on `title` (see Resolved decisions) against existing recipes; possible duplicates are shown side-by-side for the admin to choose overwrite / skip / keep-both — never a silent overwrite or skip. This is the path for migrating the ~150-recipe Google Doc collection.

**Design system:** `Input`, `Label`, `Button`, `Dropdown-menu` from `components/ui`; Springfield Kitchen tokens; `sonner` for import success/error toasts.

**Out of scope:** No AI-assisted ingredient parsing or substitution suggestions anywhere in this page — everything here is deterministic parsing or manual entry.

**Assets:** None new.

---

## Section 4 — Recipes (public browse)

**Objective:** Public page where anyone can browse and filter all recipes by cuisine — no account required.

**Data:** Reads `recipes` (all of them — no published filter, see Resolved decisions) and `cuisines` for the filter control.

**States:** Grid/list of recipe cards, alphabetical by title; empty state (no recipes yet, or none matching the selected filter); cuisine filter (dropdown or chip row); loading; infinite scroll (load the next alphabetical page as the user scrolls, not numbered pagination).

**Design system:** `Card` from `components/ui`; Springfield Kitchen tokens; echo the cuisine-badge visual language from `components/home/cuisine-discs.tsx` for the filter chips, since that's an established pattern already on the homepage.

**Out of scope:** No admin edit controls here — those live on Recipe Detail. No "needs review" badge shown to public visitors (admin-only, per Resolved decisions).

**Assets:** None new.

---

## Section 5 — Recipe Detail

**Objective:** Full recipe view for anyone; edit, delete, and "mark reviewed" controls appear only when signed in as admin.

**Data:** Reads one `recipes` row and its `ingredients` (grouped by `group_label`, ordered by `sort_order`); admin mode also writes to both (edit fields, delete the row, clear `needs_review`).

**States:** Public view — title, instructions, ingredient list rendered as labeled groups where `group_label` is set (e.g. "For the dough," "For the glaze") and a flat list where it isn't, substitution notes shown inline, cuisine tag; admin view adds edit/delete buttons and a "mark reviewed" button when `needs_review` is true; loading; not-found (invalid id only — there's no unpublished state to branch on).

**Design system:** Reuse the card/heading treatment from the Recipes page; `Badge` from `components/ui` for cuisine and (admin-only) needs-review.

**Out of scope:** No comments, ratings, or sharing controls.

**Assets:** None new.

---

## Section 6 — Search / "What can I make?"

**Objective:** Let anyone find recipes they can make right now — from a typed ingredient list if they're a public visitor, or automatically from the saved pantry if signed in as admin. This is the core feature of the app — build it last among the data-facing pages, once Recipes, Recipe Detail, and My Pantry all have real data to test against.

**Data:** Reads `recipes`, `ingredients` (including substitutions); admin mode also reads `pantry_items`.

**States:** Public — empty input, typing/adding ingredients, results list, no-matches state; Admin — pre-filled automatically from the pantry, with a link back to My Pantry to adjust it, same results UI; loading.

**Matching rule:** a recipe matches if every **required** ingredient is on hand (or covered by a stored substitution). Missing **optional** ingredients never disqualify a match. No AI or web-search fallback when nothing matches — that's cut project-wide to keep the app at $0 ongoing cost; show a plain no-matches state instead.

**Normalization (shared utility, used by both modes — do not duplicate the logic):** lowercase and trim; strip these qualifier words/phrases before comparing (as whole words, not substrings): `boneless, skinless, skin-on, fresh, frozen, dried, ground, chopped, diced, minced, sliced, shredded, grated, crushed, whole, large, medium, small, extra-large, low-sodium, unsalted, salted, raw, cooked, ripe, fine, coarse, packed`. Collapse extra whitespace after stripping. Put this in one function (e.g. `lib/matching.ts`) that both the public and admin flows call.

**Design system:** `Input`, `Badge`, `Card` from `components/ui`; Springfield Kitchen tokens.

**Out of scope:** No AI or web-search fallback (see above); no saved search history for public visitors.

**Assets:** None new.

---

## Section 7 — Home (revision)

**Objective:** Revise the existing Home page (`src/app/page.tsx`, `components/home/*` — "The Sunburst" is already built, this is a targeted revision, not a rebuild): swap the scroll-driven intro for a ~3-second autoplay clip, wire the login link to the real `/login` route, and add a real recipe highlight section.

**Data:** Reads a small random sample of `recipes` (e.g. `ORDER BY random() LIMIT 3`) for the highlight section on each load — no `featured` column, per Resolved decisions.

**States:** Intro clip playing (first ~3s, no user interaction needed, no scroll trigger); intro resolved → homepage revealed; recipe highlight populated vs. empty (before any recipes exist yet).

**Specific changes:**
- `Overture`'s scroll-driven kebab-duel intro becomes a ~3-second animation that autoplays once on load, then reveals the rest of the page. Keep `Overture`'s existing staging (nav bar underneath, sunburst hero behind it) as the frame the clip resolves into.
- The `ACCOUNT_HREF` constant in `page.tsx` currently points at the placeholder anchor `#start` — replace it with the real `/login` route from Section 1.
- Add the recipe highlight section, styled to match the existing sections.

**Design system:** No changes to the existing Springfield Kitchen styling in `home.module.css` — only `Overture`'s trigger mechanism/asset and the new highlight section.

**Out of scope:** Redesigning `Sunburst`, `CuisineDiscs`, or `PantryProof` — those stay as already built.

**Assets:** The ~3-second dueling-kebabs video/GIF clip. **Generate and drop this into `src/assets/` before starting this section** — Claude Code should not guess at an asset path that doesn't exist yet. If it's not ready when you reach this section, build everything else in this section first and leave the intro on its current placeholder rather than blocking the whole section on the asset.

---

## Section 8 — Admin Dashboard

**Objective:** Admin-only overview page. Deliberately the thinnest section — a useful starting point, not a final answer, meant to be built last and revised once you know what you actually reach for.

**Data:** Reads `recipes` (count of rows with `needs_review = true`; most recently created rows) and `pantry_items` (just enough for a shortcut link, no separate query needed beyond a link to My Pantry).

**States:** Needs-review count (0 shows no badge/alert, >0 shows a count with a link into a filtered view or the Add/Edit Recipe list); a short "recently added" list (last 5 recipes by `created_at`, linking to Recipe Detail); a card/shortcut linking to My Pantry; loading.

**Design system:** Reuse the `Card` layout patterns already established on the other admin pages.

**Out of scope:** No analytics/charts, no activity log, no settings panel. If this ends up not matching what you actually want after living with it, that's expected — revise this section rather than treating it as locked.

**Assets:** None expected.

---

## Appendix — Real seed data (for Section 2, My Pantry)

Source: the private `chef` skill's `references/pantry-inventory.md` (staples) and `SKILL.md` (standing proteins + base staples). Hand Claude Code this section directly as seed data rather than re-describing it.

### Staples, by category

**Grains & Rice:** Oatmeal, Rolled oats, Polenta, Quinoa, Black rice, Pearl barley, Arborio rice, Pearl couscous, Bomba rice, Basmati rice, Jasmine rice, Sushi rice

**Pasta & Noodles:** Pappardelle, Spaghetti, Angel hair, Fettuccine, Bucatini, Rice noodle, Egg noodle, Rice paper, Mung bean noodle, Dried vermicelli, Pasta shells, Instant mac and cheese, Ramen, Elbow macaroni

**Flours & Baking Staples:** Pancake mix, Vanilla protein powder, All-purpose flour, Bread flour, Whole wheat flour, Rice flour, Semolina flour, Cake flour, Tapioca flour, Almond flour, Coconut flour, Cornstarch, Potato starch, Xanthan gum, Baking powder, Baking soda, Instant yeast, Gelatin, Pectin, Cream of tartar, Flaxseed meal

**Nuts & Seeds:** Walnuts, Sliced almonds, Slivered almonds, Hazelnuts, Raw whole cashews, Pistachio pieces, Pistachios, Peanuts, Chia seeds, White sesame seeds

**Legumes & Beans:** Yellow split peas, Chickpeas, Kidney beans, Black beans, Green lentils

**Dried Herbs & Spices:** Dried dillweed, Dried rosebuds, Dried mint leaves, Sumac, Persian dried limes, Green cardamom (pods), Ground cardamom, Cumin, Nutmeg, White pepper, Saffron, Advieh, Chili powder, Cayenne pepper, Chili flakes, Allspice, Dried basil, Bay leaves, Celery salt, Dried chipotle chili pepper, Cinnamon, Ground coriander seed, Curry powder, Garam masala, Garlic powder, Golpar, Ground mustard, Onion powder, Paprika, Oregano, Italian seasoning, Dried parsley, Dried rosemary, Dried sage, Dried thyme, Turmeric, Cobanero chili pepper, Black lime powder, Szechuan peppercorn, Dried Japanese red pepper, Star anise, MSG, Kosher salt, Gray salt, Red wine sea salt, Persian blue salt, Raspberry salt, Pumpkin spice, Chinese five spice, Tomato powder, Corn powder, Togarashi, Furikake, Nutritional yeast

**Seasoning Blends, Rubs & Soup Bases:** Vedemy's fried chicken seasoning, Ranch seasoning, Vietnamese soup seasoning, Seasoned salt, Everything bagel seasoning, White cheddar popcorn seasoning, Truffle salt, Cajun seasoning, Fajita seasoning, Shawarma seasoning, Kebab seasoning, Italian arrabbiata seasoning, Blackening seasoning, Tunisian tabil seasoning, Old Bay, Poultry seasoning, Mushroom seasoning blend, Chicken bouillon powder, Beef bouillon cubes, Vietnamese pho soup base, Golden nest soup, Sahlap (sahlep)

**Oils:** Peanut oil, Olive oil, Cooking oil, Sunflower oil, Toasted sesame oil, White truffle oil, Black truffle oil, Ghee

**Vinegars:** Apple cider vinegar, Balsamic vinegar, White balsamic vinegar, Balsamic vinegar glaze, White wine vinegar, Red wine vinegar, Rice vinegar, White vinegar

**Sauces, Pastes & Condiments:** Tomato paste, Tahini, Chinese sesame paste, Pistachio cream, Mirin, Shaoxing cooking wine, Soy sauce, Dark soy sauce, Mushroom soy sauce, Maggi seasoning, Fish sauce, Pomegranate molasses, Sekanjabin, Worcestershire sauce, Capers, Oyster sauce, Vegan oyster sauce, Hoisin sauce, Thai peanut sauce, Sweet chili sauce, Dumpling sauce, Teriyaki sauce, Ketchup, Sriracha, Relish, Dijon mustard, Yellow mustard, Chipotle peppers (in adobo), Mayo, Sun-dried tomatoes, Barbecue sauce, Liquid smoke, Salsa, Tamarind paste, Yellow pepper paste, Shrimp paste, Fermented bean curd, Miso, Tabasco, Crispy shallots, Peanut butter, Sri Lankan curry paste, Thai curry paste

**Broths, Stocks & Bouillon:** Chicken stock, Beef stock, Veggie stock, Chicken bouillon powder, Beef bouillon cubes

**Wine & Cooking Wine:** Red wine, White wine

**Canned & Jarred Goods:** Canned corn, Canned chili, Canned tomatoes, Passata, Heart of palm, Spam, Panko, Tempura batter mix, Taco shells, Dried seaweed

**Dairy, Milk Alternatives & Creams:** Sweetened condensed milk, Coconut cream, Coconut milk, Light coconut milk, Hazelnut milk, Almond milk

**Sweeteners & Baking Sweets:** Sugar, Brown sugar, Palm sugar, Honey, Maple syrup, Truffle honey, Molasses, Hershey's syrup, Strawberry jam, Dutch-process unsweetened cocoa powder, Semi-sweet chocolate baking chips, Vanilla extract, Vanilla paste, French vanilla bean, Dates, Prunes

**Fresh Aromatics:** Onions, Red onions, Shallots, Garlic, Ginger

**Extracts & Flavored Waters:** Rose water, Mint water, Orange blossom water

**Specialty / International Pantry:** Pandan (leaves/extract)

### Standing proteins (section: `standing_protein`, no category)
Frozen salmon, Frozen chicken thighs, Frozen chicken breast, Ground beef, Sliced steak, Frozen shrimp

### Base staples — never shown as missing (section: `staple`, category: none/"Base")
Salt, Pepper, Butter, Milk, Eggs, Water, General cooking oil

### Cuisines (seed for the `cuisines` table)
Drinks, Asian, Italian, American, French, Latin, Mediterranean, Indian, Breads, Desserts, Other

---

## Reference: current stack (already scaffolded — don't re-initialize)

- Next.js 16 (App Router, TypeScript, `src/` layout) — note: `middleware.ts` is `proxy.ts` in this Next.js version, exporting `proxy`, not `middleware`
- Tailwind CSS v4
- shadcn/ui (`radix-nova` preset, Radix primitives, Lucide icons) — existing components: `badge`, `button`, `card`, `dropdown-menu`, `input`, `label`, `sonner`, `tabs`
- Supabase (Postgres + Auth) via `@supabase/ssr`, hosted on Vercel
- Design system: "Springfield Kitchen" tokens in `src/app/globals.css` (`--sk-*`) — flat cartoon-cel palette, day + "Night Kitchen" dark mode, named easing curves (`--sk-ease-land`, `--sk-ease-press`)
- No Anthropic/LLM API, no third-party search API — zero ongoing runtime cost is a hard constraint for every section above
