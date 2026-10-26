/**
 * Instant shell for /admin while its three queries run.
 *
 * This wraps the page only, never the layout, so the skeleton appears the
 * moment a link into /admin is clicked. It mirrors the real page's card stack
 * — one header card and three content cards at the same widths and radii — so
 * the swap to real content is a fill, not a jump.
 *
 * Note this does not cover the nested admin routes: /admin/pantry and
 * /admin/recipes/* sit below this segment and inherit this boundary, which is
 * deliberate — a card skeleton is an honest placeholder for any of them.
 */
function SkeletonCard({ rows }: { rows: number }) {
  return (
    <div className="bg-card flex flex-col gap-4 rounded-[var(--sk-radius-lg)] border-[3px] border-[var(--sk-outline)] p-6 shadow-[var(--sk-shadow-sticker)]">
      <div className="bg-muted h-5 w-40 animate-pulse rounded-[var(--sk-radius-pill)]" />
      <div className="bg-muted h-3 w-64 max-w-full animate-pulse rounded-[var(--sk-radius-pill)]" />

      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="border-border h-12 animate-pulse rounded-[var(--sk-radius-sm)] border"
          />
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading"
      className="page-wrap flex flex-col gap-8 py-10 lg:py-14"
    >
      {/* The same frame the admin pages draw into: a title, then cards. */}
      <div className="bg-muted h-12 w-56 animate-pulse rounded-[var(--sk-radius-pill)]" />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <SkeletonCard rows={5} />
        <SkeletonCard rows={5} />
        <SkeletonCard rows={4} />
      </div>
    </main>
  )
}
