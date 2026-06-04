import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'
import MobileNav from './MobileNav.jsx'

const STORAGE_KEY = 'lc.sidebar.collapsed'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === '1',
  )
  const { pathname } = useLocation()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  // Scroll to top on route change for a clean page transition.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-base-900">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div
        className={`flex min-h-screen flex-col transition-[padding] duration-300 ease-out ${
          collapsed ? 'lg:pl-[76px]' : 'lg:pl-[248px]'
        }`}
      >
        <Topbar />
        <main className="flex-1 px-5 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-8">
          {/* key on pathname re-triggers the entry animation per page */}
          <div key={pathname} className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
