import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"

// Always evaluated at request time — this is a live check, not a build artifact.
export const dynamic = "force-dynamic"

type CheckResult = {
  label: string
  ok: boolean
  detail: string
}

async function runChecks(): Promise<CheckResult[]> {
  const checks: CheckResult[] = []

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  checks.push({
    label: "NEXT_PUBLIC_SUPABASE_URL",
    ok: Boolean(url),
    detail: url ?? "not set",
  })

  checks.push({
    label: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ok: Boolean(key),
    detail: key ? `set (${key.slice(0, 12)}…)` : "not set",
  })

  if (!url || !key) {
    checks.push({
      label: "Supabase reachable",
      ok: false,
      detail: "skipped — environment variables missing",
    })
    return checks
  }

  // Hit the Auth health endpoint: a real network round-trip to the project.
  try {
    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key },
      cache: "no-store",
    })
    const body: unknown = await response.json().catch(() => null)
    const version =
      body && typeof body === "object" && "version" in body
        ? String((body as { version: unknown }).version)
        : "unknown version"

    checks.push({
      label: "Supabase Auth reachable",
      ok: response.ok,
      detail: response.ok
        ? `HTTP ${response.status} — GoTrue ${version}`
        : `HTTP ${response.status}`,
    })
  } catch (error) {
    checks.push({
      label: "Supabase Auth reachable",
      ok: false,
      detail: error instanceof Error ? error.message : "request failed",
    })
  }

  // Prove the cookie-bound server client constructs and can answer a session
  // query. Anonymous visitors legitimately have no user — that is still a pass.
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    checks.push({
      label: "Server client session read",
      ok: true,
      detail: data.user ? `signed in as ${data.user.email}` : "no active session (anonymous)",
    })
  } catch (error) {
    checks.push({
      label: "Server client session read",
      ok: false,
      detail: error instanceof Error ? error.message : "client construction failed",
    })
  }

  return checks
}

export default async function HealthPage() {
  const checks = await runChecks()
  const allOk = checks.every((check) => check.ok)

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Environment health</CardTitle>
            <Badge variant={allOk ? "default" : "destructive"}>
              {allOk ? "All passing" : "Attention needed"}
            </Badge>
          </div>
          <CardDescription>
            Live check of the Supabase wiring for this deployment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y text-sm">
            {checks.map((check) => (
              <li
                key={check.label}
                className="flex items-start justify-between gap-6 py-3"
              >
                <div>
                  <p className="font-medium">{check.label}</p>
                  <p className="text-muted-foreground break-all">{check.detail}</p>
                </div>
                <span
                  aria-hidden
                  className={
                    check.ok
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  }
                >
                  {check.ok ? "PASS" : "FAIL"}
                </span>
                <span className="sr-only">{check.ok ? "Pass" : "Fail"}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
