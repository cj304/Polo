import { useState, useMemo } from 'react'
import { PhoneIncoming, CalendarCheck } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Badge, { StatusBadge } from '../../components/ui/Badge.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import { FilterBar, SearchInput, FilterSelect } from '../../components/ui/Filters.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import PortalLeadDrawer, { CLIENT_STAGES, STAGE_TONE } from '../PortalLeadDrawer.jsx'
import { usePortalData } from '../usePortalData.js'
import { campaignById, NICHE_LABELS } from '../../data/mockData.js'
import { phone, duration, dateTime } from '../../lib/format.js'

export default function PortalLeads() {
  const data = usePortalData()
  const toast = useToast()
  const [active, setActive] = useState(null)
  const [stages, setStages] = useState({}) // leadId → client stage
  const [search, setSearch] = useState('')
  const [campaign, setCampaign] = useState('')
  const [stage, setStage] = useState('')
  const [score, setScore] = useState('')

  if (!data) return null
  const { leads, campaigns } = data

  const setStageFor = (id, value) => {
    setStages((s) => ({ ...s, [id]: value }))
    toast(`Lead marked ${value}.`, { type: 'success' })
  }

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        const st = stages[l.id] || 'new'
        if (campaign && l.campaign_id !== campaign) return false
        if (stage && st !== stage) return false
        if (score && l.ai_disposition !== score) return false
        if (search) {
          const q = search.toLowerCase()
          return l.caller_name.toLowerCase().includes(q) || l.caller_number.includes(q)
        }
        return true
      }),
    [leads, stages, campaign, stage, score, search],
  )

  const columns = [
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      accessor: (l) => new Date(l.created_at).getTime(),
      render: (l) => <span className="whitespace-nowrap text-[13px] text-slate-400">{dateTime(l.created_at)}</span>,
    },
    {
      key: 'caller_name',
      header: 'Caller',
      sortable: true,
      render: (l) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={l.caller_name} size="sm" />
          <div>
            <p className="font-medium text-slate-100">{l.caller_name}</p>
            <p className="font-mono text-[12px] text-slate-500">{phone(l.caller_number)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'campaign',
      header: 'Campaign',
      accessor: (l) => campaignById(l.campaign_id)?.name,
      render: (l) => {
        const c = campaignById(l.campaign_id)
        return <span className="text-slate-300">{c?.name}<span className="block text-[12px] text-slate-500">{NICHE_LABELS[c?.niche]}</span></span>
      },
    },
    { key: 'call_duration', header: 'Duration', align: 'right', sortable: true, render: (l) => <span className="font-mono text-[13px] text-slate-300">{duration(l.call_duration)}</span> },
    { key: 'ai_disposition', header: 'AI Score', render: (l) => <StatusBadge status={l.ai_disposition} /> },
    {
      key: 'appointment_booked',
      header: 'Appt',
      render: (l) => l.appointment_booked ? <Badge tone="green" dot={false}><CalendarCheck className="h-3 w-3" /> Booked</Badge> : <span className="text-slate-600">—</span>,
    },
    {
      key: 'stage',
      header: 'Status',
      render: (l) => {
        const st = stages[l.id] || 'new'
        const label = CLIENT_STAGES.find((s) => s.value === st)?.label
        return <Badge tone={STAGE_TONE[st]} dot={false}>{label}</Badge>
      },
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="My Leads"
        description="Every call our AI agents captured for your business. Listen back, read the transcript, and track your follow-up."
      />

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search caller or number…" />
        <FilterSelect value={campaign} onChange={setCampaign} allLabel="All campaigns" options={campaigns.map((c) => ({ value: c.id, label: c.name }))} />
        <FilterSelect value={score} onChange={setScore} allLabel="Any score" options={[{ value: 'hot', label: 'Hot' }, { value: 'warm', label: 'Warm' }, { value: 'cold', label: 'Cold' }]} />
        <FilterSelect value={stage} onChange={setStage} allLabel="Any status" options={CLIENT_STAGES} />
        <span className="ml-auto text-[13px] text-slate-500">{filtered.length} leads</span>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered}
        pageSize={12}
        initialSort={{ key: 'created_at', dir: 'desc' }}
        onRowClick={(l) => setActive(l)}
        empty={<EmptyState icon={PhoneIncoming} title="No leads yet" message="As soon as a call comes in, it will appear here." />}
      />

      <PortalLeadDrawer
        lead={active}
        open={!!active}
        onClose={() => setActive(null)}
        stage={active ? stages[active.id] : undefined}
        onStage={setStageFor}
      />
    </>
  )
}
