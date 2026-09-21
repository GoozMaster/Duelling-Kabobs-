"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"

import { RecipeCard } from "@/components/recipe-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { type FindRecipesResult, type MatchResult, findRecipes } from "./actions"

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

  const nothingFound =
    results.exact.length === 0 &&
    results.missingOne.length === 0 &&
    results.missingTwo.length === 0

  return (
    <div className="flex flex-col gap-6">
      <div className="border-border bg-card flex flex-col gap-3 rounded-[var(--sk-radius-lg)] border-2 p-4 shadow-[var(--sk-shadow-pop)]">
        {isAdmin && (
          <p className="text-sm">
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
          className="flex flex-col gap-1.5"
        >
          <Label htmlFor="ingredient">
            {isAdmin ? "Anything else you have?" : "What do you have?"}
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="ingredient"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="chicken thighs"
              autoComplete="off"
              className="flex-1"
            />
            <Button
              type="submit"
              className="border-border shrink-0 border-2"
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
                  className="border-border bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-[var(--sk-radius-pill)] border-2 px-3 py-1 text-sm"
                  aria-label={`Remove ${item}`}
                >
                  {item}
                  <span aria-hidden>×</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-muted-foreground text-xs">
          Salt, pepper, butter, milk, eggs, water and cooking oil are assumed — no need to
          list them.
        </p>
      </div>

      {pending && <p className="text-muted-foreground text-sm">Matching…</p>}

      {nothingFound && !pending ? (
        <p className="text-muted-foreground rounded-[var(--sk-radius-md)] border border-dashed px-4 py-10 text-center text-sm">
          Nothing matches yet — not even close. Add a few more ingredients.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <Bucket
            title="You can make these now"
            blurb="Every ingredient is on hand."
            recipes={results.exact}
          />
          <Bucket
            title="One ingredient away"
            blurb="Pick up the one thing listed and these are yours."
            recipes={results.missingOne}
          />
          <Bucket
            title="Two ingredients away"
            blurb=""
            recipes={results.missingTwo}
          />
        </div>
      )}
    </div>
  )
}

function Bucket({
  title,
  blurb,
  recipes,
}: {
  title: string
  blurb: string
  recipes: MatchResult[]
}) {
  if (recipes.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-[family-name:var(--sk-font-display)] text-xl tracking-wide">
          {title} <span className="text-muted-foreground">({recipes.length})</span>
        </h2>
        {blurb && <p className="text-muted-foreground text-sm">{blurb}</p>}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <RecipeCard
              size="sm"
              id={recipe.id}
              title={recipe.title}
              cuisine={recipe.cuisine}
              meta={
                <span className="text-muted-foreground text-xs">
                  {recipe.totalRequired} ingredients
                </span>
              }
              /* Naming what is absent is the useful part — "missing 2" alone
                 sends you back to the recipe to work out which two. */
              note={
                recipe.missing.length > 0 ? (
                  <span className="text-destructive text-xs">
                    Need: {recipe.missing.join(", ")}
                  </span>
                ) : null
              }
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
