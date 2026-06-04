import { initials } from '../../lib/format.js'

// Deterministic monochrome avatar — initials on a hairline tile.
export default function Avatar({ name, size = 'md', accent = false }) {
  const dim = { sm: 'h-7 w-7 text-[11px]', md: 'h-9 w-9 text-[13px]', lg: 'h-12 w-12 text-base' }[size]
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border font-semibold ${dim} ${
        accent
          ? 'border-accent/30 bg-accent/10 text-accent'
          : 'border-hair-strong bg-white/[0.04] text-slate-300'
      }`}
    >
      {initials(name)}
    </span>
  )
}
