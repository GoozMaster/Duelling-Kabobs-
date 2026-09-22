"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"

import { PotSearch } from "@/components/home/pot-search"
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

      {pending ? (
        <PotSearch count={typed.length} />
      ) : nothingFound ? (
        <p className="text-muted-foreground rounded-[var(--sk-radius-md)] border border-dashed px-4 py-10 text-center text-sm">
          No recipes to match against yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <h2 className="font-[family-name:var(--sk-font-display)] text-xl tracking-wide">
            {ready.length > 0
              ? `${ready.length} you can cook right now`
              : "Closest to your kitchen"}
          </h2>

          <ul className="grid gap-3 sm:grid-cols-2">
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
                          ? "text-[var(--sk-basil)] text-xs font-semibold"
                          : "text-muted-foreground text-xs"
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
                      <span className="text-muted-foreground text-xs">
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
