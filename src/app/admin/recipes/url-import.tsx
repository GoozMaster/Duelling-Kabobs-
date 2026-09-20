"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DraftRecipe } from "@/lib/recipes"

import { importFromUrl } from "./actions"

type Props = {
  onImported: (draft: DraftRecipe, notice: string | null, sourceCuisine: string | null) => void
}

export function UrlImport({ onImported }: Props) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await importFromUrl(url)

      if (!result.ok) {
        setError(result.error)
        return
      }

      const count = result.draft.ingredients.filter((row) => row.name).length
      toast.success(
        count > 0
          ? `Found ${count} ingredients. Check it over before saving.`
          : "Opened an editable form.",
      )
      onImported(result.draft, result.notice, result.sourceCuisine)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="import-url">Recipe web address</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="import-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/recipes/doughnuts"
            disabled={pending}
            className="flex-1"
          />
          <Button
            type="submit"
            className="border-border shrink-0 border-2"
            disabled={pending || !url.trim()}
          >
            {pending ? "Reading…" : "Import"}
          </Button>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 empty:hidden rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm"
      >
        {error}
      </p>

      <p className="text-muted-foreground text-sm">
        Reads the recipe markup most cooking sites publish for search engines. Nothing is
        saved until you review it — a page with no markup just opens a blank form.
      </p>
    </form>
  )
}
