/**
 * Centralised, fail-fast access to the public Supabase environment variables.
 *
 * `process.env.NEXT_PUBLIC_*` is read with literal property access so Next.js
 * can inline the values into the client bundle at build time.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and fill it in ` +
        `(and set it in the Vercel project settings for deployed environments).`,
    )
  }
  return value
}

export const env = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabasePublishableKey: required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
}
