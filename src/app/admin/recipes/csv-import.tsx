"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
  type CsvAnalysis,
  type CsvDecision,
  analyzeCsv,
  commitCsvImport,
} from "./csv-actions"

export function CsvImport() {
  const [analysis, setAnalysis] = useState<CsvAnalysis | null>(null)
  const [decisions, setDecisions] = useState<CsvDecision[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    startTransition(async () => {
      const text = await file.text()
      const result = await analyzeCsv(text)

      if (!result.ok) {
        setError(result.error)
        setAnalysis(null)
        return
      }

      setAnalysis(result.analysis)
      // A possible duplicate defaults to skip. Nothing is overwritten unless
      // it is asked for — the one thing the spec is unambiguous about.
      setDecisions(
        result.analysis.rows.map((row) => (row.duplicate ? "skip" : "import")),
      )
    })
  }

  function setDecision(index: number, decision: CsvDecision) {
    setDecisions((current) =>
      current.map((value, i) => (i === index ? decision : value)),
    )
  }

  function handleCommit() {
    if (!analysis) return
    setError(null)

    startTransition(async () => {
      const result = await commitCsvImport(
        analysis.rows.map((row, index) => ({
          draft: row.draft,
          decision: decisions[index],
          overwriteId: row.duplicate?.id ?? null,
        })),
      )

      if (!result.ok) {
        setError(result.error)
        return
      }

      const { imported, overwritten, skipped, cuisinesCreated, errors } = result.summary
      const parts = [
        imported > 0 ? `${imported} imported` : null,
        overwritten > 0 ? `${overwritten} replaced` : null,
        skipped > 0 ? `${skipped} skipped` : null,
      ].filter(Boolean)

      toast.success(parts.join(", ") || "Nothing to do")

      if (cuisinesCreated.length > 0) {
        toast.info(`New cuisines added: ${cuisinesCreated.join(", ")}`)
      }

      if (errors.length > 0) {
        setError(errors.join(" · "))
      }

      setAnalysis(null)
      setDecisions([])
    })
  }

  const duplicateCount = analysis?.rows.filter((row) => row.duplicate).length ?? 0

  return (
    <div className="flex flex-col gap-4">
      {!analysis && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="csv-file">CSV file</Label>
          <input
            id="csv-file"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            disabled={pending}
            className="border-input file:bg-secondary file:text-secondary-foreground rounded-[var(--radius-md)] border px-2 py-1.5 text-sm file:mr-3 file:rounded-[var(--sk-radius-sm)] file:border-0 file:px-3 file:py-1"
          />
          <p className="text-muted-foreground text-sm">
            One row per recipe, with columns <code>title</code>,{" "}
            <code>instructions</code>, <code>cuisine</code> and{" "}
            <code>ingredients</code> — ingredients separated by semicolons. Everything
            imported is flagged as needing review until you tag it.
          </p>
        </div>
      )}

      <p
        role="status"
        aria-live="polite"
        className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 empty:hidden rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm"
      >
        {error}
      </p>

      {analysis && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              <strong>{analysis.rows.length}</strong>{" "}
              {analysis.rows.length === 1 ? "recipe" : "recipes"} read
              {duplicateCount > 0 && (
                <>
                  {" · "}
                  <span className="text-destructive">
                    {duplicateCount} may already exist
                  </span>
                </>
              )}
            </p>
            <Button
              type="button"
              onClick={handleCommit}
              disabled={pending}
              className="border-border border-2"
            >
              {pending ? "Importing…" : "Import"}
            </Button>
          </div>

          {analysis.newCuisines.length > 0 && (
            <p className="border-border bg-[var(--sk-teal-soft)] rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm">
              New cuisines will be added: {analysis.newCuisines.join(", ")}
            </p>
          )}

          {analysis.problems.length > 0 && (
            <ul className="border-border rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm">
              {analysis.problems.map((problem) => (
                <li key={problem} className="text-muted-foreground">
                  {problem}
                </li>
              ))}
            </ul>
          )}

          <ul className="flex flex-col gap-2">
            {analysis.rows.map((row, index) => (
              <li
                key={`${row.draft.title}-${index}`}
                className="border-border rounded-[var(--sk-radius-md)] border p-3"
              >
                {row.duplicate ? (
                  // Side by side, so the choice is made against what is
                  // actually already saved rather than against its title alone.
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="destructive">
                        {Math.round(row.duplicate.score * 100)}% match
                      </Badge>
                      <span className="text-sm font-medium">Possible duplicate</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="border-border rounded-[var(--sk-radius-sm)] border p-2">
                        <p className="text-muted-foreground text-xs">Already saved</p>
                        <p className="text-sm font-medium">{row.duplicate.title}</p>
                      </div>
                      <div className="border-border rounded-[var(--sk-radius-sm)] border p-2">
                        <p className="text-muted-foreground text-xs">In the file</p>
                        <p className="text-sm font-medium">{row.draft.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {row.draft.ingredients.length} ingredients
                          {row.draft.cuisine ? ` · ${row.draft.cuisine}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          ["skip", "Skip"],
                          ["overwrite", "Replace the saved one"],
                          ["import", "Keep both"],
                        ] as Array<[CsvDecision, string]>
                      ).map(([value, label]) => (
                        <Button
                          key={value}
                          type="button"
                          size="sm"
                          variant={decisions[index] === value ? "default" : "outline"}
                          onClick={() => setDecision(index, value)}
                          disabled={pending}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {row.draft.title}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {row.draft.ingredients.length} ingredients
                        {row.draft.cuisine ? ` · ${row.draft.cuisine}` : ""}
                      </span>
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant={decisions[index] === "skip" ? "outline" : "ghost"}
                      onClick={() =>
                        setDecision(index, decisions[index] === "skip" ? "import" : "skip")
                      }
                      disabled={pending}
                    >
                      {decisions[index] === "skip" ? "Skipped" : "Skip"}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
