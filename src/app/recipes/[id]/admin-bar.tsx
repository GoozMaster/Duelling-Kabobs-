"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

import { deleteRecipe, markReviewed } from "./actions"

type Props = {
  id: string
  title: string
  ingredientCount: number
  needsReview: boolean
}

export function AdminBar({ id, title, ingredientCount, needsReview }: Props) {
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleMarkReviewed() {
    setError(null)
    startTransition(async () => {
      const result = await markReviewed(id)
      if (result.error) setError(result.error)
      else toast.success("Marked as reviewed")
    })
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      // On success this redirects and never returns, so anything here is a
      // failure the admin needs to see.
      const result = await deleteRecipe(id)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="border-border bg-[var(--sk-sand)] flex flex-col gap-3 rounded-[var(--sk-radius-md)] border-2 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Admin</span>

        <Button asChild size="sm" variant="outline" className="border-border border-2">
          <Link href={`/admin/recipes/${id}/edit`}>Edit</Link>
        </Button>

        {needsReview && (
          <Button
            type="button"
            size="sm"
            onClick={handleMarkReviewed}
            disabled={pending}
            className="border-border border-2"
          >
            {pending ? "Saving…" : "Mark reviewed"}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={pending}
              className="ml-auto"
            >
              Delete
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{title}”?</AlertDialogTitle>
              {/* Naming the ingredient count is the point: the cascade is the
                  part that is easy to forget, and nothing in this app can undo
                  it. */}
              <AlertDialogDescription>
                This also deletes its {ingredientCount}{" "}
                {ingredientCount === 1 ? "ingredient" : "ingredients"}. There is no undo —
                you would have to enter the recipe again from scratch.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Delete the recipe
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
    </div>
  )
}
