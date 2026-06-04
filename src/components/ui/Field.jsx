import { ChevronDown } from 'lucide-react'

// Form field primitives sharing a single visual language.

export function Label({ children, required, hint }) {
  return (
    <label className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-slate-300">
      <span>
        {children}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </span>
      {hint && <span className="text-[11px] font-normal text-slate-500">{hint}</span>}
    </label>
  )
}

const baseInput =
  'w-full rounded-lg border bg-base-900/70 px-3 text-sm text-slate-100 placeholder:text-slate-600 transition focus:border-accent/60 focus:bg-base-900'

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`${baseInput} h-10 ${error ? 'border-danger/50' : 'border-hair-strong'} ${className}`}
      {...props}
    />
  )
}

export function Textarea({ error, className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`${baseInput} resize-y py-2.5 leading-relaxed ${error ? 'border-danger/50' : 'border-hair-strong'} ${className}`}
      {...props}
    />
  )
}

export function Select({ children, error, className = '', ...props }) {
  return (
    <div className="relative">
      <select
        className={`${baseInput} h-10 appearance-none pr-9 ${error ? 'border-danger/50' : 'border-hair-strong'} ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
    </div>
  )
}

export function FieldError({ children }) {
  if (!children) return null
  return <p className="mt-1.5 text-[12px] text-danger">{children}</p>
}

// Convenience wrapper: label + control + error in a column.
export function FormField({ label, required, hint, error, children }) {
  return (
    <div>
      {label && (
        <Label required={required} hint={hint}>
          {label}
        </Label>
      )}
      {children}
      <FieldError>{error}</FieldError>
    </div>
  )
}
