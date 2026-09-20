"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// Only async functions may be *exported* from a "use server" module — a value
// export makes Next.js refuse to load the file at all. Types are erased before
// that check runs, so this one is fine; the initial state lives in the form.
export type SignInState = { error: string | null }

/**
 * Sign-in runs as a Server Action rather than from the browser client for two
 * reasons: ADMIN_EMAIL never enters the client bundle, and the session cookie is
 * written server-side where `cookies()` is actually writable.
 */
export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "")

  if (!email || !password) {
    return { error: "Enter both an email address and a password." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    // Deliberately identical whether the address is unknown or the password is
    // wrong — a different message for each would confirm which accounts exist.
    return { error: "That email and password do not match an account." }
  }

  // Authenticated with Supabase, but not the one account this site recognises.
  // Sign the session straight back out rather than leaving someone holding a
  // valid token that every RLS policy will refuse anyway.
  if (!isAdmin(data.user.email)) {
    await supabase.auth.signOut()
    return {
      error:
        "That account is not the owner of this site. Dueling Kebabs has a single " +
        "admin, so you have been signed back out. Anyone can browse the recipes " +
        "without an account.",
    }
  }

  revalidatePath("/", "layout")
  redirect("/admin")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  revalidatePath("/", "layout")
  redirect("/")
}
