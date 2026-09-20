"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PantryItem, PantrySection } from "@/lib/pantry"
import { BASE_STAPLE_CATEGORY, STAPLE_CATEGORIES } from "@/lib/pantry"

import { PantryItemRow } from "./pantry-item-row"

type Props = {
  section: PantrySection
  label: string
  blurb: string
  items: PantryItem[]
  onAdd: (input: { section: PantrySection; name: string; category: string | null }) => void
  onRemove: (item: PantryItem) => void
  pending: boolean
}

export function SectionPanel({
  section,
  label,
  blurb,
  items,
  onAdd,
  onRemove,
  pending,
}: Props) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState<string>(STAPLE_CATEGORIES[1])
  const isStaple = section === "staple"

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return

    onAdd({ section, name: trimmed, category: isStaple ? category : null })
    setName("")
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">{blurb}</p>

      <form
        onSubmit={handleSubmit}
        className="border-border bg-[var(--sk-surface)] flex flex-col gap-3 rounded-[var(--sk-radius-md)] border-2 p-3 sm:flex-row sm:items-end"
      >
        <div className="flex flex-1 flex-col gap-1.5">
          <Label htmlFor={`${section}-name`}>Add to {label}</Label>
          <Input
            id={`${section}-name`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Item name"
            autoComplete="off"
          />
        </div>

        {isStaple && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="staple-category">Category</Label>
            {/* A native select rather than a component: nothing in components/ui
                covers it, and the native control handles 19 options, keyboard
                navigation and mobile pickers better than a custom menu would. */}
            <select
              id="staple-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-[var(--radius-md)] border px-2 text-sm focus-visible:ring-[3px] focus-visible:outline-none"
            >
              {STAPLE_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button type="submit" disabled={pending || !name.trim()} className="h-9 shrink-0">
          Add
        </Button>
      </form>

      {items.length === 0 ? (
        <p className="text-muted-foreground rounded-[var(--sk-radius-md)] border border-dashed px-3 py-6 text-center text-sm">
          Nothing in {label} yet.
        </p>
      ) : isStaple ? (
        <StapleCategories items={items} onRemove={onRemove} pending={pending} />
      ) : (
        <ul className="border-border rounded-[var(--sk-radius-md)] border px-3 py-1">
          {items.map((item) => (
            <PantryItemRow
              key={item.id}
              item={item}
              onRemove={onRemove}
              disabled={pending}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Nineteen categories, and extremely lopsided — Dried Herbs & Spices alone holds
 * 54 items while Specialty / International holds one. Collapsed headers carrying
 * their own counts suit that far better than tabs, which would give a 1-item
 * category the same visual weight as a 54-item one.
 *
 * Native <details> rather than a component: it brings keyboard and screen-reader
 * behaviour for free, and adds no dependency.
 */
function StapleCategories({
  items,
  onRemove,
  pending,
}: {
  items: PantryItem[]
  onRemove: (item: PantryItem) => void
  pending: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      {STAPLE_CATEGORIES.map((category) => {
        const inCategory = items.filter((item) => item.category === category)
        if (inCategory.length === 0) return null

        return (
          <details
            key={category}
            className="border-border group rounded-[var(--sk-radius-md)] border open:pb-2"
          >
            <summary className="hover:bg-muted/40 flex cursor-pointer items-center justify-between gap-3 rounded-[var(--sk-radius-md)] px-3 py-2 text-sm font-medium select-none">
              <span>{category}</span>
              <span className="text-muted-foreground flex items-center gap-2 text-xs">
                {inCategory.length}
                <span aria-hidden className="transition-transform group-open:rotate-90">
                  ›
                </span>
              </span>
            </summary>

            {category === BASE_STAPLE_CATEGORY && (
              <p className="text-muted-foreground px-3 pb-1 text-xs">
                Never reported as missing when matching recipes.
              </p>
            )}

            <ul className="px-3">
              {inCategory.map((item) => (
                <PantryItemRow
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  disabled={pending}
                />
              ))}
            </ul>
          </details>
        )
      })}
    </div>
  )
}
