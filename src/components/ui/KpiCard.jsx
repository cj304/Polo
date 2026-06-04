import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

// Top-of-dashboard metric card: big number, label, trend delta, mini icon.
export default function KpiCard({ label, value, delta, deltaLabel, icon: Icon, accent = false, index = 0 }) {
  const up = delta == null ? null : delta >= 0
  return (
    <div
      className="surface group relative overflow-hidden p-5 animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* faint accent wash on the active KPI */}
      {accent && (
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
      )}
      <div className="flex items-start justify-between">
        <span className="data-label">{label}</span>
        {Icon && (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg border border-hair ${
              accent ? 'bg-accent/10 text-accent' : 'bg-white/[0.03] text-slate-400'
            }`}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
      <div className="mt-3 font-display text-[28px] font-bold leading-none tracking-tight text-white">
        {value}
      </div>
      {delta != null && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[13px]">
          <span
            className={`inline-flex items-center gap-0.5 font-semibold ${
              up ? 'text-ok' : 'text-danger'
            }`}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-slate-500">{deltaLabel || 'vs last month'}</span>
        </div>
      )}
    </div>
  )
}
