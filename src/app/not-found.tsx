import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { scenes } from "@/components/home/logos"
import { SiteNav } from "@/components/site-nav/site-nav"

export const metadata: Metadata = {
  title: "Not found — Dueling Kebabs",
}

// The home page's .btn sticker, restated in utilities because home.module.css
// is scoped to the home page.
const btn =
  "border-border inline-flex items-center rounded-[var(--sk-radius-pill)] border-[3px] px-5 py-2.5 text-sm font-semibold tracking-wide uppercase shadow-[var(--sk-shadow-sticker)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] hover:-translate-x-[3px] hover:-translate-y-[3px] hover:shadow-[var(--sk-shadow-pop)] focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--sk-focus-ring)] focus-visible:outline-solid"

/**
 * Covers both an unmatched URL and every notFound() call — most often a recipe
 * link that outlived its recipe. Next's default here was a bare black page
 * with no way back, the one screen on the site that ignored the theme.
 */
export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-8 px-6 py-16 text-center sm:flex-row sm:items-center sm:text-left">
        <Image
          src={scenes.downWithHunger}
          alt=""
          width={220}
          height={220}
          className="border-border w-44 shrink-0 rounded-[var(--sk-radius-lg)] border-4 shadow-[var(--sk-shadow-pop)] sm:w-56"
          priority
        />
        <div className="flex flex-col items-center gap-4 sm:items-start">
          <h1 className="font-[family-name:var(--sk-font-display)] text-4xl leading-none tracking-wide [-webkit-text-stroke:3px_var(--sk-outline)] [paint-order:stroke_fill] text-[var(--sk-yellow)] sm:text-5xl">
            NOTHING COOKING HERE
          </h1>
          <p className="text-muted-foreground max-w-[38ch] text-base leading-7">
            That page is not on the menu. If it was a recipe, it may have been
            renamed or taken out of the collection.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Link href="/recipes" className={`${btn} bg-primary text-primary-foreground`}>
              Browse recipes
            </Link>
            <Link href="/what-can-i-make" className={`${btn} bg-card`}>
              What can I make?
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
