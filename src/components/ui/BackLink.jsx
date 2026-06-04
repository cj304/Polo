import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 transition hover:text-slate-300"
    >
      <ChevronLeft className="h-4 w-4" />
      {children}
    </Link>
  )
}
