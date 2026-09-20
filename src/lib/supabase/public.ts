import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import { env } from "@/lib/env"

import type { Database } from "./database.types"

/**
 * An anonymous Supabase client for public data — no cookies, no session.
 *
 * WHY THIS EXISTS, AND WHEN TO USE IT:
 * the cookie-bound client in server.ts calls next/headers' cookies(), and any
 * route that reads cookies is forced to render dynamically. That is correct for
 * anything whose answer depends on who is asking, but it silently opts a page
 * out of static rendering and ISR.
 *
 * The home page hit exactly that: adding recipe counts through the cookie-bound
 * client turned the landing page from a prerendered file into a per-request
 * render, `export const revalidate` notwithstanding.
 *
 * Use this only for data the public SELECT policies already expose and whose
 * result is identical for every visitor. Anything that should differ by
 * session — or any write — must use server.ts, because this client carries no
 * identity and RLS will treat it as anonymous.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
