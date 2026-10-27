import { instagramPost, youtubeId } from "@/lib/recipe-media"

const EMBED_PATTERNS = [
  /youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})/,
  /youtube\.com\/watch\?(?:[^"'\s<>]*?&(?:amp;)?)?v=([A-Za-z0-9_-]{11})/,
  /youtu\.be\/([A-Za-z0-9_-]{11})/,
]

/** Public web hosts only: the source link is data, so it must not point the server at itself. */
function isPublicHost(host: string): boolean {
  const h = host.toLowerCase()
  if (h === "localhost" || h.endsWith(".local") || h.endsWith(".internal")) return false
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h) || h.includes(":")) return false
  return h.includes(".")
}

/**
 * A video link for a recipe, taken from its source link: the source itself
 * when it is a YouTube video or an Instagram post/reel (Instagram pages are
 * login-walled, so those are never fetched), otherwise the first YouTube video embedded in the
 * source page. Fetched on the server and cached for a day, so a recipe page
 * never waits on the source site twice. Returns null for anything unreachable.
 */
export async function videoFromSource(sourceUrl: string | null | undefined): Promise<string | null> {
  const raw = sourceUrl?.trim()
  if (!raw) return null

  if (youtubeId(raw) || instagramPost(raw)) return raw

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (!["http:", "https:"].includes(url.protocol) || !isPublicHost(url.hostname)) return null

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: { "user-agent": "DownWithHungerBot/1.0 (+recipe video lookup)" },
      next: { revalidate: 86400 },
    })
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) return null

    const html = (await res.text()).slice(0, 1_500_000)
    for (const pattern of EMBED_PATTERNS) {
      const match = pattern.exec(html)
      if (match) return `https://www.youtube.com/watch?v=${match[1]}`
    }
  } catch {
    // Slow, blocked or down: the recipe page just shows no video.
  }
  return null
}
