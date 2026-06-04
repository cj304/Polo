import { useLocation } from 'react-router-dom'
import { Search, Bell, Command, CircleDot } from 'lucide-react'
import { useLiveData } from '../../lib/supabase.js'

const TITLES = {
  '/': 'Dashboard',
  '/campaigns': 'Campaigns',
  '/leads': 'Leads',
  '/clients': 'Clients',
  '/revenue': 'Revenue',
  '/agents': 'AI Agents',
  '/settings': 'Settings',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const root = '/' + (pathname.split('/')[1] || '')
  const title = TITLES[root] || 'LeadCommand'

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-hair bg-base-900/80 px-5 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-[17px] font-bold text-white">{title}</h2>
        <span
          className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold sm:inline-flex ${
            useLiveData
              ? 'border-ok/20 bg-ok/10 text-ok'
              : 'border-amber/25 bg-amber/10 text-amber'
          }`}
        >
          <CircleDot className="h-3 w-3" />
          {useLiveData ? 'Live Data' : 'Demo Mode'}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Command palette affordance (visual). */}
        <button className="hidden items-center gap-2 rounded-lg border border-hair-strong bg-base-850 px-3 py-2 text-[13px] text-slate-500 transition hover:border-hair-strong hover:text-slate-300 md:flex">
          <Search className="h-4 w-4" />
          <span>Search…</span>
          <kbd className="ml-3 flex items-center gap-0.5 rounded border border-hair px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            <Command className="h-2.5 w-2.5" />K
          </kbd>
        </button>
        <button className="relative flex h-[38px] w-[38px] items-center justify-center rounded-lg border border-hair-strong bg-base-850 text-slate-400 transition hover:text-white" aria-label="Notifications">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-base-850" />
        </button>
      </div>
    </header>
  )
}
