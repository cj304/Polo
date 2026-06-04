// Shared formatting helpers used across tables, cards and charts.

export const DEAL_TYPE_LABELS = {
  sell: 'Sell Leads',
  rent: 'Rent Asset',
  jv: 'JV Profit Share',
}

export function currency(value, { compact = false } = {}) {
  if (value == null || Number.isNaN(value)) return '$0'
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

export function number(value) {
  return new Intl.NumberFormat('en-US').format(value ?? 0)
}

export function percent(value) {
  return `${Math.round((value ?? 0) * 100) / 100}%`
}

// "(305) 555-0142" from a +1 E.164 number.
export function phone(raw) {
  if (!raw) return '—'
  const digits = String(raw).replace(/\D/g, '').replace(/^1/, '')
  if (digits.length !== 10) return raw
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function duration(seconds) {
  if (!seconds && seconds !== 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function dateShort(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function dateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function relativeTime(value) {
  if (!value) return '—'
  const diff = Date.now() - new Date(value).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days}d ago`
  return dateShort(value)
}

export function initials(name) {
  if (!name) return '–'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}
