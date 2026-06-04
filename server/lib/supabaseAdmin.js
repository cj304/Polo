// Server-side Supabase admin client (service-role key). Used by the
// webhook handler to write lead/call records. No-ops without config so
// the webhook still returns 200 and logs in demo mode.

import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdminConfigured = Boolean(url && serviceKey)

export const supabaseAdmin = supabaseAdminConfigured
  ? createClient(url, serviceKey, { auth: { persistSession: false } })
  : null

/** Insert helper that logs instead of throwing in demo mode. */
export async function insertRow(table, row) {
  if (!supabaseAdminConfigured) {
    console.log(`[supabase:mock] insert ${table}:`, JSON.stringify(row))
    return { mock: true, row }
  }
  const { data, error } = await supabaseAdmin.from(table).insert(row).select().single()
  if (error) throw new Error(`Supabase insert ${table} failed: ${error.message}`)
  return { mock: false, data }
}

/** Update helper keyed by an arbitrary match object. */
export async function updateRows(table, match, patch) {
  if (!supabaseAdminConfigured) {
    console.log(`[supabase:mock] update ${table} where`, match, '→', patch)
    return { mock: true }
  }
  let q = supabaseAdmin.from(table).update(patch)
  for (const [k, v] of Object.entries(match)) q = q.eq(k, v)
  const { error } = await q
  if (error) throw new Error(`Supabase update ${table} failed: ${error.message}`)
  return { mock: false }
}
