import { createContext, useContext, useState, useCallback } from 'react'
import { clients } from '../data/mockData.js'
import { supabase, useLiveData } from '../lib/supabase.js'

// ─────────────────────────────────────────────────────────────
// Client-portal authentication.
//
// The portal is a separate, client-facing surface scoped to ONE client.
// In demo mode we authenticate against the bundled client list by email
// (any password). With Supabase configured + VITE_USE_LIVE_DATA=true the
// same shape is backed by Supabase Auth + a clients row keyed on email,
// with RLS ensuring a client only ever sees their own records.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'lc.portal.session'
const PortalAuthContext = createContext(null)

// Synchronously restore a persisted demo session so a refresh lands the
// client straight back in the portal — no loading flash.
function restoreSession() {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { clientId } = JSON.parse(raw)
    return clients.find((c) => c.id === clientId) || null
  } catch {
    return null
  }
}

export function PortalAuthProvider({ children }) {
  const [client, setClient] = useState(restoreSession)
  const loading = false

  const login = useCallback(async (email, password) => {
    const normalized = String(email || '').trim().toLowerCase()

    // Live path: Supabase email/password auth.
    if (useLiveData && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email: normalized, password })
      if (error) return { ok: false, error: error.message }
      const { data } = await supabase.from('clients').select('*').eq('email', normalized).single()
      if (!data) return { ok: false, error: 'No client account found for this email.' }
      setClient(data)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ clientId: data.id }))
      return { ok: true }
    }

    // Demo path: match against the bundled client list (any password).
    const found = clients.find(
      (c) => c.email && c.email.toLowerCase() === normalized && c.id !== 'cl_06',
    )
    if (!found) {
      return { ok: false, error: 'No client account found for that email.' }
    }
    if (!password) {
      return { ok: false, error: 'Enter your password.' }
    }
    setClient(found)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ clientId: found.id }))
    return { ok: true }
  }, [])

  // Demo helper: log straight in as a sample client from the login chips.
  const loginAs = useCallback((clientId) => {
    const found = clients.find((c) => c.id === clientId)
    if (!found) return
    setClient(found)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ clientId: found.id }))
  }, [])

  const logout = useCallback(async () => {
    if (useLiveData && supabase) await supabase.auth.signOut().catch(() => {})
    setClient(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <PortalAuthContext.Provider value={{ client, loading, login, loginAs, logout }}>
      {children}
    </PortalAuthContext.Provider>
  )
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext)
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider')
  return ctx
}
