import { useState, useMemo } from 'react'
import { Receipt, CheckCircle2, Clock, Download, CreditCard, ExternalLink } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import KpiCard from '../../components/ui/KpiCard.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge, { StatusBadge } from '../../components/ui/Badge.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { FilterBar, FilterSelect } from '../../components/ui/Filters.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { usePortalData } from '../usePortalData.js'
import { currency, dateShort, DEAL_TYPE_LABELS } from '../../lib/format.js'

const TYPE_LABELS = { lead_sale: 'Lead', monthly_rent: 'Retainer', jv_payment: 'JV Share' }
const TYPE_TONE = { lead_sale: 'green', monthly_rent: 'blue', jv_payment: 'amber' }

export default function PortalBilling() {
  const data = usePortalData()
  const toast = useToast()
  const [paid, setPaid] = useState({}) // invoiceId → true once "paid" in demo
  const [paying, setPaying] = useState(null)
  const [filter, setFilter] = useState('')

  if (!data) return null
  const { client, invoices } = data

  const isPaid = (inv) => inv.paid || paid[inv.id]
  const outstanding = invoices.filter((i) => !isPaid(i)).reduce((s, i) => s + i.amount, 0)
  const paidTotal = invoices.filter((i) => isPaid(i)).reduce((s, i) => s + i.amount, 0)

  const filtered = useMemo(
    () =>
      invoices.filter((i) => {
        if (filter === 'paid') return isPaid(i)
        if (filter === 'unpaid') return !isPaid(i)
        return true
      }),
    [invoices, filter, paid],
  )

  const payInvoice = async (inv) => {
    setPaying(inv.id)
    // In live mode this opens the Stripe hosted invoice URL.
    await new Promise((r) => setTimeout(r, 900))
    setPaying(null)
    setPaid((p) => ({ ...p, [inv.id]: true }))
    toast(`Payment of ${currency(inv.amount)} received. Thank you!`, { type: 'success', title: 'Paid' })
  }

  const columns = [
    { key: 'stripe_invoice_id', header: 'Invoice', render: (r) => <span className="font-mono text-[12.5px] text-accent">{r.stripe_invoice_id}</span> },
    { key: 'created_at', header: 'Date', sortable: true, accessor: (r) => new Date(r.created_at).getTime(), render: (r) => <span className="text-[13px] text-slate-400">{dateShort(r.created_at)}</span> },
    { key: 'type', header: 'Type', render: (r) => <Badge tone={TYPE_TONE[r.type]} dot={false}>{TYPE_LABELS[r.type]}</Badge> },
    { key: 'description', header: 'Description', render: (r) => <span className="text-slate-300">{r.description}</span> },
    { key: 'amount', header: 'Amount', align: 'right', sortable: true, render: (r) => <span className="font-semibold tabular-nums text-white">{currency(r.amount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={isPaid(r) ? 'paid' : 'unpaid'} dot={false} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) =>
        isPaid(r) ? (
          <Button variant="ghost" size="sm" icon={Download} onClick={() => toast('Receipt downloaded.', { type: 'info' })}>Receipt</Button>
        ) : (
          <Button size="sm" icon={CreditCard} loading={paying === r.id} onClick={() => payInvoice(r)}>Pay now</Button>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Billing"
        title="Invoices & Payments"
        description="Review your statements and pay securely. Your plan is billed below."
      >
        <Badge tone="blue" className="px-3 py-1.5">{DEAL_TYPE_LABELS[client.deal_type]}</Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard index={0} label="Amount Due" value={currency(outstanding, { compact: true })} icon={Clock} accent={outstanding > 0} />
        <KpiCard index={1} label="Paid To Date" value={currency(paidTotal, { compact: true })} icon={CheckCircle2} />
        <KpiCard index={2} label="Invoices" value={invoices.length} icon={Receipt} />
      </div>

      {outstanding > 0 && (
        <Card className="mt-5 animate-fade-in" bodyClassName="p-5">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber/30 bg-amber/10 text-amber">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-white">You have a balance due</p>
                <p className="text-[13px] text-slate-400">{currency(outstanding)} across {invoices.filter((i) => !isPaid(i)).length} open invoice(s).</p>
              </div>
            </div>
            <Button
              icon={CreditCard}
              onClick={async () => {
                const open = invoices.filter((i) => !isPaid(i))
                for (const inv of open) await payInvoice(inv)
              }}
            >
              Pay all · {currency(outstanding)}
            </Button>
          </div>
        </Card>
      )}

      <div className="mt-5">
        <FilterBar>
          <FilterSelect value={filter} onChange={setFilter} allLabel="All invoices" options={[{ value: 'unpaid', label: 'Unpaid' }, { value: 'paid', label: 'Paid' }]} />
          <span className="ml-auto text-[13px] text-slate-500">{filtered.length} invoices</span>
        </FilterBar>

        <DataTable
          columns={columns}
          rows={filtered}
          pageSize={10}
          initialSort={{ key: 'created_at', dir: 'desc' }}
          empty={<EmptyState icon={Receipt} title="No invoices yet" message="Your invoices will appear here once issued." />}
        />
      </div>

      <p className="mt-4 flex items-center gap-1.5 text-[12.5px] text-slate-600">
        <ExternalLink className="h-3.5 w-3.5" /> Payments are processed securely by Stripe.
      </p>
    </>
  )
}
