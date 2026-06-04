import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Centered modal dialog. Click-outside + Escape close, smooth scale-in.
export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
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

  const width = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }[size]

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm animate-fade-in-fast"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`surface relative my-auto w-full ${width} animate-scale-in shadow-pop`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-hair px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
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
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-hair bg-base-850/60 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
