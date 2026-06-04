// Underline tab strip used on detail pages.
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-hair">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`relative whitespace-nowrap px-3.5 py-2.5 text-[13.5px] font-medium transition ${
            active === t.value ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="flex items-center gap-1.5">
            {t.label}
            {t.count != null && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold ${active === t.value ? 'bg-accent/15 text-accent' : 'bg-white/5 text-slate-500'}`}>
                {t.count}
              </span>
            )}
          </span>
          {active === t.value && (
            <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
          )}
        </button>
      ))}
    </div>
  )
}
