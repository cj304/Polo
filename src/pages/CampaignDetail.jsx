import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Radio, Phone, Bot, MapPin, Pause, Play, Pencil, PhoneIncoming,
  DollarSign, Clock, ShieldCheck, ArrowUpRight, Sparkles,
} from 'lucide-react'
import BackLink from '../components/ui/BackLink.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { StatusBadge } from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import LeadDrawer from '../components/leads/LeadDrawer.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import {
  campaignById, clientById, leadsForCampaign, revenueForCampaign, callRouting, NICHE_LABELS,
} from '../data/mockData.js'
import { buildAgentScript, buildGreeting } from '../lib/aiScripts.js'
import { currency, phone, duration, dateTime, dateShort, DEAL_TYPE_LABELS } from '../lib/format.js'

export default function CampaignDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const campaign = campaignById(id)
  const [tab, setTab] = useState('overview')
  const [activeLead, setActiveLead] = useState(null)
  const [status, setStatus] = useState(campaign?.status)

  if (!campaign) {
    return (
      <div className="surface mt-10">
        <EmptyState icon={Radio} title="Campaign not found" message="This campaign may have been removed." action={<Button onClick={() => navigate('/campaigns')}>Back to campaigns</Button>} />
      </div>
    )
  }

  const client = clientById(campaign.client_id)
  const leads = leadsForCampaign(id)
  const revenue = revenueForCampaign(id)
  const routing = callRouting.find((r) => r.campaign_id === id)
  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0)
  const booked = leads.filter((l) => l.appointment_booked).length

  const togglePause = () => {
    const next = status === 'paused' ? 'active' : 'paused'
    setStatus(next)
    toast(`${campaign.name} ${next === 'paused' ? 'paused' : 'resumed'}.`, { type: next === 'paused' ? 'info' : 'success' })
  }

  const dealValue = campaign.deal_type === 'rent'
    ? `${currency(campaign.monthly_value)}/mo`
    : campaign.deal_type === 'sell'
    ? `${currency(campaign.per_lead_rate)}/lead`
    : `${campaign.jv_percentage}% profit share`

  const tabs = [
    { value: 'overview', label: 'Overview' },
    { value: 'leads', label: 'Leads', count: leads.length },
    { value: 'agent', label: 'AI Agent' },
    { value: 'routing', label: 'Call Routing' },
    { value: 'revenue', label: 'Revenue', count: revenue.length },
  ]

  const leadColumns = [
    { key: 'created_at', header: 'Date', render: (l) => <span className="text-[13px] text-slate-400">{dateTime(l.created_at)}</span> },
    { key: 'caller_name', header: 'Caller', render: (l) => <div className="flex items-center gap-2.5"><Avatar name={l.caller_name} size="sm" /><span className="font-medium text-slate-100">{l.caller_name}</span></div> },
    { key: 'call_duration', header: 'Duration', align: 'right', render: (l) => <span className="font-mono text-[13px] text-slate-300">{duration(l.call_duration)}</span> },
    { key: 'ai_disposition', header: 'Score', render: (l) => <StatusBadge status={l.ai_disposition} /> },
    { key: 'status', header: 'Status', render: (l) => <StatusBadge status={l.status} dot={false} /> },
  ]

  const revColumns = [
    { key: 'created_at', header: 'Date', render: (r) => <span className="text-[13px] text-slate-400">{dateShort(r.created_at)}</span> },
    { key: 'description', header: 'Description', render: (r) => <span className="text-slate-200">{r.description}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: (r) => <span className="font-semibold tabular-nums text-white">{currency(r.amount)}</span> },
    { key: 'paid', header: 'Status', render: (r) => <StatusBadge status={r.paid ? 'paid' : 'unpaid'} dot={false} /> },
  ]

  return (
    <>
      <BackLink to="/campaigns">Campaigns</BackLink>

      {/* Header */}
      <div className="surface mb-5 overflow-hidden animate-fade-in">
        <div className="grid-texture flex flex-col gap-4 border-b border-hair p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
              <Radio className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-white">{campaign.name}</h1>
                <StatusBadge status={status} />
              </div>
              <p className="mt-1 flex items-center gap-2 text-[14px] text-slate-400">
                <MapPin className="h-3.5 w-3.5" /> {campaign.city}, {campaign.state} · {NICHE_LABELS[campaign.niche]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" icon={status === 'paused' ? Play : Pause} onClick={togglePause}>
              {status === 'paused' ? 'Resume' : 'Pause'}
            </Button>
            <Button variant="secondary" icon={Pencil} onClick={() => toast('Edit form would open here.', { type: 'info' })}>Edit</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-hair sm:grid-cols-4">
          <Stat icon={Phone} label="Tracking Number" value={phone(campaign.telnyx_number)} mono />
          <Stat icon={DollarSign} label="Deal" value={dealValue} />
          <Stat icon={PhoneIncoming} label="Total Leads" value={leads.length} />
          <Stat icon={ShieldCheck} label="Booked" value={`${booked} appts`} />
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <div className="mt-5">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card title="Campaign" className="lg:col-span-2">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <Detail label="Niche" value={NICHE_LABELS[campaign.niche]} />
                <Detail label="Deal type" value={DEAL_TYPE_LABELS[campaign.deal_type]} />
                <Detail label="Client" value={client && client.id !== 'cl_06' ? client.business_name : 'Unassigned'} />
                <Detail label="Created" value={dateShort(campaign.created_at)} />
                <Detail label="Deal value" value={dealValue} />
                <Detail label="Lifetime revenue" value={currency(totalRevenue)} />
              </dl>
            </Card>
            <Card title="AI Agent" subtitle="Telnyx voice assistant">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-ok/25 bg-ok/10 text-ok">
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium text-white">Live & answering</p>
                  <p className="font-mono text-[12px] text-slate-500">{campaign.telnyx_assistant_id}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2.5 text-[13px]">
                <Row label="Status"><Badge tone="green">Active</Badge></Row>
                <Row label="Appointment tool"><Badge tone="green" dot={false}>Enabled</Badge></Row>
                <Row label="Call transfer"><Badge tone="green" dot={false}>Enabled</Badge></Row>
              </div>
              <Button variant="secondary" size="sm" className="mt-4 w-full" icon={Sparkles} onClick={() => setTab('agent')}>
                View agent script
              </Button>
            </Card>
          </div>
        )}

        {tab === 'leads' && (
          leads.length ? (
            <DataTable columns={leadColumns} rows={leads} onRowClick={(l) => setActiveLead(l)} initialSort={{ key: 'created_at', dir: 'desc' }} />
          ) : (
            <div className="surface"><EmptyState icon={PhoneIncoming} title="No leads yet" message="This campaign hasn't captured any calls." /></div>
          )
        )}

        {tab === 'agent' && <AgentPanel campaign={campaign} client={client} />}

        {tab === 'routing' && <RoutingPanel routing={routing} />}

        {tab === 'revenue' && (
          revenue.length ? (
            <DataTable columns={revColumns} rows={revenue} initialSort={{ key: 'created_at', dir: 'desc' }} />
          ) : (
            <div className="surface"><EmptyState icon={DollarSign} title="No revenue recorded" /></div>
          )
        )}
      </div>

      <LeadDrawer lead={activeLead} open={!!activeLead} onClose={() => setActiveLead(null)} />
    </>
  )
}

