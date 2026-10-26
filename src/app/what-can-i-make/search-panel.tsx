"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"

import { CookingAnimation } from "@/components/home/cooking-animation"
import { RecipeCard } from "@/components/recipe-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { type FindRecipesResult, findRecipes } from "./actions"

type Props = {
  isAdmin: boolean
  initial: FindRecipesResult
}

export function SearchPanel({ isAdmin, initial }: Props) {
  const [typed, setTyped] = useState<string[]>([])
  const [draft, setDraft] = useState("")
  const [results, setResults] = useState<FindRecipesResult>(initial)
  const [pending, startTransition] = useTransition()

  // Re-matches whenever the ingredient list changes. The admin's pantry is
  // already folded in server-side, so an empty list is still a real query.
  useEffect(() => {
    startTransition(async () => {
      setResults(await findRecipes(typed))
    })
  }, [typed])

  function addDraft() {
    const value = draft.trim()
    if (!value) return
    // Case-insensitive de-dupe: "Onion" and "onion" are one ingredient.
    if (!typed.some((t) => t.toLowerCase() === value.toLowerCase())) {
      setTyped((current) => [...current, value])
    }
    setDraft("")
  }

  const nothingFound = results.recipes.length === 0
  const ready = results.recipes.filter((recipe) => recipe.missing.length === 0)
  // A public visitor who has typed nothing is looking at a ranking built from
  // the assumed staples alone. Saying so turns what looked like an answer into
  // an invitation to start. The admin always has a pantry behind the list.
  const firstRun = !isAdmin && typed.length === 0

  const heading =
    ready.length > 0
      ? `${ready.length} you can cook right now`
      : firstRun
        ? "Start with what you have"
        : "Closest matches"

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)] lg:gap-12">
      <div className="flex flex-col gap-4 rounded-[var(--sk-radius-lg)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] p-5 shadow-[var(--sk-shadow-pop)] lg:sticky lg:top-24">
        {isAdmin && (
          <p className="text-[15px]">
            Using your pantry — <strong>{results.pantryCount} items</strong>.{" "}
            <Link
              href="/admin/pantry"
              className="underline underline-offset-4"
            >
              Adjust it
            </Link>
            . Anything you add below counts as well.
          </p>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            addDraft()
          }}
          className="flex flex-col gap-2"
        >
          <Label htmlFor="ingredient" className="text-base font-semibold">
            {isAdmin ? "Anything else you have?" : "What do you have?"}
          </Label>
          <div className="flex gap-2">
            <Input
              id="ingredient"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="chicken thighs"
              autoComplete="off"
              className="h-11 flex-1 rounded-[var(--sk-radius-pill)] border-2 border-[var(--sk-outline)] px-4 text-base"
            />
            <Button
              type="submit"
              className="h-11 shrink-0 rounded-[var(--sk-radius-pill)] border-2 border-[var(--sk-outline)] px-5 text-base font-semibold"
              disabled={!draft.trim()}
            >
              Add
            </Button>
          </div>
        </form>

        {typed.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {typed.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() =>
                    setTyped((current) => current.filter((t) => t !== item))
                  }
                  className="border-border bg-primary text-primary-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1.5 rounded-[var(--sk-radius-pill)] border-2 px-3 py-1 text-[15px] font-semibold focus-visible:ring-[3px] focus-visible:outline-none"
                  aria-label={`Remove ${item}`}
                >
                  {item}
                  <span aria-hidden>×</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-muted-foreground text-sm">
          Salt, pepper, butter, milk, eggs, water and cooking oil are assumed — no need to
          list them.
        </p>
      </div>

      {/* The results region unmounts while the animation plays, so a live
          region inside it would be destroyed before it could speak. This one
          stays mounted and tells screen readers what the swap meant. */}
      <p role="status" className="sr-only">
        {pending ? "Matching recipes…" : nothingFound ? "" : heading}
      </p>

      {pending ? (
        <CookingAnimation count={typed.length} />
      ) : nothingFound ? (
        <p className="rounded-[var(--sk-radius-lg)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] px-4 py-10 text-center text-lg">
          No recipes to match against yet.
        </p>
      ) : (
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-[clamp(26px,2.6vw,34px)] leading-none">
              {heading}
            </h2>
            {firstRun && ready.length === 0 && (
              <p className="mt-2 text-base">
                Add a few ingredients. Until then, these are ranked against
                the staples alone.
              </p>
            )}
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {results.recipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCard
                  size="sm"
                  id={recipe.id}
                  title={recipe.title}
                  cuisine={recipe.cuisine}
                  meta={
                    <span
                      className={
                        recipe.missing.length === 0
                          ? "text-[var(--sk-basil)] font-semibold"
                          : ""
                      }
                    >
                      {recipe.missing.length === 0
                        ? "All ingredients in"
                        : `${recipe.have} of ${recipe.totalRequired} ingredients`}
                    </span>
                  }
                  /* Naming what is absent is the useful part — "missing 2"
                     alone sends you back to the recipe to work out which two.
                     Long lists are cut off rather than swamping the card. */
                  note={
                    recipe.missing.length > 0 ? (
                      <span className="text-muted-foreground text-sm">
                        Need: {recipe.missing.slice(0, 3).join(", ")}
                        {recipe.missing.length > 3 &&
                          ` +${recipe.missing.length - 3} more`}
                      </span>
                    ) : null
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
