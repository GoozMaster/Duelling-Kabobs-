import Link from "next/link"

type Props = {
  cuisine: string
  /** Every recipe in the cuisine, for the "All" chip. */
  cuisineTotal: number
  counts: Array<{ name: string; count: number }>
  active: string | null
}

const base =
  "inline-flex items-center gap-2 rounded-[var(--sk-radius-pill)] border-2 border-[var(--sk-outline)] px-3.5 py-1 text-sm font-semibold transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)]"

const idle = "bg-card hover:-translate-y-0.5 shadow-[var(--sk-shadow-press)]"
const selected = "bg-primary text-primary-foreground shadow-[var(--sk-shadow-sticker)]"

/**
 * The subheadings under the chosen cuisine, as a second, smaller row of chips
 * beneath the cuisine row.
 *
 * Plain links, and a server component, for the same reason the cuisine chips
 * are links: the filter lives in the URL, so the back button and a shared link
 * both land on the same list and nothing here needs JavaScript. "All" drops the
 * ?sub= and keeps the cuisine; the cuisine row above drops both.
 */
export function SubcategoryFilter({ cuisine, cuisineTotal, counts, active }: Props) {
  const cuisineHref = `/recipes?cuisine=${encodeURIComponent(cuisine)}`

  return (
    <nav aria-label={`Sections of ${cuisine}`} className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold">{cuisine}:</span>

      <Link
        href={cuisineHref}
        aria-current={active ? undefined : "page"}
        className={`${base} ${active ? idle : selected}`}
      >
        Everything
        <span className="text-[13px] font-normal opacity-75">{cuisineTotal}</span>
      </Link>

      {counts.map(({ name, count }) => {
        const isActive = active === name

        return (
          <Link
            key={name}
            href={`${cuisineHref}&sub=${encodeURIComponent(name)}`}
            aria-current={isActive ? "page" : undefined}
            className={`${base} ${isActive ? selected : idle}`}
          >
            {name}
            <span className="text-[13px] font-normal opacity-75">{count}</span>
          </Link>
        )
      })}
    </nav>
  )
}
