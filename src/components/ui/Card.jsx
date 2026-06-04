// Generic hairline-bordered surface card with optional header.
export default function Card({ title, subtitle, action, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`surface overflow-hidden ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 border-b border-hair px-5 py-4">
          <div className="min-w-0">
            {title && <h3 className="text-[15px] font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName || 'p-5'}>{children}</div>
    </section>
  )
}
