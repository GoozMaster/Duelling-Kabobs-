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
  title: "Admin",
}

/**
 * Both lists are a glance, not a browse — five rows each. The needs-review card
 * still shows the true total next to its five, so a backlog of forty cannot
 * masquerade as five.
 */
const REVIEW_PREVIEW = 5
const RECENT_LIMIT = 5

const CARD =
  "gap-5 rounded-[var(--sk-radius-lg)] border-[3px] border-[var(--sk-outline)] shadow-[var(--sk-shadow-sticker)]"
const ROW =
  "hover:bg-[var(--sk-sand)]/50 flex items-center justify-between gap-4 rounded-[var(--sk-radius-md)] border-2 border-[var(--sk-outline)]/20 px-3 py-2.5 transition-colors"

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
        <span className="block truncate text-base font-semibold">{title}</span>
        <span className="text-muted-foreground block text-sm">{meta}</span>
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
    <main className="page-wrap flex flex-col gap-8 py-10 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-[clamp(40px,5vw,64px)] leading-none">Admin</h1>
          <p className="text-lg">
            Signed in as <strong>{user.email}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="text-base font-semibold underline underline-offset-4 hover:text-[var(--sk-teal)]"
          >
            Back to the site
          </Link>
          <form action={signOut}>
            <Button
              type="submit"
              variant="outline"
              size="lg"
              className="h-11 rounded-[var(--sk-radius-pill)] border-[3px] border-[var(--sk-outline)] px-6 text-base font-semibold"
            >
              Sign out
            </Button>
          </form>
        </div>
      </header>

      {!dbAgrees && (
        <QueryError
          message={
            adminError
              ? `Could not confirm your admin status with the database: ${adminError.message}`
              : "ADMIN_EMAIL and the email inside public.is_admin() have drifted apart. You can reach the admin pages, but every save will be rejected by row-level security until they match."
          }
        />
      )}

      {/* Three columns on a wide screen: the work waiting, what just arrived,
          and the ways into everything else. */}
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2 text-2xl">
              Needs review
              {reviewCount > 0 && <Badge variant="destructive">{reviewCount}</Badge>}
            </CardTitle>
            <CardDescription className="text-[15px]">
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
              <p className="text-base">Nothing waiting. Every recipe has been through by hand.</p>
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
                  <p className="text-muted-foreground text-sm">
                    Showing the {REVIEW_PREVIEW} most recent of {reviewCount}.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Recently added</CardTitle>
            <CardDescription className="text-[15px]">
              The last {RECENT_LIMIT} recipes to land.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {recent.error ? (
              <QueryError
                message={`Could not load recent recipes: ${recent.error.message}`}
              />
            ) : recentRecipes.length === 0 ? (
              <p className="text-base">
                No recipes yet.{" "}
                <Link href="/admin/recipes/new" className="underline underline-offset-4">
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
                    .join(", ")}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card className={CARD}>
          <CardHeader>
            <CardTitle className="font-display text-2xl">Shortcuts</CardTitle>
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
              href="/stock"
              title="What's in stock"
              meta="Pantry, fridge and freezer at a glance, with quick add"
            />
            <RowLink
              href="/recipes"
              title="Browse recipes"
              meta="The public collection, as visitors see it"
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
