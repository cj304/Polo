import { Inbox } from 'lucide-react'

// Helpful empty state with optional action button.
export default function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-hair bg-white/[0.02]">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-[13px] text-slate-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
