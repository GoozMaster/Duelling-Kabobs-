import {
  instagramEmbedUrl,
  instagramPost,
  safeImageUrl,
  youtubeEmbedUrl,
  youtubeId,
  youtubeStart,
} from "@/lib/recipe-media"

import { MediaEditor } from "./media-editor"

type Props = {
  id: string
  title: string
  isAdmin: boolean
  // Optional and possibly undefined at runtime: the columns come from a
  // migration, and until it is applied the row simply doesn't carry them.
  youtubeUrl?: string | null
  imageUrl?: string | null
}

const frame =
  "w-full overflow-hidden rounded-[var(--sk-radius-lg)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] shadow-[var(--sk-shadow-sticker)]"

/**
 * The video, or failing that the photo, for a recipe page.
 *
 * A YouTube or Instagram link wins over a photo: the photo is the fallback for recipes
 * without a video. With neither, visitors see nothing at all (no empty box);
 * the admin sees the editor so they can add one.
 */
export function RecipeMedia({ id, title, isAdmin, youtubeUrl, imageUrl }: Props) {
  const videoId = youtubeId(youtubeUrl)
  const instagram = videoId ? null : instagramPost(youtubeUrl)
  const image = safeImageUrl(imageUrl)

  if (!videoId && !instagram && !image && !isAdmin) return null

  return (
    <section aria-label="Video or photo" className="flex max-w-3xl flex-col gap-4">
      {videoId ? (
        <div className={`${frame} aspect-video`}>
          <iframe
            src={youtubeEmbedUrl(videoId, youtubeStart(youtubeUrl))}
            title={`Video: ${title}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="size-full"
          />
        </div>
      ) : instagram ? (
        // Instagram's own embed page: portrait, so a centred, height-capped
        // frame rather than the 16:9 box. Its caption/footer scroll inside.
        <div className={`${frame} mx-auto aspect-[9/16] max-h-[85vh] max-w-[420px]`}>
          <iframe
            src={instagramEmbedUrl(instagram)}
            title={`Instagram video: ${title}`}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
            className="size-full"
          />
        </div>
      ) : (
        image && (
          <figure className={frame}>
            {/* A plain <img>: the host is whatever the admin pasted, so it
                can't be listed in next/image's remotePatterns ahead of time. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt={`${title}, finished dish`}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="block max-h-[70vh] w-full object-cover"
            />
          </figure>
        )
      )}

      {isAdmin && (
        <MediaEditor id={id} youtubeUrl={youtubeUrl ?? ""} imageUrl={imageUrl ?? ""} />
      )}
    </section>
  )
}
