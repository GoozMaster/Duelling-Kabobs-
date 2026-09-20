"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type DraftRecipe, emptyDraft } from "@/lib/recipes"

import { CsvImport } from "./csv-import"
import { RecipeForm } from "./recipe-form"
import { UrlImport } from "./url-import"

/**
 * The three intake modes on one page, per the spec.
 *
 * All of them converge on the same RecipeForm: an import builds a DraftRecipe
 * and hands it over, rather than getting a save path of its own. Whatever the
 * form can express, an import can be corrected into before anything is written.
 */
export function NewRecipe({ cuisines }: { cuisines: string[] }) {
  const [mode, setMode] = useState("manual")
  const [draft, setDraft] = useState<DraftRecipe>(emptyDraft)
  const [notice, setNotice] = useState<string | null>(null)

  // RecipeForm seeds its own state from this prop, so a fresh import has to
  // remount it. Keying on the draft's identity is what does that.
  const [formKey, setFormKey] = useState(0)

  function handleImported(
    imported: DraftRecipe,
    importNotice: string | null,
    sourceCuisine: string | null,
  ) {
    setDraft(imported)
    setNotice(
      sourceCuisine
        ? `${importNotice ? `${importNotice} ` : ""}The page said its cuisine was "${sourceCuisine}", which is not on your list — pick one, or add it with Other.`
        : importNotice,
    )
    setFormKey((key) => key + 1)
    setMode("manual")
  }

  return (
    <div className="flex flex-col gap-5">
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="h-auto w-full flex-wrap">
          <TabsTrigger value="manual">By hand</TabsTrigger>
          <TabsTrigger value="url">From a URL</TabsTrigger>
          <TabsTrigger value="csv">CSV upload</TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="pt-4">
          <UrlImport onImported={handleImported} />
        </TabsContent>

        <TabsContent value="csv" className="pt-4">
          <CsvImport />
        </TabsContent>

        <TabsContent value="manual" className="pt-4">
          {notice && (
            <p className="border-border bg-[var(--sk-teal-soft)] mb-4 rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm">
              {notice}
            </p>
          )}

          <RecipeForm key={formKey} draft={draft} cuisines={cuisines} mode="create" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
