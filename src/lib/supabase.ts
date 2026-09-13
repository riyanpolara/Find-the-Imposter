import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client — lazily imported.
 *
 * Deliberately optional: the game is offline-first and every rule lives in
 * pure functions under `src/game/`. Nothing in the core loop may import this.
 * If the env vars are missing the app still plays perfectly — `getSupabase()`
 * just resolves to null and callers skip whatever cloud extra they wanted.
 *
 * The `import()` is what keeps it honest. supabase-js is ~55kB gzipped, and
 * it is only ever needed on the game-over screen, so it must not sit in the
 * bundle the home screen waits for. Statically importing it more than halved
 * the app's cold-start budget.
 *
 * Only ever holds the publishable key. The Postgres connection string and the
 * service_role key must never appear in a `VITE_` variable: Vite inlines those
 * into the client bundle, which would hand every player full database access.
 */
const url = import.meta.env.VITE_SUPABASE_URL
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const isSupabaseConfigured = Boolean(url && publishableKey)

let clientPromise: Promise<SupabaseClient | null> | null = null

export function getSupabase(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null)

  clientPromise ??= import('@supabase/supabase-js')
    .then(({ createClient }) =>
      createClient(url, publishableKey, {
        auth: {
          // No accounts in this game yet — don't spend a request restoring one.
          persistSession: false,
          autoRefreshToken: false,
        },
      }),
    )
    .catch(() => {
      // Offline, or the chunk failed to load. Try again next time.
      clientPromise = null
      return null
    })

  return clientPromise
}
