import Link from "next/link"

type Props = {
  query: string
  cuisine: string | null
}

/**
 * A plain GET form, so it works without JavaScript and every search is a
 * shareable, back-button-friendly URL. The cuisine rides along as a hidden
 * field, which is what makes the same bar search "all recipes" or one region.
 */
export function IngredientSearchBar({ query, cuisine }: Props) {
  const clearHref = cuisine ? `/recipes?cuisine=${encodeURIComponent(cuisine)}` : "/recipes"

  return (
    <form
      action="/recipes"
      role="search"
      aria-label="Search recipes by ingredient"
      className="flex flex-wrap items-center gap-3"
    >
      {cuisine && <input type="hidden" name="cuisine" value={cuisine} />}
      <label htmlFor="ingredient-q" className="sr-only">
        Search by ingredient
      </label>
      <input
        id="ingredient-q"
        name="q"
        type="search"
        defaultValue={query}
        placeholder={
          cuisine ? `Search ${cuisine} recipes by ingredient…` : "Search by ingredient, e.g. chicken, tomatoes"
        }
        autoComplete="off"
        className="h-11 min-w-0 flex-1 basis-64 rounded-[var(--sk-radius-pill)] border-[3px] border-[var(--sk-outline)] bg-[var(--sk-surface-raised)] px-5 text-base focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      />
      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-[var(--sk-radius-pill)] border-[3px] border-[var(--sk-outline)] bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[var(--sk-shadow-sticker)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[var(--sk-shadow-pop)] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        Search
      </button>
      {query && (
        <Link
          href={clearHref}
          className="text-foreground text-sm font-medium underline underline-offset-4"
        >
          Clear
        </Link>
      )}
    </form>
  )
}
