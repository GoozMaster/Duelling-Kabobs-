# Chef App

Pantry-matching recipe manager — find what you can cook with what you already have.

Scope for this build is locked in [`chef-app-handoff.md`](./chef-app-handoff.md). Treat
that document as the reference for features; this README covers running the code.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, `src/` layout) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (`radix-nova` preset, Radix primitives, Lucide icons) |
| Backend / auth | Supabase (Postgres + Auth), via `@supabase/ssr` |
| Hosting | Vercel |

No AI/LLM APIs are used at runtime — that is a deliberate constraint, so the app
costs nothing ongoing to operate.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the three values
npm run dev
```

Open http://localhost:3000. Visit `/health` for a live check that the Supabase
wiring is working.

### Environment variables

The two `NEXT_PUBLIC_` values are public by design — the publishable key only
grants what your Row Level Security policies allow. **Never** put the
`service_role` key in a `NEXT_PUBLIC_*` variable.

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase dashboard → Project Settings → API Keys |
| `ADMIN_EMAIL` | The one account that may sign in. Must match `public.is_admin()` in the RLS migration. Not `NEXT_PUBLIC_` — it stays server-side. |

All three must be set in the Vercel project settings for
production, preview and development.

## Database

The schema lives in `supabase/migrations/`, numbered in apply order. Those files
are the source of truth — the hosted database is a product of them, never the
other way around.

| Migration | What it does |
| --- | --- |
| `20260920000100_init_schema.sql` | `cuisines`, `recipes`, `ingredients`, `pantry_items` + indexes |
| `20260920000200_rls_policies.sql` | `is_admin()` and every Row Level Security policy |
| `20260920000300_seed_reference_data.sql` | 11 cuisines and the 256-item pantry inventory |
| `20260920000400_save_recipe_function.sql` | `save_recipe()` — recipe + ingredients in one transaction |

The Supabase CLI is not installed; migrations are applied through the Supabase
MCP integration in Claude Code. The filenames follow the CLI's
`<timestamp>_<name>.sql` convention, so running `supabase link` later picks them
up without renaming anything.

### Security model

This app ships **only the publishable key**, which can reach PostgREST directly
at `<project>/rest/v1/*` from any browser — bypassing Next.js entirely. So access
control cannot live in Server Actions; it has to be in the database.

- `cuisines`, `recipes`, `ingredients` — world-readable, admin-writable.
- `pantry_items` — admin-only in every direction. No `anon` policy exists, so
  anonymous reads return zero rows.

"Admin" means one email address, held in `public.is_admin()`. **That literal has
to stay in sync with the `ADMIN_EMAIL` environment variable** used by the login
route. Changing the admin means editing both.

Public sign-ups should stay disabled in the Supabase dashboard — there is no
sign-up flow in this app by design.

### After a schema change

Regenerate the types, or the compiler will be validating against a schema that no
longer exists:

```
src/lib/supabase/database.types.ts
```

It is generated (via the Supabase MCP `generate_typescript_types` tool) and should
never be hand-edited. All three clients in `src/lib/supabase/` are parameterised
with its `Database` type, which is what makes table and column names checked at
compile time.

Visit `/health` after any change — it verifies public reads still work and that
the pantry is still invisible to anonymous visitors.

## Auth

One account, created by hand in the Supabase dashboard. There is no sign-up flow
and no roles table; everyone else uses the site signed out.

| Route | Who |
| --- | --- |
| `/login` | Email + password. A non-admin who authenticates is signed straight back out with an explanation. |
| `/admin` | Guarded by `requireAdmin()`. Currently a stub — section 8 builds the real dashboard. |
| `/admin/pantry` | My Pantry. Reads and writes `pantry_items`, which has no public policy at all. |
| `/admin/recipes/new` | Add a recipe. Manual entry; URL import and CSV bulk upload land here too. |
| `/admin/recipes/[id]/edit` | Edit a saved recipe. |

Public routes need no account at all:

| Route | What |
| --- | --- |
| `/recipes` | Browse and filter the collection. Alphabetical, infinite scroll. |
| `/recipes/[id]` | A single recipe: ingredients, substitutions, instructions. Admin sees edit / mark-reviewed / delete. |

`src/lib/auth.ts` holds the check. `requireAdmin()` is what every admin page
should call; it returns the user or redirects to `/login`.

It reads `ADMIN_EMAIL` **lazily**, and deliberately does not live in
`src/lib/env.ts`. That module validates at import time and is pulled in by
`supabase/client.ts`, which runs in the browser — where any variable without the
`NEXT_PUBLIC_` prefix is `undefined`. Putting `ADMIN_EMAIL` there would crash
every Client Component in the app.

Remember that `requireAdmin()` is a convenience, not the security boundary. RLS
is. Someone who got past it would still be unable to read or write anything.

`/admin` shows whether the database agrees you are the admin, by calling
`public.is_admin()` over RPC. If that says **No**, `ADMIN_EMAIL` and the email
inside the RLS migration have drifted apart — fix it before saving anything.

### Google sign-in is not built yet

The original scope includes Google OAuth. It is not implemented, because the
provider is not configured in Supabase. Adding it needs:

1. OAuth credentials in Google Cloud.
2. The Google provider enabled in the Supabase dashboard, with those credentials
   and the right redirect URLs.
3. A `/auth/callback` route handler calling `exchangeCodeForSession`.
4. The button on `/login`, calling `signInWithOAuth`.

The admin check itself needs no changes — it compares the email on whatever JWT
comes back, regardless of how it was obtained.

## Layout

```
src/
  app/
    page.tsx            The Sunburst home page
    health/page.tsx     Live Supabase connectivity check
    login/              Admin sign-in page + sign-in/out Server Actions
    admin/page.tsx      Guarded stub; section 8 builds the real dashboard
    admin/pantry/       My Pantry — staples, standing proteins, fridge, freezer
    admin/recipes/      Add and edit recipes
    recipes/            Public browse + recipe detail
    globals.css         Tailwind v4 entry + theme tokens
  components/ui/        shadcn/ui components
  lib/
    auth.ts             requireAdmin() and the ADMIN_EMAIL check
    pantry.ts           Staple categories and section metadata
    recipes.ts          Draft-recipe shape shared by every intake mode
    recipe-browse.ts    Page size and card shape for the public browse page
    instructions.ts     Splits stored instruction text into headings and steps
    recipe-url.ts       schema.org JSON-LD extraction for URL import
    recipe-csv.ts       CSV parsing for bulk upload
    similarity.ts       Dice coefficient, for duplicate detection
    env.ts              Fail-fast accessor for the public env vars
    supabase/
      client.ts         Browser client (Client Components)
      server.ts         Cookie-bound client (Server Components, Actions, Routes)
      middleware.ts     updateSession() — refreshes the auth session
      public.ts         Cookie-free client for public data (keeps pages static)
      database.types.ts Generated schema types (do not hand-edit)
  proxy.ts              Runs updateSession on every matched request
supabase/
  migrations/           Schema + RLS + seed, in apply order
```

### A note on `proxy.ts`

Next.js 16 renamed the `middleware` file convention to `proxy`. The exported
function is `proxy`, not `middleware`. Most Supabase documentation still shows
the old name — the contents are otherwise identical.

### A note on `cn`

This shadcn preset imports `cn` from the `cn` npm package rather than defining it
in `lib/utils`. `src/lib/utils.ts` just re-exports it, so `@/lib/utils` keeps
working if you follow docs that expect it.

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build
npm start        # serve the production build
npm run lint     # eslint
```

## Deploying

The Vercel project is connected to a Git repository, so pushing to `main`
triggers a production deploy. Make sure the environment variables above are
present in the Vercel project first — `src/lib/env.ts` and `src/lib/auth.ts` throw on a missing
variable, by design, so a misconfigured deploy fails loudly rather than silently
serving a broken app.
