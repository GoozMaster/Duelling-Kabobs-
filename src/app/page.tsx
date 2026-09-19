import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const plannedPages = [
  "Dashboard",
  "My Recipes",
  "My Pantry",
  "Search / Lookup",
  "Recipe Detail",
  "Add Recipe",
]

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Chef App</h1>
        <Badge variant="secondary">Scaffold</Badge>
      </div>

      <p className="text-muted-foreground mb-10">
        Pantry-matching recipe manager — find what you can cook with what you
        already have.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Groundwork is in place</CardTitle>
          <CardDescription>
            Next.js App Router, Tailwind CSS v4, shadcn/ui and the Supabase
            client are wired up. Feature work starts from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium">Planned pages</p>
            <ul className="text-muted-foreground grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              {plannedPages.map((page) => (
                <li key={page}>{page}</li>
              ))}
            </ul>
          </div>

          <Button asChild>
            <Link href="/health">Check environment health</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
