import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, PhoneIncoming, CalendarClock, Receipt, LifeBuoy,
  LogOut, CircleDot, ChevronsLeft, PanelLeft,
} from 'lucide-react'
import { usePortalAuth } from './PortalAuth.jsx'
import { useLiveData } from '../lib/supabase.js'
import { initials, DEAL_TYPE_LABELS } from '../lib/format.js'

const NAV = [
  { to: '/portal', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/portal/leads', label: 'My Leads', icon: PhoneIncoming },
  { to: '/portal/appointments', label: 'Appointments', icon: CalendarClock },
  { to: '/portal/billing', label: 'Billing', icon: Receipt },
  { to: '/portal/support', label: 'Support', icon: LifeBuoy },
]

const STORAGE_KEY = 'lc.portal.sidebar'

export default function PortalLayout() {
  const { client, loading, logout } = usePortalAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (loading) return <div className="min-h-screen bg-base-900" />
  if (!client) return <Navigate to="/portal/login" replace />

  const handleLogout = async () => {
    await logout()
    navigate('/portal/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-base-900">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-hair bg-base-850 transition-[width] duration-300 ease-out lg:flex ${
          collapsed ? 'w-[76px]' : 'w-[248px]'
        }`}
      >
        <div className={`flex h-16 items-center border-b border-hair ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <path d="M9 8V24H18" stroke="#0066FF" strokeWidth="2.6" strokeLinecap="square" />
                <path d="M21 9L25 13L21 17" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="round" />
                <circle cx="21" cy="22" r="2.2" fill="#0066FF" />
              </svg>
            </div>
            {!collapsed && (
              <div className="leading-none">
                <p className="font-display text-[15px] font-extrabold tracking-tight text-white">
                  Lead<span className="text-accent">Command</span>
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">Client Portal</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200" aria-label="Collapse">
              <ChevronsLeft className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="mx-auto mt-3 rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200" aria-label="Expand">
            <PanelLeft className="h-[18px] w-[18px]" />
          </button>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {!collapsed && <p className="data-label mb-2 px-3">Menu</p>}
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all ${
                  collapsed ? 'justify-center' : ''
                } ${isActive ? 'bg-accent/10 text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'}`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent" />}
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {!collapsed && <span>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-hair p-3">
          <div className={`flex items-center gap-3 rounded-lg p-2 ${collapsed ? 'justify-center' : ''}`} title={collapsed ? client.business_name : undefined}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-[12px] font-semibold text-accent">
              {initials(client.business_name)}
            </span>
            {!collapsed && (
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-[13px] font-semibold text-white">{client.business_name}</span>
                <span className="block truncate text-[11.5px] text-slate-500">{DEAL_TYPE_LABELS[client.deal_type]}</span>
              </span>
            )}
            {!collapsed && (
              <button onClick={handleLogout} className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-danger" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex min-h-screen flex-col transition-[padding] duration-300 ease-out ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-[248px]'}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-hair bg-base-900/80 px-5 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-[16px] font-bold text-white sm:text-[17px]">{client.business_name}</h2>
            <span className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold sm:inline-flex ${
              useLiveData ? 'border-ok/20 bg-ok/10 text-ok' : 'border-amber/25 bg-amber/10 text-amber'
            }`}>
              <CircleDot className="h-3 w-3" />
              {useLiveData ? 'Live' : 'Demo'}
            </span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-hair-strong bg-base-850 px-3 py-2 text-[13px] font-medium text-slate-300 transition hover:text-white">
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>

        <main className="flex-1 px-5 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          <div key={pathname} className="mx-auto max-w-[1200px]">
            <Outlet context={{ client }} />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-hair bg-base-850/95 backdrop-blur lg:hidden">
        {NAV.slice(0, 4).map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition ${isActive ? 'text-accent' : 'text-slate-500'}`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
