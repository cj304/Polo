// Shared dark tooltip for all Recharts charts.
export default function ChartTooltip({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload?.length) return null
  return (
    <div className="surface min-w-[140px] px-3 py-2.5 shadow-pop">
      <p className="mb-1.5 text-[12px] font-semibold text-white">
        {labelFormatter ? labelFormatter(label) : label}
      </p>
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-[12.5px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: p.color || p.fill }} />
              {p.name}
            </span>
            <span className="font-semibold tabular-nums text-white">
              {formatter ? formatter(p.value, p.name) : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Common axis styling props.
export const axisProps = {
  stroke: 'rgba(255,255,255,0.18)',
  tick: { fill: '#64748b', fontSize: 11, fontWeight: 500 },
  tickLine: false,
  axisLine: false,
}
export const gridProps = {
  stroke: 'rgba(255,255,255,0.05)',
  vertical: false,
}
