import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Radio, PhoneIncoming, Users, DollarSign } from 'lucide-react'

// Bottom tab bar for small screens (sidebar collapses into this).
const TABS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/campaigns', label: 'Campaigns', icon: Radio },
  { to: '/leads', label: 'Leads', icon: PhoneIncoming },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/revenue', label: 'Revenue', icon: DollarSign },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch border-t border-hair bg-base-850/95 backdrop-blur lg:hidden">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition ${
              isActive ? 'text-accent' : 'text-slate-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
