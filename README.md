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
cp .env.example .env.local   # then fill in the two values
npm run dev
```

Open http://localhost:3000. Visit `/health` for a live check that the Supabase
wiring is working.

### Environment variables

Both are public by design — the publishable key only grants what your Row Level
Security policies allow. **Never** put the `service_role` key in a `NEXT_PUBLIC_*`
variable.

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase dashboard → Project Settings → API Keys |

The same two variables must be set in the Vercel project settings for
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

## Layout

```
src/
  app/
    page.tsx            Landing placeholder
    health/page.tsx     Live Supabase connectivity check
    globals.css         Tailwind v4 entry + theme tokens
  components/ui/        shadcn/ui components
  lib/
    env.ts              Fail-fast accessor for the public env vars
    supabase/
      client.ts         Browser client (Client Components)
      server.ts         Cookie-bound client (Server Components, Actions, Routes)
      middleware.ts     updateSession() — refreshes the auth session
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
triggers a production deploy. Make sure the two environment variables above are
present in the Vercel project first — `src/lib/env.ts` throws on a missing
variable, by design, so a misconfigured deploy fails loudly rather than silently
serving a broken app.
