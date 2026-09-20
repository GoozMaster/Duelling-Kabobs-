"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DraftRecipe } from "@/lib/recipes"

import { addCuisine, saveRecipe } from "./actions"
import { IngredientRows } from "./ingredient-rows"

const OTHER = "__other__"

const selectClass =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-[var(--radius-md)] border px-2 text-sm focus-visible:ring-[3px] focus-visible:outline-none"

type Props = {
  draft: DraftRecipe
  cuisines: string[]
  /** Edit mode keeps you on the same recipe; create mode moves you onto it. */
  mode: "create" | "edit"
}

export function RecipeForm({ draft: initialDraft, cuisines: initialCuisines, mode }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<DraftRecipe>(initialDraft)
  const [cuisines, setCuisines] = useState(initialCuisines)
  const [newCuisine, setNewCuisine] = useState("")
  const [choosingOther, setChoosingOther] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function patch(changes: Partial<DraftRecipe>) {
    setDraft((current) => ({ ...current, ...changes }))
  }

  function handleAddCuisine() {
    const name = newCuisine.trim()
    if (!name) return

    startTransition(async () => {
      const result = await addCuisine(name)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setCuisines((current) =>
        current.includes(name) ? current : [...current, name].sort(),
      )
      patch({ cuisine: name })
      setNewCuisine("")
      setChoosingOther(false)
      toast.success(`Added "${name}" to your cuisines`)
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await saveRecipe(draft)

      if (!result.ok) {
        setError(result.error)
        return
      }

      toast.success(mode === "edit" ? "Recipe updated" : "Recipe saved")

      if (mode === "create") {
        // Straight onto the saved recipe's own edit route, so the next thing you
        // see is the round-tripped data rather than a form you have to trust.
        router.push(`/admin/recipes/${result.id}/edit`)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={draft.title}
          onChange={(event) => patch({ title: event.target.value })}
          placeholder="Yeasted Doughnuts"
          disabled={pending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cuisine">Cuisine</Label>
        {/* The spec named Dropdown-menu, but that is a menu primitive with no
            form value, no label association and no native mobile picker. A
            select is the right control, and matches My Pantry's category field. */}
        <select
          id="cuisine"
          className={`${selectClass} w-fit min-w-48`}
          value={choosingOther ? OTHER : (draft.cuisine ?? "")}
          onChange={(event) => {
            if (event.target.value === OTHER) {
              setChoosingOther(true)
              return
            }
            setChoosingOther(false)
            patch({ cuisine: event.target.value || null })
          }}
          disabled={pending}
        >
          <option value="">No cuisine</option>
          {cuisines.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
          <option value={OTHER}>Other…</option>
        </select>

        {choosingOther && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Input
              value={newCuisine}
              onChange={(event) => setNewCuisine(event.target.value)}
              placeholder="New cuisine name"
              aria-label="New cuisine name"
              disabled={pending}
              className="w-56"
            />
            <Button
              type="button"
              onClick={handleAddCuisine}
              disabled={pending || !newCuisine.trim()}
            >
              Add cuisine
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setChoosingOther(false)
                setNewCuisine("")
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <IngredientRows
        ingredients={draft.ingredients}
        onChange={(ingredients) => patch({ ingredients })}
        disabled={pending}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="instructions">Instructions</Label>
        <textarea
          id="instructions"
          value={draft.instructions}
          onChange={(event) => patch({ instructions: event.target.value })}
          rows={10}
          placeholder="1. Bloom the yeast…"
          disabled={pending}
          className={`${selectClass} h-auto py-2 leading-relaxed`}
        />
      </div>

      {draft.needsReview && (
        <label className="border-border flex items-center gap-2 rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={draft.needsReview}
            onChange={(event) => patch({ needsReview: event.target.checked })}
            disabled={pending}
            className="accent-[var(--sk-brick)] size-4"
          />
          Still needs review — uncheck once you have tagged the ingredients.
        </label>
      )}

      <p
        role="status"
        aria-live="polite"
        className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 empty:hidden rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm"
      >
        {error}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={pending}
          className="border-border h-11 border-2 shadow-[var(--sk-shadow-sticker)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[var(--sk-shadow-press)]"
        >
          {pending ? "Saving…" : mode === "edit" ? "Save changes" : "Save recipe"}
        </Button>
      </div>
    </form>
  )
}
