import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { ArrowRight, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import { FormField, Input } from '../components/ui/Field.jsx'
import { usePortalAuth } from './PortalAuth.jsx'
import { clients } from '../data/mockData.js'
import { initials } from '../lib/format.js'

// Sample accounts surfaced as one-click chips for the demo.
const DEMO_CLIENTS = clients.filter((c) => c.id !== 'cl_06').slice(0, 4)

export default function PortalLogin() {
  const { client, login, loginAs } = usePortalAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Already signed in → go to the portal.
  if (client) return <Navigate to="/portal" replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(email, password)
    setLoading(false)
    if (res.ok) navigate('/portal', { replace: true })
    else setError(res.error)
  }

  const quickLogin = (c) => {
    loginAs(c.id)
    navigate('/portal', { replace: true })
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / value panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-hair bg-base-850 p-12 lg:flex">
        <div className="grid-texture pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M9 8V24H18" stroke="#0066FF" strokeWidth="2.6" strokeLinecap="square" />
              <path d="M21 9L25 13L21 17" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="round" />
              <circle cx="21" cy="22" r="2.2" fill="#0066FF" />
            </svg>
          </div>
          <p className="font-display text-[17px] font-extrabold tracking-tight text-white">
            Lead<span className="text-accent">Command</span>
          </p>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-[34px] font-bold leading-tight tracking-tight text-white">
            Your leads, appointments &amp; billing — all in one place.
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
            Every call our AI agents capture for your business, the appointments
            they book, and your invoices — transparent and live, around the clock.
          </p>
          <ul className="mt-8 space-y-3 text-[14px] text-slate-300">
            {[
              ['Real-time lead feed', 'See calls the moment they come in'],
              ['Appointment calendar', 'Track every booking your agent makes'],
              ['Transparent billing', 'Review and pay invoices in a click'],
            ].map(([t, d]) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <ShieldCheck className="h-3 w-3" />
                </span>
                <span>
                  <span className="font-semibold text-white">{t}</span>
                  <span className="text-slate-500"> — {d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[12px] text-slate-600">© {new Date().getFullYear()} LeadCommand · Client Portal</p>
      </div>

      {/* Login form */}
      <div className="flex items-center justify-center bg-base-900 px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8 lg:hidden">
            <p className="font-display text-xl font-extrabold text-white">
              Lead<span className="text-accent">Command</span>
            </p>
          </div>

          <p className="data-label mb-2">Client Portal</p>
          <h2 className="font-display text-[26px] font-bold tracking-tight text-white">Welcome back</h2>
          <p className="mt-1.5 text-[14px] text-slate-500">Sign in to your client account.</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <FormField label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.com"
                  className="pl-9"
                  autoComplete="email"
                />
              </div>
            </FormField>
            <FormField label="Password">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9"
                  autoComplete="current-password"
                />
              </div>
            </FormField>

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-[13px] text-danger">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Demo quick-login */}
          <div className="mt-8">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-hair" />
              <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                <Sparkles className="h-3 w-3" /> Demo accounts
              </span>
              <span className="h-px flex-1 bg-hair" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {DEMO_CLIENTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => quickLogin(c)}
                  className="group flex items-center gap-2.5 rounded-lg border border-hair-strong bg-base-850 p-2.5 text-left transition hover:border-accent/40 hover:bg-base-800"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hair bg-white/[0.04] text-[11px] font-semibold text-slate-300">
                    {initials(c.business_name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12.5px] font-semibold text-white">{c.business_name}</span>
                    <span className="block truncate text-[11px] text-slate-500">{c.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-[12.5px] text-slate-600">
            Are you an operator?{' '}
            <Link to="/" className="font-medium text-accent hover:text-accent-hover">
              Go to the console
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
