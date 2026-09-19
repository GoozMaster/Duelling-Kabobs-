import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

import { env } from "@/lib/env"

/**
 * Supabase client for use in Server Components, Route Handlers and Server
 * Actions. Must be created per-request — never hoisted into a module-level
 * singleton, because it is bound to the current request's cookies.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Safe to ignore: the middleware refreshes the session cookies.
        }
      },
    },
  })
}
