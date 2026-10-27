"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { CuisineArt } from "@/components/cuisine-art"
import DriftWall, { type DriftWallHandle } from "@/components/drift-wall"
import { usePrefersReducedMotion } from "@/components/home/use-scroll-frame"

import s from "./spinner.module.css"

type Recipe = { id: string; title: string; cuisine: string | null }

/** Longest the page waits for the wall to report it has stopped. The spin is ~3s;
    this only matters in a backgrounded tab, where animation frames are paused. */
const GIVE_UP_MS = 8000

/** Module-level so its identity never changes and the wall's tiles stay memoised. */
function renderTile(recipe: Recipe) {
  return (
    <div className={s.tile}>
      <span className={s.disc}>
        <CuisineArt name={recipe.cuisine ?? "Other"} px={48} />
      </span>
      <span className={s.tileTitle}>{recipe.title}</span>
    </div>
  )
}

export function Spinner({ recipes }: { recipes: Recipe[] }) {
  const router = useRouter()
  const reduced = usePrefersReducedMotion()
  const wallRef = useRef<DriftWallHandle>(null)
  const run = useRef(0)

  const [winner, setWinner] = useState<Recipe | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [giveUp, setGiveUp] = useState<{ run: number; recipe: Recipe } | null>(null)

  /**
   * The winner is chosen first, uniformly, and the wall is then steered onto it.
   * Reading "whatever ended up in the middle" afterwards could not guarantee a
   * tile is centred at all.
   */
  const pick = useCallback(() => {
    if (spinning) return
    const recipe = recipes[Math.floor(Math.random() * recipes.length)]
    const id = ++run.current
    setWinner(null)

    // Reduced motion still gets a random recipe: the spin is decoration, the
    // pick is the feature.
    if (reduced) {
      wallRef.current?.jumpTo(recipe.id)
      setWinner(recipe)
      return
    }

    setSpinning(true)
    setGiveUp({ run: id, recipe })
    wallRef.current?.spinTo(recipe.id).then(() => {
      if (run.current !== id) return
      setSpinning(false)
      setGiveUp(null)
      setWinner(recipe)
    })
  }, [recipes, reduced, spinning])

  // Frames do not run in a hidden tab, so the wall would never report back and
  // the page would sit on "Picking…" for good. Timers do run.
  useEffect(() => {
    if (!giveUp) return
    const timer = window.setTimeout(() => {
      if (run.current !== giveUp.run) return
      setSpinning(false)
      setGiveUp(null)
      setWinner(giveUp.recipe)
    }, GIVE_UP_MS)
    return () => window.clearTimeout(timer)
  }, [giveUp])

  const label = spinning ? "Picking…" : winner ? "Spin again" : "Pick for me"

  return (
    <div className={s.stage}>
      <div className={s.frame}>
        <DriftWall
          ref={wallRef}
          items={recipes}
          renderTile={renderTile}
          onSelect={(id) => router.push(`/recipes/${id}`)}
        />
      </div>

      <div className={`${s.dock} ${winner ? s.dockWon : ""}`}>
        {winner && (
          <div className={s.pick}>
            <span className={s.pickDisc}>
              <CuisineArt name={winner.cuisine ?? "Other"} px={64} />
            </span>
            <div className={s.pickText}>
              <span className={s.pickKicker}>Your random pick</span>
              <span className={s.pickTitle}>{winner.title}</span>
              {winner.cuisine && <span className={s.pickCuisine}>{winner.cuisine}</span>}
            </div>
          </div>
        )}

        <div className={s.actions}>
          {winner && (
            <Link href={`/recipes/${winner.id}`} className={`${s.btn} ${s.btnPrimary}`}>
              Open the recipe
            </Link>
          )}
          {/* One persistent button: aria-disabled rather than disabled, so
              keyboard focus survives the spin instead of falling to <body>. */}
          <button
            type="button"
            className={`${s.btn} ${winner ? "" : s.btnPrimary} ${winner ? "" : s.btnBig}`}
            aria-disabled={spinning}
            onClick={pick}
          >
            {label}
          </button>
        </div>

        {/* Announced politely, so a screen reader hears the result instead of
            the seconds of motion. */}
        <p className="sr-only" role="status" aria-live="polite">
          {spinning
            ? "Picking a recipe."
            : winner
              ? `Your random pick: ${winner.title}${winner.cuisine ? `, ${winner.cuisine}` : ""}.`
              : ""}
        </p>
      </div>
    </div>
  )
}
