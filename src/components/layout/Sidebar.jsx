import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Radio,
  PhoneIncoming,
  Users,
  DollarSign,
  Bot,
  Settings,
  ChevronsLeft,
  PanelLeft,
} from 'lucide-react'
import { initials } from '../../lib/format.js'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/campaigns', label: 'Campaigns', icon: Radio },
  { to: '/leads', label: 'Leads', icon: PhoneIncoming },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/revenue', label: 'Revenue', icon: DollarSign },
  { to: '/agents', label: 'AI Agents', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const USER = { name: 'CJ Howard', role: 'Operator', email: 'cj@fahow.org' }

function Logo({ collapsed }) {
  return (
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
          <p className="font-display text-[16px] font-extrabold tracking-tight text-white">
            Lead<span className="text-accent">Command</span>
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Ops Console
          </p>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside
      className={`fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-hair bg-base-850 transition-[width] duration-300 ease-out lg:flex ${
        collapsed ? 'w-[76px]' : 'w-[248px]'
      }`}
    >
      {/* Brand */}
      <div className={`flex h-16 items-center border-b border-hair ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
        <Logo collapsed={collapsed} />
        {!collapsed && (
          <button
            onClick={onToggle}
            className="rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-3 rounded-md p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && <p className="data-label mb-2 px-3">Workspace</p>}
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-all ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-accent/10 text-white'
                  : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-accent" />
                )}
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                    isActive ? 'text-accent' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-hair p-3">
        <button
          className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-white/[0.04] ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? USER.name : undefined}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-[13px] font-semibold text-accent">
            {initials(USER.name)}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[13.5px] font-semibold text-white">{USER.name}</span>
              <span className="block truncate text-[12px] text-slate-500">{USER.email}</span>
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}

export { NAV }
