"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { signIn, type SignInState } from "./actions"

const INITIAL_STATE: SignInState = { error: null }

/**
 * The sticker treatment — a chunky outline over a hard, zero-blur offset shadow
 * — is applied here rather than through the token mapping in globals.css,
 * because shadcn has no token slot for border width or shadow offset.
 */
export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, INITIAL_STATE)
  const invalid = Boolean(state.error)

  return (
    <Card className="border-border w-full max-w-sm gap-6 rounded-[var(--sk-radius-lg)] border-2 shadow-[var(--sk-shadow-pop)]">
      <CardHeader>
        <CardTitle className="font-[family-name:var(--sk-font-display)] text-2xl tracking-wide">
          ADMIN SIGN-IN
        </CardTitle>
        <CardDescription>
          Dueling Kebabs has one account, and it is already made. Everyone else can
          browse the recipes without signing in at all.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@example.com"
              aria-invalid={invalid}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={invalid}
              required
            />
          </div>

          {/* Always rendered so screen readers observe the region from the
              start; an aria-live region added to the DOM at the same moment its
              content appears is often not announced. */}
          <p
            role="status"
            aria-live="polite"
            className="text-destructive bg-[var(--sk-brick-soft)] border-destructive/40 empty:hidden rounded-[var(--sk-radius-sm)] border px-3 py-2 text-sm"
          >
            {state.error}
          </p>

          <Button
            type="submit"
            size="lg"
            disabled={pending}
            className="border-border h-11 w-full border-2 text-base shadow-[var(--sk-shadow-sticker)] transition-[box-shadow,transform] duration-100 ease-[var(--sk-ease-press)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[var(--sk-shadow-press)]"
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
