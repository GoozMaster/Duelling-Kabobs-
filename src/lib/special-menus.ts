/**
 * Special menus: hand-picked compilations of recipes.
 *
 * A menu only points at recipes. The recipe cards stay where they live (All
 * recipes, By cuisine); a menu page is an extra way in. To change what a menu
 * shows, edit its `recipeIds` — order here is the order on the page.
 */

import { veganTitles } from "@/lib/vegan-menu"

export type SpecialMenu = {
  slug: string
  /** Text in the site menu. */
  navLabel: string
  title: string
  blurb: string
  /** Recipes by id, in page order. Use `titles` instead to pick by title. */
  recipeIds?: string[]
  /** Recipes by title, in page order. */
  titles?: string[]
  /** Show each card's reason for being on the menu (vegan menu). */
  showReasons?: boolean
}

export const specialMenus: SpecialMenu[] = [
  {
    slug: "christmas",
    navLabel: "Christmas",
    title: "Christmas Menu",
    blurb: "A full holiday table: a gratin, a stew, mashed potatoes, hand pies, a green salad and star bread to finish.",
    recipeIds: [
      "67a52d40-7b09-4406-8a46-fb16028ef05d", // Vegan Zucchini Gratin
      "0a480243-5137-4d2c-b595-878f387caa91", // Holiday Star Bread
      "c7ac7a25-1056-4c0f-a68d-d48969e0262d", // All American Beef Stew
      "5b9dd669-4d3e-45c7-b006-013a59a1d687", // Mashed Potatoes
      "f805ec57-8af8-4c7a-b739-86d8b02c98b7", // Savory Meat and Mushroom Hand Pies
      "614c7078-fedc-4f0c-8530-c7357b3287ec", // Super Green Salad
    ],
  },
  {
    slug: "vegan",
    navLabel: "Vegan-friendly",
    title: "Vegan-Friendly Menu",
    blurb:
      "Recipes that are vegan as written, vegan with a choice the recipe already lists, or vegan after a simple swap. Each card says which, and the recipe page marks every swap next to its ingredient.",
    titles: veganTitles,
    showReasons: true,
  },
]

export function menuBySlug(slug: string): SpecialMenu | undefined {
  return specialMenus.find((menu) => menu.slug === slug)
}
