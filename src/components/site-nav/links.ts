/**
 * The destinations behind the site menu.
 *
 * These lists used to live inside the dropdown components they fed. The
 * dropdowns are gone, but the lists are still the single source for what each
 * group contains, so the menu is built from them rather than restating paths.
 *
 * The stock hashes are the section ids on /stock; arriving on one scrolls it
 * into view, which is what swings its door open.
 */

export type MenuLink = { href: string; label: string }

export const recipeItems: MenuLink[] = [
  { href: "/recipes", label: "All recipes" },
  { href: "/recipes/by-cuisine", label: "By cuisine" },
  { href: "/recipes/surprise", label: "Surprise me" },
]

export const stockEverything: MenuLink = { href: "/stock", label: "Everything" }

export const stockSections: MenuLink[] = [
  { href: "/stock#pantry", label: "Pantry" },
  { href: "/stock#fridge", label: "Fridge" },
  { href: "/stock#freezer", label: "Freezer" },
]
