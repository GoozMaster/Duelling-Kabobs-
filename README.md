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
  proxy.ts              Runs updateSession on every matched request
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
