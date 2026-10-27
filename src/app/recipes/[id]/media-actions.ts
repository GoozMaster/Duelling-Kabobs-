"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/auth"
import { instagramPost, safeImageUrl, youtubeId } from "@/lib/recipe-media"
import { createClient } from "@/lib/supabase/server"

export type MediaActionResult = { error: string | null }

/**
 * Saves a recipe's YouTube or Instagram video link and dish photo. Blank clears the field.
 *
 * Kept apart from save_recipe() on purpose: the recipe form never touches these
 * columns, so editing a recipe can't wipe them. Calls requireAdmin() itself for
 * the same reason the other actions do — a Server Action is a public POST
 * endpoint — and RLS refuses a non-admin write regardless.
 */
export async function saveRecipeMedia(
  id: string,
  youtube: string,
  image: string,
): Promise<MediaActionResult> {
  await requireAdmin()

  const yt = youtube.trim()
  const img = image.trim()

  if (yt && !youtubeId(yt) && !instagramPost(yt)) {
    return {
      error:
        "That doesn't look like a YouTube link (watch, youtu.be or shorts) or an Instagram post or reel.",
    }
  }
  if (img && !safeImageUrl(img)) {
    return { error: "The photo link must be a full https:// address." }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("recipes")
    .update({ youtube_url: yt || null, image_url: img || null })
    .eq("id", id)
    .select("id")

  if (error) {
    // The columns come from a migration that may not be applied yet.
    return {
      error: /youtube_url|image_url|column/i.test(error.message)
        ? "The database doesn't have the video/photo columns yet — apply the recipe_media migration first."
        : error.message,
    }
  }
  if (!data || data.length === 0) return { error: "That recipe no longer exists." }

  revalidatePath(`/recipes/${id}`)
  return { error: null }
}
