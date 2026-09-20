# Admin Login

**Status:** Draft
**Page order:** 1 of 8 (roadmap build sequence step 2 — right after the database schema)

*Example of an efficient Claude Code prompt — this structure is what makes a plan-mode round trip land in one pass instead of several: **Objective** (one sentence, who it's for), **Data** (exact tables/fields, not vague), **States** (every UI state, especially edge cases), **Design system** (which existing tokens/components to reuse), **Out of scope** (what NOT to build), **Assets** (exact file paths, chosen before writing the prompt). See `02-my-pantry.md` for the fully worked version this shape is drawn from.*

---

## Context from our planning (check before sending this prompt)

- Single-admin model: only you sign in. There is no sign-up flow and no multi-user account system — see the roadmap doc's "The pivot" section.
- Supabase Auth is already wired (`src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`, `src/proxy.ts`) but there's no `/login` route yet — the homepage's "Log in" and "Create a free account" links currently point at a placeholder anchor, `#start` (the `ACCOUNT_HREF` constant in `src/app/page.tsx`).
- Open question, worth deciding before sending this prompt: how does the app recognize "the admin" specifically? The simplest approach is an `ADMIN_EMAIL` environment variable checked against the signed-in Supabase user's email, rather than a roles table — but confirm that's the approach you want.
- Related open question: if someone signs in via Google OAuth with an email that *isn't* the admin's, what should happen? (Reject and sign out with a message is the likely answer, but worth deciding explicitly.)
- No sign-up page is needed — you're the only account, so it can be created directly in the Supabase dashboard rather than through a UI flow.

## Prompt to send to Claude Code

**Objective:** A single-admin login page at `/login`, replacing the `#start` placeholder, using Supabase Auth. Only the recognized admin account should ever end up signed in.

**Data:** Auth only — no application tables. Uses the existing `src/lib/supabase/client.ts` and `server.ts` helpers.

**States:** Login form (email + password); "Sign in with Google" button; loading while authenticating; wrong-password error; a non-admin email signing in successfully via Supabase but failing the admin check (reject + sign out + explain why); already-signed-in admin visiting `/login` (redirect straight to the Admin Dashboard); successful sign-in (redirect to Admin Dashboard).

**Design system:** `Card`, `Button`, `Input`, `Label` from `components/ui`, styled with the Springfield Kitchen tokens already in `globals.css` (`--sk-*`). Error text in `--sk-brick`.

**Out of scope:** No sign-up flow, no password reset UI in this pass, no roles table — single admin identity only.

**Assets:** None new.
