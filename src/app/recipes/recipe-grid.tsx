"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"

import { RecipeCard } from "@/components/recipe-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { RecipeSummary } from "@/lib/recipe-browse"

import { loadMoreRecipes } from "./actions"

type Props = {
  initial: RecipeSummary[]
  initialHasMore: boolean
  cuisine: string | null
  isAdminViewer: boolean
}

export function RecipeGrid({ initial, initialHasMore, cuisine, isAdminViewer }: Props) {
  const [recipes, setRecipes] = useState(initial)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isAdmin, setIsAdmin] = useState(isAdminViewer)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const sentinel = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  // No effect resets this state when the filter changes: page.tsx passes
  // key={cuisine} so the component remounts and useState re-seeds from props.
  // Syncing props into state in an effect would be a second, redundant
  // mechanism — and one render behind.

  const loadMore = useCallback(() => {
    // A ref, not the `pending` flag: the observer can fire again before React
    // has re-rendered with pending=true, which would request the same page
    // twice and paint duplicates.
    if (loadingRef.current || !hasMore) return

    const last = recipes[recipes.length - 1]
    if (!last) return

    loadingRef.current = true
    setError(null)

    startTransition(async () => {
      try {
        const page = await loadMoreRecipes(cuisine, last.title)
        setRecipes((current) => {
          // Guard against a duplicate arriving anyway — cheap, and a repeated
          // React key is a far worse symptom than a wasted request.
          const seen = new Set(current.map((recipe) => recipe.id))
          return [...current, ...page.recipes.filter((r) => !seen.has(r.id))]
        })
        setHasMore(page.hasMore)
        setIsAdmin(page.isAdminViewer)
      } catch {
        setError("Could not load more recipes.")
        setHasMore(false)
      } finally {
        loadingRef.current = false
      }
    })
  }, [cuisine, hasMore, recipes])

  useEffect(() => {
    const node = sentinel.current
    if (!node || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: "400px" }, // start fetching before it is actually in view
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (recipes.length === 0) {
    return (
      <p className="text-muted-foreground rounded-[var(--sk-radius-md)] border border-dashed px-4 py-12 text-center">
        {cuisine
          ? `No ${cuisine} recipes yet.`
          : "No recipes yet. They will show up here as they are added."}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <RecipeCard
              id={recipe.id}
              title={recipe.title}
              cuisine={recipe.cuisine}
              /* Admin-only. Every imported recipe is flagged, so showing this
                 publicly would put a "needs review" badge on all 126. */
              meta={
                isAdmin && recipe.needs_review ? (
                  <Badge variant="destructive">Needs review</Badge>
                ) : null
              }
            />
          </li>
        ))}
      </ul>

      {error && (
        <p role="status" className="text-destructive text-center text-sm">
          {error}
        </p>
      )}

      {hasMore ? (
        <div className="flex flex-col items-center gap-2">
          {/* The observer drives this button rather than replacing it: an
              observer alone is unreachable by keyboard and does nothing without
              JavaScript. */}
          <Button
            type="button"
            variant="outline"
            className="border-border border-2"
            onClick={loadMore}
            disabled={pending}
          >
            {pending ? "Loading…" : "Load more"}
          </Button>
          <div ref={sentinel} aria-hidden className="h-px w-full" />
        </div>
      ) : (
        <p className="text-muted-foreground text-center text-sm">
          That is all {recipes.length} {recipes.length === 1 ? "recipe" : "recipes"}
          {cuisine ? ` in ${cuisine}` : ""}.
        </p>
      )}
    </div>
  )
}
