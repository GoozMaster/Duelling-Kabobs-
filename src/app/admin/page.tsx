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
 * Both lists are a glance, not a browse — five rows each. The needs-review card
 * still shows the true total next to its five, so a backlog of forty cannot
 * masquerade as five.
 */
const REVIEW_PREVIEW = 5
const RECENT_LIMIT = 5

const CARD =
  "border-border gap-5 rounded-[var(--sk-radius-lg)] border-2 shadow-[var(--sk-shadow-pop)]"
const ROW =
  "border-border hover:bg-muted/40 flex items-center justify-between gap-4 rounded-[var(--sk-radius-sm)] border px-3 py-2 transition-colors"

/**
 * Elapsed-time phrasing, deliberately not calendar-based.
 *
 * "Yesterday" derived from calendar days is wrong whenever the server's day and
 * the reader's day disagree — this renders on a UTC server for a reader who is
 * not on UTC. Elapsed milliseconds mean the same thing in every timezone, so
 * the relative range is always honest. Only the absolute fallback can sit a few
 * hours either side of local midnight, and a week-old recipe listed a day out
 * reads as rounding rather than as a bug.
 */
function formatAdded(iso: string): string {
  const added = new Date(iso)
  const elapsedHours = (Date.now() - added.getTime()) / 36e5

  if (elapsedHours < 1) return "just now"

  if (elapsedHours < 24) {
    const hours = Math.round(elapsedHours)
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  }

  if (elapsedHours < 24 * 7) {
    const days = Math.round(elapsedHours / 24)
    return `${days} ${days === 1 ? "day" : "days"} ago`
  }

  return added.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: added.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  })
}

function RowLink({ href, title, meta }: { href: string; title: string; meta: string }) {
  return (
    <Link href={href} className={ROW}>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{title}</span>
        <span className="text-muted-foreground block text-xs">{meta}</span>
      </span>
      <span aria-hidden className="text-muted-foreground">
        →
      </span>
    </Link>
  )
}

/**
 * One failed query costs its own card, not the page. A dashboard that blanks
 * entirely because one of three reads failed is worse than one that admits
 * which part it could not load.
 */
function QueryError({ message }: { message: string }) {
  return (
    <p className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm">
      {message}
    </p>
  )
}

export default async function AdminPage() {
  const user = await requireAdmin()
  const supabase = await createClient()

  const [review, recent, { data: dbAgrees, error: adminError }] = await Promise.all([
    // `count: "exact"` rides along with the rows, so the five titles and the
    // true backlog total arrive in one round trip rather than two.
    supabase
      .from("recipes")
      .select("id, title, cuisine", { count: "exact" })
      .eq("needs_review", true)
      .order("created_at", { ascending: false })
      .limit(REVIEW_PREVIEW),
    supabase
      .from("recipes")
      .select("id, title, cuisine, created_at")
      .order("created_at", { ascending: false })
      .limit(RECENT_LIMIT),
    // ADMIN_EMAIL and the literal inside public.is_admin() are the same fact
    // written in two places, and nothing stops them drifting apart. If they do,
    // every write fails with a row-level-security error at the worst possible
    // moment — halfway through saving a recipe. Better to say so on every visit.
    supabase.rpc("is_admin"),
  ])

  const reviewCount = review.count ?? 0
  const recentRecipes = recent.data ?? []

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--sk-font-display)] text-2xl tracking-wide">
            ADMIN
          </CardTitle>
          <CardDescription>
            Signed in as <strong className="text-foreground">{user.email}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          {!dbAgrees && (
            <QueryError
              message={
                adminError
                  ? `Could not confirm your admin status with the database: ${adminError.message}`
                  : "ADMIN_EMAIL and the email inside public.is_admin() have drifted apart. You can reach the admin pages, but every save will be rejected by row-level security until they match."
              }
            />
          )}

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

      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-[family-name:var(--sk-font-display)] text-xl tracking-wide">
            NEEDS REVIEW
            {reviewCount > 0 && <Badge variant="destructive">{reviewCount}</Badge>}
          </CardTitle>
          <CardDescription>
            Bulk-imported recipes still waiting for their ingredients to be tagged
            required or optional.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {review.error ? (
            <QueryError
              message={`Could not load the review queue: ${review.error.message}`}
            />
          ) : reviewCount === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nothing waiting. Every recipe has been through by hand.
            </p>
          ) : (
            <>
              {(review.data ?? []).map((recipe) => (
                <RowLink
                  key={recipe.id}
                  href={`/admin/recipes/${recipe.id}/edit`}
                  title={recipe.title}
                  meta={recipe.cuisine ?? "No cuisine yet"}
                />
              ))}

              {reviewCount > REVIEW_PREVIEW && (
                <p className="text-muted-foreground text-xs">
                  Showing the {REVIEW_PREVIEW} most recent of {reviewCount}.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--sk-font-display)] text-xl tracking-wide">
            RECENTLY ADDED
          </CardTitle>
          <CardDescription>The last {RECENT_LIMIT} recipes to land.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {recent.error ? (
            <QueryError
              message={`Could not load recent recipes: ${recent.error.message}`}
            />
          ) : recentRecipes.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No recipes yet.{" "}
              <Link
                href="/admin/recipes/new"
                className="text-foreground underline underline-offset-4"
              >
                Add the first one.
              </Link>
            </p>
          ) : (
            recentRecipes.map((recipe) => (
              <RowLink
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                title={recipe.title}
                meta={[recipe.cuisine, formatAdded(recipe.created_at)]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))
          )}
        </CardContent>
      </Card>

      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="font-[family-name:var(--sk-font-display)] text-xl tracking-wide">
            SHORTCUTS
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          <RowLink
            href="/admin/recipes/new"
            title="Add a recipe"
            meta="By hand, from a web address, or a CSV batch"
          />
          <RowLink
            href="/admin/pantry"
            title="My Pantry"
            meta="Staples, standing proteins, fridge and freezer"
          />
          <RowLink
            href="/recipes"
            title="Browse recipes"
            meta="The public collection, as visitors see it"
          />
        </CardContent>
      </Card>
    </main>
  )
}
