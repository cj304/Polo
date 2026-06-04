import { Loader2 } from 'lucide-react'

// Primary/secondary/ghost/danger button with built-in loading state.
const VARIANTS = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-[0_2px_12px_-4px_rgba(0,102,255,0.6)] border border-accent/40',
  secondary:
    'bg-white/[0.04] text-slate-100 hover:bg-white/[0.08] border border-hair-strong',
  ghost: 'bg-transparent text-slate-300 hover:bg-white/[0.06] border border-transparent',
  danger:
    'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/30',
  amber: 'bg-amber/10 text-amber hover:bg-amber/20 border border-amber/30',
}
const SIZES = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-[38px] px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-[15px] gap-2 rounded-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex select-none items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="h-4 w-4" />
      )}
      {children}
    </button>
  )
}
