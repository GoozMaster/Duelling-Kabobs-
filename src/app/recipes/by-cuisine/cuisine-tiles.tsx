import Image from "next/image"
import Link from "next/link"

import { badgeForCuisine } from "@/components/home/logos"
import type { CuisineCount } from "@/lib/recipe-browse"

import s from "./by-cuisine.module.css"

/**
 * Every cuisine, as a large launcher.
 *
 * THIS IS NOT DECORATION AND IT IS NOT A FALLBACK. The globe above it reaches
 * seven of the eleven cuisines and about 101 of the 126 recipes: Desserts (13),
 * Breads (9), Drinks (3) and Other have no geography and can be reached from
 * this page *only* through these tiles. Deleting them as redundant with the
 * globe would quietly strand a fifth of the collection.
 *
 * Kept separate from CuisineFilter rather than merged with it. They look alike
 * and are different objects: that one is a row of small pills with an active
 * state sitting above a filtered grid, this one is a launcher with artwork and
 * no active state at all. One component doing both would mean a `variant` prop
 * carrying two designs. What they genuinely share — the cuisineCounts() query,
 * the encodeURIComponent href, and greying a zero rather than hiding it — is
 * shared.
 */
export function CuisineTiles({ counts }: { counts: CuisineCount[] }) {
  return (
    <nav aria-label="Browse by cuisine" className={s.tiles}>
      {counts.map(({ name, count }) => {
        const badge = badgeForCuisine(name)

        const face = badge ? (
          <span className={s.tileDisc}>
            <Image src={badge} alt="" width={56} height={56} />
          </span>
        ) : (
          // Only four of the eleven cuisines have artwork, so the rest get a
          // display-face initial — the same fallback CuisineDiscs uses.
          <span className={`${s.tileDisc} ${s.tileInitial}`}>{name.charAt(0)}</span>
        )

        // A cuisine with nothing in it shows, greyed and unlinked. The list is
        // a fixed vocabulary; a tile vanishing because its last recipe was
        // deleted is more confusing than one reading 0.
        if (count === 0) {
          return (
            <span key={name} className={`${s.tile} ${s.tileEmpty}`} aria-disabled="true">
              {face}
              <span className={s.tileName}>{name}</span>
              <span className={s.tileCount}>0 recipes</span>
            </span>
          )
        }

        return (
          <Link
            key={name}
            href={`/recipes?cuisine=${encodeURIComponent(name)}`}
            className={s.tile}
          >
            {face}
            <span className={s.tileName}>{name}</span>
            <span className={s.tileCount}>
              {count} {count === 1 ? "recipe" : "recipes"}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
