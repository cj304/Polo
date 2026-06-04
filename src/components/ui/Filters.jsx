import { Search } from 'lucide-react'

// Compact filter bar building blocks used above tables.

export function FilterBar({ children }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5">{children}</div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative flex-1 sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[38px] w-full rounded-lg border border-hair-strong bg-base-850 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 transition focus:border-accent/60"
      />
    </div>
  )
}

export function FilterSelect({ value, onChange, options, allLabel = 'All' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[38px] appearance-none rounded-lg border border-hair-strong bg-base-850 pl-3 pr-8 text-[13px] font-medium text-slate-200 transition hover:border-hair-strong focus:border-accent/60"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
        viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
