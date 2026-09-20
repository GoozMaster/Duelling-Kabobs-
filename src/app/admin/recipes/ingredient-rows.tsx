"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type DraftIngredient,
  emptyIngredient,
  groupIngredients,
} from "@/lib/recipes"

type Props = {
  ingredients: DraftIngredient[]
  onChange: (ingredients: DraftIngredient[]) => void
  disabled?: boolean
}

export function IngredientRows({ ingredients, onChange, disabled }: Props) {
  function update(key: string, patch: Partial<DraftIngredient>) {
    onChange(ingredients.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  function remove(key: string) {
    const next = ingredients.filter((row) => row.key !== key)
    // Never leave the list empty — an empty row is an invitation to type,
    // whereas nothing at all looks broken.
    onChange(next.length > 0 ? next : [emptyIngredient()])
  }

  // Reordering is what sets sort_order: the array index *is* the order, so
  // moving a row is a swap and nothing has to be renumbered afterwards.
  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= ingredients.length) return

    const next = ingredients.slice()
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const groups = groupIngredients(ingredients)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Label>Ingredients</Label>
        <span className="text-muted-foreground text-xs">
          {groups.length > 1
            ? `${ingredients.length} across ${groups.length} groups`
            : `${ingredients.length}`}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {ingredients.map((row, index) => {
          // A label is only worth repeating when it changes: consecutive rows
          // sharing a group read as one block, which is how the recipe itself
          // is organised.
          const startsGroup =
            index === 0 || ingredients[index - 1].groupLabel.trim() !== row.groupLabel.trim()

          return (
            <li
              key={row.key}
              className="border-border bg-[var(--sk-surface)] flex flex-col gap-2 rounded-[var(--sk-radius-md)] border p-2"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={row.name}
                  onChange={(event) => update(row.key, { name: event.target.value })}
                  placeholder="Ingredient"
                  aria-label={`Ingredient ${index + 1} name`}
                  disabled={disabled}
                  className="flex-1"
                />

                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => move(index, -1)}
                    disabled={disabled || index === 0}
                    aria-label={`Move ${row.name || `ingredient ${index + 1}`} up`}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => move(index, 1)}
                    disabled={disabled || index === ingredients.length - 1}
                    aria-label={`Move ${row.name || `ingredient ${index + 1}`} down`}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(row.key)}
                    disabled={disabled}
                    aria-label={`Remove ${row.name || `ingredient ${index + 1}`}`}
                  >
                    ×
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={row.groupLabel}
                  onChange={(event) => update(row.key, { groupLabel: event.target.value })}
                  placeholder="Group, e.g. Dough (optional)"
                  aria-label={`Ingredient ${index + 1} group`}
                  disabled={disabled}
                  className={`sm:w-48 ${startsGroup ? "" : "opacity-60"}`}
                />
                <Input
                  value={row.substitution}
                  onChange={(event) =>
                    update(row.key, { substitution: event.target.value })
                  }
                  placeholder="Substitution (optional)"
                  aria-label={`Ingredient ${index + 1} substitution`}
                  disabled={disabled}
                  className="flex-1"
                />
                <label className="flex shrink-0 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={row.required}
                    onChange={(event) =>
                      update(row.key, { required: event.target.checked })
                    }
                    disabled={disabled}
                    className="accent-[var(--sk-brick)] size-4"
                  />
                  Required
                </label>
              </div>
            </li>
          )
        })}
      </ul>

      <Button
        type="button"
        variant="outline"
        className="border-border w-fit border-2"
        onClick={() => onChange([...ingredients, emptyIngredient()])}
        disabled={disabled}
      >
        Add ingredient
      </Button>

      <p className="text-muted-foreground text-xs">
        Leave Group blank for a flat list. Unchecking Required marks an ingredient
        optional, so a missing one never rules the recipe out when matching your pantry.
      </p>
    </div>
  )
}
