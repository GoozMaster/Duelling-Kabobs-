"use client"

import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PantryItem, PantrySection } from "@/lib/pantry"
import { BASE_STAPLE_CATEGORY, STAPLE_CATEGORIES } from "@/lib/pantry"
import type { StockGroup, StockZone, StockZoneInfo } from "@/lib/stock"
import { buildStock, describeZone, STOCK_ZONES } from "@/lib/stock"

import { addPantryItem } from "../pantry/actions"

import s from "./stock.module.css"
import { ZoneArt } from "./zone-art"

type AddInput = { section: PantrySection; name: string; category: string | null }

function addItem(items: PantryItem[], item: PantryItem): PantryItem[] {
  return [...items, item]
}

export function StockRoom({ items }: { items: PantryItem[] }) {
  // Same optimistic pattern as My Pantry: the new jar lands on the shelf at
  // once, and revalidatePath swaps in the real row when the action returns.
  const [optimisticItems, addOptimistic] = useOptimistic(items, addItem)
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Partial<Record<StockZone, string>>>({})
  const [openZones, setOpenZones] = useState<Partial<Record<StockZone, boolean>>>({})
  const [justAdded, setJustAdded] = useState<string | null>(null)

  const stock = useMemo(() => buildStock(optimisticItems), [optimisticItems])
  const grandTotal = STOCK_ZONES.reduce((sum, zone) => sum + stock[zone.key].entries.length, 0)

  function handleAdd(zone: StockZone, input: AddInput) {
    setErrors((current) => ({ ...current, [zone]: undefined }))
    setJustAdded(input.name.toLowerCase())
    startTransition(async () => {
      addOptimistic({
        id: `optimistic-${crypto.randomUUID()}`,
        section: input.section,
        name: input.name,
        category: input.category,
        created_at: new Date().toISOString(),
      })

      const result = await addPantryItem(input)
      if (result.error) setErrors((current) => ({ ...current, [zone]: result.error! }))
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* The text summary doubles as the section switcher. */}
      <nav aria-label="Storage sections" className={`${s.jumpBar} -mx-4 px-4 py-3 sm:-mx-6 sm:px-6`}>
        <p className="text-muted-foreground mb-2 text-sm">
          <strong className="text-foreground">{grandTotal}</strong> things on hand across the
          pantry, fridge and freezer.
        </p>
        <ul className="grid grid-cols-3 gap-2 sm:gap-3">
          {STOCK_ZONES.map((zone) => {
            const count = stock[zone.key].entries.length
            const open = openZones[zone.key]
            return (
              <li key={zone.key}>
                <a
                  href={`#${zone.key}`}
                  aria-current={open ? "location" : undefined}
                  className={`border-border bg-card flex h-full flex-col rounded-[var(--sk-radius-md)] border-2 px-3 py-2 transition-[transform,box-shadow] hover:-translate-y-0.5 ${
                    open ? "shadow-[var(--sk-shadow-sticker)]" : "shadow-[var(--sk-shadow-press)]"
                  }`}
                >
                  <span className="font-[family-name:var(--sk-font-display)] text-base tracking-wide sm:text-lg">
                    {zone.label.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    <strong className="text-foreground text-sm">{count}</strong>{" "}
                    {count === 1 ? "item" : "items"}
                  </span>
                  <span className="text-muted-foreground mt-1 hidden text-xs sm:block">
                    {describeZone(zone.key, stock[zone.key].groups)}
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {STOCK_ZONES.map((zone) => (
        <ZoneSection
          key={zone.key}
          zone={zone}
          groups={stock[zone.key].groups}
          count={stock[zone.key].entries.length}
          error={errors[zone.key] ?? null}
          pending={pending}
          justAdded={justAdded}
          onAdd={(input) => handleAdd(zone.key, input)}
          onOpenChange={(open) =>
            setOpenZones((current) =>
              current[zone.key] === open ? current : { ...current, [zone.key]: open },
            )
          }
        />
      ))}
    </div>
  )
}

/**
 * Opens the door while the section is on screen and shuts it when it leaves,
 * so going back to a section plays the opening again. Tapping the drawing
 * overrides it until the next time the section scrolls in or out.
 */
function useDoor(onOpenChange: (open: boolean) => void) {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const report = useRef(onOpenChange)

  useEffect(() => {
    report.current = onOpenChange
  })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting
        setOpen(visible)
        report.current(visible)
      },
      // Open once a good chunk is on screen, not the moment an edge peeks in.
      { threshold: 0.3, rootMargin: "-10% 0px -10% 0px" },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, open, setOpen] as const
}

function ZoneSection({
  zone,
  groups,
  count,
  error,
  pending,
  justAdded,
  onAdd,
  onOpenChange,
}: {
  zone: StockZoneInfo
  groups: StockGroup[]
  count: number
  error: string | null
  pending: boolean
  justAdded: string | null
  onAdd: (input: AddInput) => void
  onOpenChange: (open: boolean) => void
}) {
  const [ref, open, setOpen] = useDoor(onOpenChange)

  return (
    <section
      ref={ref}
      id={zone.key}
      aria-labelledby={`${zone.key}-heading`}
      className={`${s.zone} border-border bg-card grid gap-6 rounded-[var(--sk-radius-lg)] border-2 p-4 shadow-[var(--sk-shadow-pop)] sm:p-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]`}
    >
      <div className="md:sticky md:top-40 md:self-start">
        <button
          type="button"
          className={s.artButton}
          onClick={() => setOpen((current) => !current)}
          aria-label={`${open ? "Close" : "Open"} the ${zone.label.toLowerCase()} door`}
          aria-pressed={open}
        >
          <ZoneArt zone={zone.key} groups={groups} open={open} />
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <header className="flex flex-col gap-1">
          <h2
            id={`${zone.key}-heading`}
            className="flex items-baseline gap-2 font-[family-name:var(--sk-font-display)] text-2xl tracking-wide"
          >
            {zone.label.toUpperCase()}
            <span className="text-muted-foreground font-[family-name:var(--sk-font-ui)] text-sm tracking-normal">
              {count} {count === 1 ? "item" : "items"}
            </span>
          </h2>
          <p className="text-muted-foreground text-sm">{zone.blurb}</p>
          <p className="text-sm">{describeZone(zone.key, groups)}</p>
        </header>

        <QuickAdd zone={zone} pending={pending} onAdd={onAdd} />

        <p
          role="status"
          aria-live="polite"
          className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 empty:hidden rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm"
        >
          {error}
        </p>

        {count === 0 ? (
          <p className="text-muted-foreground rounded-[var(--sk-radius-md)] border border-dashed px-3 py-6 text-center text-sm">
            Nothing in the {zone.label.toLowerCase()} yet. Add the first thing above.
          </p>
        ) : zone.key === "pantry" ? (
          <PantryList groups={groups} justAdded={justAdded} />
        ) : (
          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <div key={group.name} className="flex flex-col gap-1.5">
                <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                  {group.name}
                  <span className="ml-1 font-normal">{group.entries.length}</span>
                </h3>
                <ItemList group={group} justAdded={justAdded} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ItemList({ group, justAdded }: { group: StockGroup; justAdded: string | null }) {
  return (
    <ul className="border-border grid grid-cols-1 rounded-[var(--sk-radius-md)] border px-3 py-1 sm:grid-cols-2 sm:gap-x-6">
      {group.entries.map(({ item, standing }) => (
        <li
          key={item.id}
          className={`border-border/40 flex items-center justify-between gap-2 border-b py-1.5 text-sm last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0 ${
            justAdded === item.name.toLowerCase() ? s.fresh : ""
          }`}
        >
          <span className="truncate">{item.name}</span>
          {standing && (
            <Badge variant="outline" className="shrink-0" title="Always assumed on hand">
              standing
            </Badge>
          )}
        </li>
      ))}
    </ul>
  )
}

/**
 * Eighteen categories and 240-odd items. Collapsed headers carrying their
 * counts keep the section scannable, the same call My Pantry makes.
 */
function PantryList({ groups, justAdded }: { groups: StockGroup[]; justAdded: string | null }) {
  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <details
          key={group.name}
          className="border-border group rounded-[var(--sk-radius-md)] border open:pb-2"
          open={
            justAdded !== null &&
            group.entries.some((entry) => entry.item.name.toLowerCase() === justAdded)
              ? true
              : undefined
          }
        >
          <summary className="hover:bg-muted/40 flex cursor-pointer items-center justify-between gap-3 rounded-[var(--sk-radius-md)] px-3 py-2 text-sm font-medium select-none">
            <span>{group.name}</span>
            <span className="text-muted-foreground flex items-center gap-2 text-xs">
              {group.entries.length}
              <span aria-hidden className="transition-transform group-open:rotate-90">
                ›
              </span>
            </span>
          </summary>
          <div className="px-3">
            <ItemList group={group} justAdded={justAdded} />
          </div>
        </details>
      ))}
    </div>
  )
}

function QuickAdd({
  zone,
  pending,
  onAdd,
}: {
  zone: StockZoneInfo
  pending: boolean
  onAdd: (input: AddInput) => void
}) {
  const [name, setName] = useState("")
  // "Base" is the matcher's always-available list, not somewhere new things go.
  const categories = STAPLE_CATEGORIES.filter((category) => category !== BASE_STAPLE_CATEGORY)
  const [category, setCategory] = useState<string>(categories[0])
  const isPantry = zone.addSection === "staple"

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ section: zone.addSection, name: trimmed, category: isPantry ? category : null })
    setName("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-[var(--sk-surface)] flex flex-col gap-2 rounded-[var(--sk-radius-md)] border-2 p-3 sm:flex-row sm:items-end"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Label htmlFor={`${zone.key}-quick-add`}>Quick add to the {zone.label.toLowerCase()}</Label>
        <Input
          id={`${zone.key}-quick-add`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={PLACEHOLDER[zone.key]}
          autoComplete="off"
        />
      </div>

      {isPantry && (
        <div className="flex min-w-0 flex-col gap-1.5 sm:max-w-48">
          <Label htmlFor={`${zone.key}-quick-category`}>Category</Label>
          <select
            id={`${zone.key}-quick-category`}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 min-w-0 rounded-[var(--radius-md)] border px-2 text-sm focus-visible:ring-[3px] focus-visible:outline-none"
          >
            {categories.map((option) => (
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
  )
}

const PLACEHOLDER: Record<StockZone, string> = {
  pantry: "e.g. Farro",
  fridge: "e.g. Greek yogurt",
  freezer: "e.g. Puff pastry",
}
