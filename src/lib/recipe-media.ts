/**
 * Helpers for the video / photo shown on a recipe page.
 *
 * Both values are free text an admin typed and both end up in markup that
 * anonymous visitors load, so each is reduced to something provably safe
 * before it reaches the page: a YouTube video id (11 chars of [A-Za-z0-9_-],
 * which can only ever build a youtube-nocookie.com embed URL) or an https URL.
 */

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
])

function parseUrl(raw: string | null | undefined): URL | null {
  const value = raw?.trim()
  if (!value) return null
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return url.protocol === "https:" || url.protocol === "http:" ? url : null
  } catch {
    return null
  }
}

/**
 * Pulls the video id out of any of the usual YouTube link shapes:
 * watch?v=ID, youtu.be/ID, /shorts/ID, /embed/ID, /live/ID, /v/ID.
 * Returns null for anything else, including non-YouTube hosts.
 */
export function youtubeId(raw: string | null | undefined): string | null {
  const url = parseUrl(raw)
  if (!url) return null

  const host = url.hostname.toLowerCase()
  let candidate: string | null = null

  if (host === "youtu.be" || host === "www.youtu.be") {
    candidate = url.pathname.split("/")[1] ?? null
  } else if (YOUTUBE_HOSTS.has(host)) {
    const [, first, second] = url.pathname.split("/")
    if (first === "watch") candidate = url.searchParams.get("v")
    else if (["shorts", "embed", "live", "v"].includes(first ?? "")) candidate = second ?? null
  }

  return candidate && YOUTUBE_ID.test(candidate) ? candidate : null
}

/** Start offset in seconds from ?t=90 / ?start=90 / ?t=1m30s, or null. */
export function youtubeStart(raw: string | null | undefined): number | null {
  const t = parseUrl(raw)?.searchParams.get("t") ?? parseUrl(raw)?.searchParams.get("start")
  if (!t) return null
  if (/^\d+s?$/.test(t)) return parseInt(t, 10) || null
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t)
  if (!m) return null
  const secs = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0)
  return secs > 0 ? secs : null
}

/** The privacy-enhanced embed URL for a video id. */
export function youtubeEmbedUrl(id: string, start?: number | null): string {
  const params = new URLSearchParams({ rel: "0" })
  if (start) params.set("start", String(start))
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
}

/** An https URL for a dish photo, or null. http and every other scheme are refused. */
export function safeImageUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim()
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}
