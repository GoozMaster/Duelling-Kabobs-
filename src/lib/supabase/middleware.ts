import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

import { env } from "@/lib/env"

/**
 * Refreshes the Supabase auth session on every matched request and forwards the
 * rotated cookies to both the incoming request (so Server Components in this
 * render see them) and the outgoing response (so the browser stores them).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    env.supabaseUrl,
    env.supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // Touching getUser() is what triggers the refresh. Do not remove, and do not
  // run any logic between creating the client and this call.
  await supabase.auth.getUser()

  return response
}
