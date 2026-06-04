import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Right-hand slide-over panel. Used for the lead detail view.
export default function Drawer({ open, onClose, title, subtitle, badge, children, footer, width = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  const w = { md: 'max-w-md', lg: 'max-w-xl', xl: 'max-w-2xl' }[width]

  return createPortal(
    <div className="fixed inset-0 z-[90]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in-fast" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-full w-full ${w} animate-slide-in-right flex-col border-l border-hair-strong bg-base-850 shadow-pop`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-hair px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h2 className="truncate text-lg font-semibold text-white">{title}</h2>
              {badge}
            </div>
            {subtitle && <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-hair bg-base-800 px-6 py-4">
            {footer}
          </footer>
        )}
      </aside>
    </div>,
    document.body,
  )
}