function AgentPanel({ campaign, client }) {
  const business = client && client.id !== 'cl_06' ? client.business_name : `${campaign.city} ${NICHE_LABELS[campaign.niche]}`
  const greeting = buildGreeting(campaign.niche, business)
  const script = buildAgentScript(campaign.niche, business, campaign.city)
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card title="Greeting" subtitle="First line the caller hears" className="lg:col-span-1">
        <p className="rounded-lg border border-hair bg-base-900/60 p-3 text-[13.5px] leading-relaxed text-slate-300">
          “{greeting}”
        </p>
      </Card>
      <Card title="System Prompt" subtitle={`${NICHE_LABELS[campaign.niche]} intake script`} className="lg:col-span-2">
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-hair bg-base-900/60 p-4 font-mono text-[12.5px] leading-relaxed text-slate-300">
          {script}
        </pre>
      </Card>
    </div>
  )
}

function RoutingPanel({ routing }) {
  if (!routing) return <div className="surface"><EmptyState title="No routing configured" /></div>
  return (
    <Card title="Call Routing" subtitle="How inbound calls are handled">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        <Detail label="Forward to" value={phone(routing.forward_to_number)} mono icon={Phone} />
        <Detail label="Backup number" value={phone(routing.backup_number)} mono icon={Phone} />
        <Detail label="Business hours" value={`${routing.business_hours_start} – ${routing.business_hours_end}`} icon={Clock} />
        <Detail label="After-hours AI" value={routing.after_hours_ai ? 'Enabled' : 'Disabled'} icon={Bot} />
      </dl>
      <div className="mt-5 flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/[0.06] p-4">
        <Bot className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <p className="text-[13px] text-slate-300">
          During business hours, calls forward to the client. Outside those hours, the AI agent answers, qualifies, and books — falling back to the backup number if the primary line doesn't pick up.
        </p>
      </div>
    </Card>
  )
}

function Stat({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-center gap-3 p-5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hair bg-white/[0.03] text-slate-400">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="data-label">{label}</p>
        <p className={`mt-0.5 truncate font-semibold text-white ${mono ? 'font-mono text-[13px]' : 'text-[15px]'}`}>{value}</p>
      </div>
    </div>
  )
}

function Detail({ label, value, mono, icon: Icon }) {
  return (
    <div>
      <dt className="data-label flex items-center gap-1.5">{Icon && <Icon className="h-3 w-3" />}{label}</dt>
      <dd className={`mt-1 text-[14px] text-slate-200 ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      {children}
    </div>
  )
}
