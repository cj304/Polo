// Consistent page title row with eyebrow, title, description and actions.
export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
      <div>
        {eyebrow && <p className="data-label mb-1.5">{eyebrow}</p>}
        <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-white">
          {title}
        </h1>
        {description && <p className="mt-1.5 max-w-xl text-[14px] text-slate-400">{description}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2.5">{children}</div>}
    </div>
  )
}
