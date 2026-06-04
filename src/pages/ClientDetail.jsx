import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Users, Mail, Phone as PhoneIcon, Calendar, CreditCard, Radio,
  DollarSign, FileText, Pencil, ArrowUpRight, Plus,
} from 'lucide-react'
import BackLink from '../components/ui/BackLink.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { StatusBadge } from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import {
  clientById, campaignsForClient, leadsForClient, revenueForClient, NICHE_LABELS,
} from '../data/mockData.js'
import { currency, phone, dateShort, dateTime, duration, DEAL_TYPE_LABELS } from '../lib/format.js'

const DEAL_TONE = { rent: 'blue', jv: 'amber', sell: 'green' }

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const client = clientById(id)
  const [tab, setTab] = useState('overview')

  if (!client) {
    return (
      <div className="surface mt-10">
        <EmptyState icon={Users} title="Client not found" action={<Button onClick={() => navigate('/clients')}>Back to clients</Button>} />
      </div>
    )
  }

  const campaigns = campaignsForClient(id)
  const leads = leadsForClient(id)
  const revenue = revenueForClient(id)
  const mrr = campaigns.filter((c) => c.status === 'active').reduce((s, c) => s + (c.monthly_value || 0), 0)
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0)
  const outstanding = revenue.filter((r) => !r.paid).reduce((s, r) => s + r.amount, 0)
  const invoices = revenue.filter((r) => r.stripe_invoice_id)

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'campaigns', label: 'Campaigns', count: campaigns.length },
    { value: 'leads', label: 'Leads', count: leads.length },
    { value: 'revenue', label: 'Revenue', count: revenue.length },
    { value: 'invoices', label: 'Invoices', count: invoices.length },
  ]

  return (
    <>
      <BackLink to="/clients">Clients</BackLink>

      <div className="surface mb-5 overflow-hidden animate-fade-in">
        <div className="grid-texture flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={client.business_name} size="lg" accent />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-white">{client.business_name}</h1>
                <Badge tone={DEAL_TONE[client.deal_type]}>{DEAL_TYPE_LABELS[client.deal_type]}</Badge>
              </div>
              <p className="mt-1 text-[14px] text-slate-400">{client.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" icon={CreditCard} onClick={() => { navigate('/revenue'); }}>Create Invoice</Button>
            <Button variant="secondary" icon={Pencil} onClick={() => toast('Edit client form would open here.', { type: 'info' })}>Edit</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-hair border-t border-hair sm:grid-cols-4">
          <Stat label="MRR" value={currency(mrr)} />
          <Stat label="Lifetime Revenue" value={currency(totalRevenue)} />
          <Stat label="Outstanding" value={currency(outstanding)} tone={outstanding > 0 ? 'amber' : undefined} />
          <Stat label="Active Campaigns" value={campaigns.filter((c) => c.status === 'active').length} />
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="mt-5">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title="Contact" className="lg:col-span-1">
              <div className="space-y-3 text-[14px]">
                <ContactRow icon={Mail} value={client.email || '—'} />
                <ContactRow icon={PhoneIcon} value={phone(client.phone)} />
                <ContactRow icon={Calendar} value={`Started ${dateShort(client.contract_start)}`} />
                <ContactRow icon={Calendar} value={`Renews ${dateShort(client.contract_renewal)}`} />
                <ContactRow icon={CreditCard} value={client.stripe_customer_id || '—'} mono />
              </div>
            </Card>
            <Card title="Deal Terms" className="lg:col-span-1">
              <dl className="space-y-4">
                <Detail label="Deal type" value={DEAL_TYPE_LABELS[client.deal_type]} />
                <Detail label="Monthly recurring" value={currency(mrr)} />
                <Detail label="Campaigns" value={`${campaigns.length} total`} />
              </dl>
            </Card>
            <Card title="Notes" className="lg:col-span-1">
              <p className="text-[13.5px] leading-relaxed text-slate-300">{client.notes || 'No notes yet.'}</p>
            </Card>
          </div>
        )}

        {tab === 'campaigns' && (
          campaigns.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {campaigns.map((c) => (
                <button key={c.id} onClick={() => navigate(`/campaigns/${c.id}`)} className="surface group flex items-center justify-between p-4 text-left transition hover:border-hair-strong hover:bg-base-750">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-hair bg-white/[0.03] text-slate-400"><Radio className="h-4 w-4" /></span>
                    <div>
                      <p className="font-medium text-white">{c.name}</p>
                      <p className="text-[12px] text-slate-500">{c.city}, {c.state} · {NICHE_LABELS[c.niche]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={c.status} />
                    <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:text-slate-300" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="surface"><EmptyState icon={Radio} title="No campaigns assigned" /></div>
          )
        )}

        {tab === 'leads' && (
          leads.length ? (
            <DataTable
              columns={[
                { key: 'created_at', header: 'Date', render: (l) => <span className="text-[13px] text-slate-400">{dateTime(l.created_at)}</span> },
                { key: 'caller_name', header: 'Caller', render: (l) => <span className="font-medium text-slate-100">{l.caller_name}</span> },
                { key: 'duration', header: 'Duration', align: 'right', render: (l) => <span className="font-mono text-[13px] text-slate-300">{duration(l.call_duration)}</span> },
                { key: 'ai_disposition', header: 'Score', render: (l) => <StatusBadge status={l.ai_disposition} /> },
                { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} dot={false} /> },
              ]}
              rows={leads}
              initialSort={{ key: 'created_at', dir: 'desc' }}
            />
          ) : (
            <div className="surface"><EmptyState title="No leads yet" /></div>
          )
        )}

        {tab === 'revenue' && (
          revenue.length ? (
            <DataTable
              columns={[
                { key: 'created_at', header: 'Date', render: (r) => <span className="text-[13px] text-slate-400">{dateShort(r.created_at)}</span> },
                { key: 'description', header: 'Description', render: (r) => <span className="text-slate-200">{r.description}</span> },
                { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="font-semibold tabular-nums text-white">{currency(r.amount)}</span> },
                { key: 'paid', header: 'Status', render: (r) => <StatusBadge status={r.paid ? 'paid' : 'unpaid'} dot={false} /> },
              ]}
              rows={revenue}
              initialSort={{ key: 'created_at', dir: 'desc' }}
            />
          ) : (
            <div className="surface"><EmptyState icon={DollarSign} title="No revenue recorded" /></div>
          )
        )}

        {tab === 'invoices' && (
          invoices.length ? (
            <DataTable
              columns={[
                { key: 'stripe_invoice_id', header: 'Invoice', render: (r) => <span className="font-mono text-[12.5px] text-accent">{r.stripe_invoice_id}</span> },
                { key: 'description', header: 'Description', render: (r) => <span className="text-slate-200">{r.description}</span> },
                { key: 'due_date', header: 'Due', render: (r) => <span className="text-[13px] text-slate-400">{dateShort(r.due_date)}</span> },
                { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="font-semibold tabular-nums text-white">{currency(r.amount)}</span> },
                { key: 'paid', header: 'Status', render: (r) => <StatusBadge status={r.paid ? 'paid' : 'unpaid'} dot={false} /> },
              ]}
              rows={invoices}
              initialSort={{ key: 'due_date', dir: 'desc' }}
            />
          ) : (
            <div className="surface"><EmptyState icon={FileText} title="No invoices yet" message="Create an invoice from the Revenue page." /></div>
          )
        )}
      </div>
    </>
  )
}

function Stat({ label, value, tone }) {
  return (
    <div className="p-5">
      <p className="data-label">{label}</p>
      <p className={`mt-1 font-display text-xl font-bold ${tone === 'amber' ? 'text-amber' : 'text-white'}`}>{value}</p>
    </div>
  )
}
function ContactRow({ icon: Icon, value, mono }) {
  return (
    <p className={`flex items-center gap-2.5 text-slate-300 ${mono ? 'font-mono text-[12.5px]' : ''}`}>
      <Icon className="h-4 w-4 shrink-0 text-slate-500" /> <span className="truncate">{value}</span>
    </p>
  )
}
function Detail({ label, value }) {
  return (
    <div>
      <dt className="data-label">{label}</dt>
      <dd className="mt-1 text-[15px] font-medium text-white">{value}</dd>
    </div>
  )
}
