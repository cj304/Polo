import { useState, useMemo } from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { CreditCard, DollarSign, TrendingUp, Clock, CheckCircle2, FileText } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import KpiCard from '../components/ui/KpiCard.jsx'
import Badge, { StatusBadge } from '../components/ui/Badge.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { FilterBar, SearchInput, FilterSelect } from '../components/ui/Filters.jsx'
import ChartTooltip, { axisProps, gridProps } from '../components/ui/ChartTooltip.jsx'
import InvoiceModal from '../components/forms/InvoiceModal.jsx'
import {
  revenue as seedRevenue, clients, clientById, computeMRR, monthlyRevenue,
} from '../data/mockData.js'
import { currency, dateShort } from '../lib/format.js'

const TYPE_LABELS = { lead_sale: 'Lead Sale', monthly_rent: 'Monthly Rent', jv_payment: 'JV Payment' }
const TYPE_TONE = { lead_sale: 'green', monthly_rent: 'blue', jv_payment: 'amber' }

export default function Revenue() {
  const [list, setList] = useState(seedRevenue)
  const [modal, setModal] = useState(false)
  const [search, setSearch] = useState('')
  const [client, setClient] = useState('')
  const [type, setType] = useState('')
  const [paid, setPaid] = useState('')

  const mrr = computeMRR()
  const collected = list.filter((r) => r.paid).reduce((s, r) => s + r.amount, 0)
  const outstanding = list.filter((r) => !r.paid).reduce((s, r) => s + r.amount, 0)
  const chart = monthlyRevenue()

  const filtered = useMemo(
    () =>
      list.filter((r) => {
        if (client && r.client_id !== client) return false
        if (type && r.type !== type) return false
        if (paid === 'paid' && !r.paid) return false
        if (paid === 'unpaid' && r.paid) return false
        if (search) {
          const q = search.toLowerCase()
          const cl = clientById(r.client_id)
          return r.description.toLowerCase().includes(q) || (cl?.business_name || '').toLowerCase().includes(q)
        }
        return true
      }),
    [list, client, type, paid, search],
  )

  const handleSave = (inv) => {
    setList((l) => [
      { id: `rev_${Math.random().toString(36).slice(2, 7)}`, campaign_id: null, paid: false, paid_date: null, created_at: new Date().toISOString(), ...inv },
      ...l,
    ])
  }

  const columns = [
    { key: 'created_at', header: 'Date', sortable: true, accessor: (r) => new Date(r.created_at).getTime(), render: (r) => <span className="whitespace-nowrap text-[13px] text-slate-400">{dateShort(r.created_at)}</span> },
    { key: 'client', header: 'Client', accessor: (r) => clientById(r.client_id)?.business_name, render: (r) => <span className="font-medium text-slate-100">{clientById(r.client_id)?.business_name || '—'}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone={TYPE_TONE[r.type]}>{TYPE_LABELS[r.type]}</Badge> },
    { key: 'description', header: 'Description', render: (r) => <span className="text-slate-400">{r.description}</span> },
    { key: 'amount', header: 'Amount', align: 'right', sortable: true, render: (r) => <span className="font-semibold tabular-nums text-white">{currency(r.amount)}</span> },
    { key: 'invoice', header: 'Invoice', render: (r) => r.stripe_invoice_id ? <span className="font-mono text-[12px] text-accent">{r.stripe_invoice_id}</span> : <span className="text-slate-600">—</span> },
    { key: 'paid', header: 'Status', sortable: true, accessor: (r) => (r.paid ? 1 : 0), render: (r) => <StatusBadge status={r.paid ? 'paid' : 'unpaid'} dot={false} /> },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Revenue"
        description="MRR, collections, and every invoice across the book of business."
      >
        <Button icon={CreditCard} onClick={() => setModal(true)}>Create Invoice</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} label="Monthly Recurring" value={currency(mrr, { compact: true })} delta={12.4} icon={TrendingUp} accent />
        <KpiCard index={1} label="Collected (all-time)" value={currency(collected, { compact: true })} icon={CheckCircle2} />
        <KpiCard index={2} label="Outstanding" value={currency(outstanding, { compact: true })} icon={Clock} />
        <KpiCard index={3} label="Invoices" value={list.filter((r) => r.stripe_invoice_id).length} icon={FileText} />
      </div>

      <Card className="mt-5 animate-fade-in" title="Monthly Revenue" subtitle="Collected vs outstanding by month"
        action={
          <div className="flex items-center gap-4 text-[12px]">
            <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-[2px] bg-accent" /> Collected</span>
            <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-[2px] bg-amber" /> Outstanding</span>
          </div>
        }
      >
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="month" {...axisProps} />
              <YAxis {...axisProps} width={48} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip content={<ChartTooltip formatter={(v) => currency(v)} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="paid" name="Collected" stackId="a" fill="#0066FF" radius={[0, 0, 0, 0]} barSize={36} />
              <Bar dataKey="outstanding" name="Outstanding" stackId="a" fill="#F59E0B" radius={[3, 3, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-5">
        <FilterBar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search descriptions, clients…" />
          <FilterSelect value={client} onChange={setClient} allLabel="All clients" options={clients.filter((c) => c.id !== 'cl_06').map((c) => ({ value: c.id, label: c.business_name }))} />
          <FilterSelect value={type} onChange={setType} allLabel="All types" options={Object.entries(TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
          <FilterSelect value={paid} onChange={setPaid} allLabel="All status" options={[{ value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' }]} />
          <span className="ml-auto text-[13px] text-slate-500">{currency(filtered.reduce((s, r) => s + r.amount, 0))} total</span>
        </FilterBar>

        <DataTable
          columns={columns}
          rows={filtered}
          pageSize={12}
          initialSort={{ key: 'created_at', dir: 'desc' }}
          empty={<EmptyState icon={DollarSign} title="No revenue matches" message="Adjust filters or create a new invoice." action={<Button icon={CreditCard} onClick={() => setModal(true)}>Create Invoice</Button>} />}
        />
      </div>

      <InvoiceModal open={modal} onClose={() => setModal(false)} onSave={handleSave} />
    </>
  )
}
