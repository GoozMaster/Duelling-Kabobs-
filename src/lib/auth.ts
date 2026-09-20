import { redirect } from "next/navigation"
import type { User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"

/**
 * The single-admin identity check — the application half of the rule that
 * `public.is_admin()` enforces in Postgres.
 *
 * !! KEEP IN SYNC !! `ADMIN_EMAIL` and the email literal inside
 * `public.is_admin()` (supabase/migrations/20260920000200_rls_policies.sql)
 * must name the same person. If they drift, the app lets someone into the admin
 * pages whose every write is then rejected by RLS. The /admin page surfaces
 * that disagreement on purpose rather than leaving it to be discovered later.
 *
 * Note this deliberately does NOT live in `lib/env.ts`. That module validates
 * eagerly at import time and is pulled in by `supabase/client.ts`, which runs
 * in the browser — where a variable without the `NEXT_PUBLIC_` prefix is always
 * undefined. Reading it there would crash every Client Component in the app.
 * Here the read is lazy, so importing this file costs nothing until server code
 * actually calls one of these functions.
 */
export function getAdminEmail(): string {
  const value = process.env.ADMIN_EMAIL

  if (!value) {
    throw new Error(
      "Missing environment variable ADMIN_EMAIL. Add it to .env.local (and to the " +
        "Vercel project settings for deployed environments). It must match the email " +
        "in public.is_admin() in the database.",
    )
  }

  return value.trim().toLowerCase()
}

/** Whether an email address belongs to the admin. Supabase stores emails lowercased. */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  return email.trim().toLowerCase() === getAdminEmail()
}

/**
 * Guard for admin-only Server Components. Returns the signed-in admin, or
 * redirects to /login and never returns.
 *
 * This is the reusable piece: My Pantry, Add/Edit Recipe and the Admin
 * Dashboard all gate on this rather than each re-deriving the check.
 *
 * It is not the security boundary — RLS is. A user who slipped past this would
 * still be unable to read the pantry or write a recipe. This exists so the
 * admin pages fail as a clean redirect instead of as a wall of empty queries.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user || !isAdmin(data.user.email)) {
    redirect("/login")
  }

  return data.user
}
