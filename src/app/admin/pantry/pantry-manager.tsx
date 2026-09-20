"use client"

import { useOptimistic, useState, useTransition } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PantryItem, PantrySection } from "@/lib/pantry"
import { PANTRY_SECTIONS } from "@/lib/pantry"

import { addPantryItem, deletePantryItem } from "./actions"
import { PantryItemRow } from "./pantry-item-row"
import { SectionPanel } from "./section-panel"

type OptimisticAction =
  | { type: "add"; item: PantryItem }
  | { type: "remove"; id: string }

function applyAction(items: PantryItem[], action: OptimisticAction): PantryItem[] {
  if (action.type === "remove") {
    return items.filter((item) => item.id !== action.id)
  }
  return [...items, action.item].sort((a, b) => a.name.localeCompare(b.name))
}

export function PantryManager({ items }: { items: PantryItem[] }) {
  // The optimistic list paints an add or delete straight away; revalidatePath in
  // the action then replaces `items` and React reconciles. Without this, every
  // delete would re-render a 250-item page over a round-trip before anything
  // visibly happened. A failed write simply never reaches the base list, so the
  // optimistic row vanishes on its own when the transition ends.
  const [optimisticItems, applyOptimistic] = useOptimistic(items, applyAction)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("")

  function handleAdd(input: {
    section: PantrySection
    name: string
    category: string | null
  }) {
    setError(null)
    startTransition(async () => {
      applyOptimistic({
        type: "add",
        item: {
          id: `optimistic-${crypto.randomUUID()}`,
          section: input.section,
          name: input.name,
          category: input.category,
          created_at: new Date().toISOString(),
        },
      })

      const result = await addPantryItem(input)
      if (result.error) setError(result.error)
    })
  }

  function handleRemove(item: PantryItem) {
    setError(null)
    startTransition(async () => {
      applyOptimistic({ type: "remove", id: item.id })

      const result = await deletePantryItem(item.id)
      if (result.error) setError(result.error)
    })
  }

  const query = filter.trim().toLowerCase()
  const matches = query
    ? optimisticItems.filter((item) => item.name.toLowerCase().includes(query))
    : []

  return (
    <Card className="border-border gap-5 rounded-[var(--sk-radius-lg)] border-2 shadow-[var(--sk-shadow-pop)]">
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="pantry-filter">Find an item</Label>
          <Input
            id="pantry-filter"
            type="search"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value)
              // An "already in your Fridge" warning has nothing to say about a
              // search, and leaving it up makes it look like the search failed.
              setError(null)
            }}
            placeholder="Search every section…"
            autoComplete="off"
          />
        </div>

        <p
          role="status"
          aria-live="polite"
          className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 empty:hidden rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm"
        >
          {error}
        </p>

        {/* While filtering, the tabs give way to one flat list spanning all four
            sections. Searching within a tab would answer "is it in Staples?"
            when the real question is "do I have it at all?" — and it avoids
            force-opening accordions to reveal matches. */}
        {query ? (
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground text-sm">
              {matches.length === 0
                ? `Nothing matching “${filter.trim()}”. You can add it below by clearing the search.`
                : `${matches.length} ${matches.length === 1 ? "match" : "matches"} across your whole pantry.`}
            </p>

            {matches.length > 0 && (
              <ul className="border-border rounded-[var(--sk-radius-md)] border px-3 py-1">
                {matches.map((item) => (
                  <PantryItemRow
                    key={item.id}
                    item={item}
                    showSection
                    onRemove={handleRemove}
                    disabled={pending}
                  />
                ))}
              </ul>
            )}
          </div>
        ) : (
          <Tabs defaultValue="staple">
            <TabsList className="h-auto w-full flex-wrap">
              {PANTRY_SECTIONS.map((section) => (
                <TabsTrigger key={section.key} value={section.key}>
                  {section.label}
                  <span className="text-muted-foreground ml-1 text-xs">
                    {optimisticItems.filter((item) => item.section === section.key).length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {PANTRY_SECTIONS.map((section) => (
              <TabsContent key={section.key} value={section.key} className="pt-2">
                <SectionPanel
                  section={section.key}
                  label={section.label}
                  blurb={section.blurb}
                  items={optimisticItems.filter((item) => item.section === section.key)}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                  pending={pending}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  )
}
