import { createClient } from '@supabase/supabase-js'

// Browser-side Supabase client. Lazily created so the app boots fine on the
// bundled mock data even when no credentials are present (Phase 1 demo mode).
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null

// True when the operator has flipped the app over to live data AND Supabase
// is actually configured. Pages read from this flag to decide mock vs. live.
export const useLiveData =
  import.meta.env.VITE_USE_LIVE_DATA === 'true' && isSupabaseConfigured

/**
 * Tiny helper so pages can write `const rows = await fetchTable('campaigns')`
 * without sprinkling null-checks everywhere. Returns null in mock mode so the
 * caller falls back to bundled data.
 */
export async function fetchTable(table, { select = '*', order } = {}) {
  if (!useLiveData) return null
  let query = supabase.from(table).select(select)
  if (order) query = query.order(order.column, { ascending: order.ascending ?? false })
  const { data, error } = await query
  if (error) {
    console.error(`[supabase] ${table} read failed:`, error.message)
    return null
  }
  return data
}
