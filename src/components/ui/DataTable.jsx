import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import EmptyState from './EmptyState.jsx'

/**
 * Reusable enterprise data table.
 *
 * columns: [{ key, header, sortable, align, width, render(row), accessor(row) }]
 * rows: array of objects
 * onRowClick: optional row click handler
 * pageSize: rows per page (default 10)
 */
export default function DataTable({
  columns,
  rows,
  onRowClick,
  pageSize = 10,
  initialSort,
  empty,
  rowKey = (r) => r.id,
}) {
  const [sort, setSort] = useState(initialSort || { key: null, dir: 'desc' })
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sort.key) return rows
    const col = columns.find((c) => c.key === sort.key)
    const accessor = col?.accessor || ((r) => r[sort.key])
    return [...rows].sort((a, b) => {
      const av = accessor(a)
      const bv = accessor(b)
      if (av == null) return 1
      if (bv == null) return -1
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), undefined, { numeric: true })
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, sort, columns])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, pageCount - 1)
  const pageRows = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize)

  const toggleSort = (key) => {
    setPage(0)
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' },
    )
  }

  if (!rows.length && empty) {
    return <div className="surface">{empty}</div>
  }

  return (
    <div className="surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-hair">
              {columns.map((col) => {
                const active = sort.key === col.key
                const Arrow = active ? (sort.dir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
                return (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`whitespace-nowrap px-4 py-3 text-${col.align || 'left'} data-label ${
                      col.sortable ? 'cursor-pointer select-none transition hover:text-slate-300' : ''
                    }`}
                    onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                  >
                    <span className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'flex-row-reverse' : ''}`}>
                      {col.header}
                      {col.sortable && (
                        <Arrow className={`h-3.5 w-3.5 ${active ? 'text-accent' : 'text-slate-600'}`} />
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-hair/60 last:border-0 transition-colors animate-fade-in-fast ${
                  onRowClick ? 'cursor-pointer hover:bg-white/[0.025]' : ''
                }`}
                style={{ animationDelay: `${i * 18}ms` }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-${col.align || 'left'} align-middle ${col.cellClassName || 'text-slate-300'}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div className="flex items-center justify-between border-t border-hair px-4 py-3">
          <p className="text-[12.5px] text-slate-500">
            Showing{' '}
            <span className="font-medium text-slate-300">
              {safePage * pageSize + 1}–{Math.min(sorted.length, (safePage + 1) * pageSize)}
            </span>{' '}
            of <span className="font-medium text-slate-300">{sorted.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hair-strong text-slate-400 transition hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-[12.5px] tabular-nums text-slate-400">
              {safePage + 1} / {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={safePage >= pageCount - 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-hair-strong text-slate-400 transition hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
