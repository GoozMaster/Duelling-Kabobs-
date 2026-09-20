"use client"

import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PantryItem, PantrySection } from "@/lib/pantry"
import { sectionLabel } from "@/lib/pantry"

type Props = {
  item: PantryItem
  /** Shown only in filter results, where rows from all four sections are mixed. */
  showSection?: boolean
  onRemove: (item: PantryItem) => void
  disabled?: boolean
}

/**
 * Removal is a two-step in-place confirm rather than a modal. It needs no new
 * dependency, traps no focus, and is proportionate to an action you can undo by
 * retyping a name.
 */
export function PantryItemRow({ item, showSection, onRemove, disabled }: Props) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="border-border/40 flex items-center justify-between gap-3 border-b py-1.5 last:border-b-0">
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm">{item.name}</span>
        {showSection && (
          <Badge variant="outline" className="shrink-0">
            {sectionLabel(item.section as PantrySection)}
          </Badge>
        )}
      </span>

      {confirming ? (
        <span className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="xs"
            variant="destructive"
            disabled={disabled}
            onClick={() => {
              setConfirming(false)
              onRemove(item)
            }}
          >
            Remove?
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            onClick={() => setConfirming(false)}
          >
            Cancel
          </Button>
        </span>
      ) : (
        <Button
          type="button"
          size="xs"
          variant="ghost"
          className="text-muted-foreground hover:text-destructive shrink-0"
          onClick={() => setConfirming(true)}
          aria-label={`Remove ${item.name}`}
        >
          Remove
        </Button>
      )}
    </li>
  )
}
