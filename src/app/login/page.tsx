import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { SiteNav } from "@/components/site-nav/site-nav"
import { isAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

import { LoginForm } from "./login-form"

export const metadata: Metadata = {
  title: "Sign in — Dueling Kebabs",
  description: "Admin sign-in. Browsing the recipes needs no account.",
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  // An admin who is already signed in has no business on this page.
  if (data.user && isAdmin(data.user.email)) {
    redirect("/admin")
  }

  // A signed-in *non*-admin is left alone rather than signed out here: a Server
  // Component cannot write cookies, so the sign-out would revoke the token
  // without clearing the browser's copy. The session is harmless in any case —
  // RLS grants it nothing, and requireAdmin() turns it away. The signIn action
  // is where a non-admin actually gets signed back out.

  return (
    <>
      <SiteNav />
      {/* flex-1 rather than min-h-screen now that the nav takes a row: the
          body is a flex column, so this fills what is left and still centres. */}
      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
        <LoginForm />

        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
        >
          Back to Dueling Kebabs
        </Link>
      </main>
    </>
  )
}
