"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { saveRecipeMedia } from "./media-actions"

type Props = { id: string; youtubeUrl: string; imageUrl: string }

/** Admin-only: paste a YouTube link and/or a photo link. Blank removes it. */
export function MediaEditor({ id, youtubeUrl, imageUrl }: Props) {
  const [youtube, setYoutube] = useState(youtubeUrl)
  const [image, setImage] = useState(imageUrl)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await saveRecipeMedia(id, youtube, image)
      if (result.error) setError(result.error)
      else toast.success("Video and photo saved")
    })
  }

  return (
    <details
      className="rounded-[var(--sk-radius-lg)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-sand)] px-4 py-3"
      open={!youtubeUrl && !imageUrl}
    >
      <summary className="cursor-pointer text-base font-semibold">
        Admin: video &amp; photo
      </summary>
      <form onSubmit={handleSave} className="flex flex-col gap-4 pt-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="media-youtube">YouTube link</Label>
          <Input
            id="media-youtube"
            type="url"
            inputMode="url"
            placeholder="https://www.youtube.com/watch?v=…"
            value={youtube}
            onChange={(event) => setYoutube(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="media-image">Photo of the finished dish (https link)</Label>
          <Input
            id="media-image"
            type="url"
            inputMode="url"
            placeholder="https://…/dish.jpg"
            value={image}
            onChange={(event) => setImage(event.target.value)}
          />
          <p className="text-muted-foreground text-sm">
            Shown only when there is no YouTube link. Leave a field blank to remove it.
          </p>
        </div>
        <div>
          <Button type="submit" size="sm" disabled={pending} className="border-border border-2">
            {pending ? "Saving…" : "Save"}
          </Button>
        </div>
        {error && (
          <p
            role="status"
            aria-live="polite"
            className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm"
          >
            {error}
          </p>
        )}
      </form>
    </details>
  )
}
