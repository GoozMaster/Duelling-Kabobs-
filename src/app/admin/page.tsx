import type { Metadata } from "next"
import Link from "next/link"

import { signOut } from "@/app/login/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { requireAdmin } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Admin — Dueling Kebabs",
}

/**
 * Placeholder for the Admin Dashboard (section 8 of MASTER-BUILD-PROMPT.md).
 * Section 8 replaces the body with the real overview; the route and the
 * requireAdmin() guard stay as they are.
 */
export default async function AdminPage() {
  const user = await requireAdmin()

  // Ask Postgres whether it agrees. ADMIN_EMAIL and the literal inside
  // public.is_admin() are the same fact written in two places, and nothing
  // stops them drifting apart. If they ever do, every write silently fails with
  // a row-level-security error at the worst possible moment — halfway through
  // saving a recipe. Better to say so here, plainly, on every visit.
  const supabase = await createClient()
  const { data: dbAgrees, error } = await supabase.rpc("is_admin")

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <Card className="border-border gap-6 rounded-[var(--sk-radius-lg)] border-2 shadow-[var(--sk-shadow-pop)]">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--sk-font-display)] text-2xl tracking-wide">
            ADMIN
          </CardTitle>
          <CardDescription>
            Signed in as <strong className="text-foreground">{user.email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="border-border flex items-center justify-between gap-4 rounded-[var(--sk-radius-sm)] border px-3 py-2">
            <div>
              <p className="text-sm font-medium">Database agrees you are the admin</p>
              <p className="text-muted-foreground text-xs">
                {error
                  ? error.message
                  : "public.is_admin() evaluated against your session's JWT"}
              </p>
            </div>
            <Badge variant={dbAgrees ? "default" : "destructive"}>
              {dbAgrees ? "Yes" : "No"}
            </Badge>
          </div>

          {!dbAgrees && (
            <p className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm">
              ADMIN_EMAIL and the email inside <code>public.is_admin()</code> have drifted
              apart. You can reach the admin pages, but every save will be rejected by
              row-level security until they match.
            </p>
          )}

          <Link
            href="/admin/pantry"
            className="border-border hover:bg-muted/40 flex items-center justify-between gap-4 rounded-[var(--sk-radius-sm)] border px-3 py-2"
          >
            <span>
              <span className="block text-sm font-medium">My Pantry</span>
              <span className="text-muted-foreground block text-xs">
                Staples, standing proteins, fridge and freezer
              </span>
            </span>
            <span aria-hidden className="text-muted-foreground">
              →
            </span>
          </Link>

          <p className="text-muted-foreground text-sm">
            The real dashboard — needs-review count, recent recipes, a shortcut to My
            Pantry — is section 8 and gets built last, once it is clear what is actually
            worth showing here.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                size="lg"
                className="border-border h-10 border-2"
              >
                Sign out
              </Button>
            </form>

            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground text-sm underline underline-offset-4"
            >
              Back to the site
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
