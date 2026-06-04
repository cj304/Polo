// Status + label badges with consistent color coding across the app.

const TONES = {
  green: 'bg-ok/10 text-ok border-ok/20',
  amber: 'bg-amber/10 text-amber border-amber/25',
  red: 'bg-danger/10 text-danger border-danger/20',
  blue: 'bg-accent/10 text-accent border-accent/25',
  slate: 'bg-white/[0.05] text-slate-400 border-hair-strong',
}

// Maps domain statuses to a tone + display label.
const STATUS_MAP = {
  // campaign / generic
  active: { tone: 'green', label: 'Active' },
  paused: { tone: 'red', label: 'Paused' },
  for_sale: { tone: 'blue', label: 'For Sale' },
  inactive: { tone: 'slate', label: 'Inactive' },
  // lead status
  new: { tone: 'blue', label: 'New' },
  qualified: { tone: 'green', label: 'Qualified' },
  billed: { tone: 'slate', label: 'Billed' },
  invalid: { tone: 'red', label: 'Invalid' },
  pending: { tone: 'amber', label: 'Pending' },
  // disposition
  hot: { tone: 'red', label: 'Hot' },
  warm: { tone: 'amber', label: 'Warm' },
  cold: { tone: 'blue', label: 'Cold' },
  // payment
  paid: { tone: 'green', label: 'Paid' },
  unpaid: { tone: 'amber', label: 'Unpaid' },
}

export function StatusBadge({ status, dot = true }) {
  const cfg = STATUS_MAP[status] || { tone: 'slate', label: status }
  return <Badge tone={cfg.tone} dot={dot}>{cfg.label}</Badge>
}

export default function Badge({ children, tone = 'slate', dot = false, className = '' }) {
  const dotColor = {
    green: 'bg-ok',
    amber: 'bg-amber',
    red: 'bg-danger',
    blue: 'bg-accent',
    slate: 'bg-slate-500',
  }[tone]
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold ${TONES[tone]} ${className}`}
    >
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColor} ${tone === 'green' ? 'animate-pulse' : ''}`} />
      )}
      {children}
    </span>
  )
}
