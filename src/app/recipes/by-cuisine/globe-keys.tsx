"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Makes the globe's countries behave like the links they look like.
 *
 * An SVG <a> is not an HTML <a>, and it falls short in two ways that were both
 * assumed away when the globe was built:
 *
 * IT IS NOT KEYBOARD OPERABLE. It takes focus and it takes a tabindex, so it
 * looks reachable, but browsers do not fire a click for Enter on an SVG anchor
 * the way they do for an HTML one. Every country was tabbable and none of them
 * could be activated. Dispatching the click is what an HTML anchor would have
 * done for free.
 *
 * IT DOES A FULL PAGE LOAD. Next's router never sees it, so selecting a country
 * tore down the document and rebuilt it — slower than every other link on the
 * site, and it cut the cuisine sound off a few milliseconds after it started,
 * since the document playing it no longer existed. Routing it through the
 * client router makes it a soft navigation like everything else, and the sound
 * survives into the page it is introducing.
 *
 * THE LISTENER IS ON THE SVG, IN BUBBLE PHASE, AND THAT MATTERS. The cuisine
 * sound listens on the document in capture phase, so it always sees the click
 * first and un-prevented. Were this on the document too, the two would be
 * ordered by registration and calling preventDefault here would silently stop
 * the sound.
 */
export function GlobeKeys() {
  const router = useRouter()

  useEffect(() => {
    const svg = document.querySelector<SVGSVGElement>("svg[data-globe]")
    if (!svg) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return

      const anchor = (document.activeElement as Element | null)?.closest?.("a")
      if (!anchor?.getAttribute("href")) return

      // Space would otherwise scroll the page out from under the selection.
      event.preventDefault()
      anchor.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }))
    }

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return

      const anchor = (event.target as Element | null)?.closest?.("a")
      const href = anchor?.getAttribute("href")
      if (!href) return

      event.preventDefault()
      router.push(href)
    }

    svg.addEventListener("keydown", onKeyDown)
    svg.addEventListener("click", onClick)

    return () => {
      svg.removeEventListener("keydown", onKeyDown)
      svg.removeEventListener("click", onClick)
    }
  }, [router])

  return null
}
