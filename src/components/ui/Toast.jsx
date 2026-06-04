import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
}
const TONE = {
  success: 'text-ok',
  error: 'text-danger',
  info: 'text-accent',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    (message, { type = 'success', title, duration = 4000 } = {}) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((t) => [...t, { id, message, type, title }])
      if (duration) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-2.5">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info
          return (
            <div
              key={t.id}
              role="status"
              className="animate-slide-in-right surface flex items-start gap-3 p-3.5 pr-3 shadow-pop"
            >
              <Icon className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${TONE[t.type]}`} />
              <div className="min-w-0 flex-1">
                {t.title && (
                  <p className="text-sm font-semibold text-white">{t.title}</p>
                )}
                <p className="text-[13px] leading-snug text-slate-300">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.toast
}
