import { useState, useMemo } from 'react'
import { PhoneIncoming, CalendarCheck } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Badge, { StatusBadge } from '../components/ui/Badge.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import { FilterBar, SearchInput, FilterSelect } from '../components/ui/Filters.jsx'
import LeadDrawer from '../components/leads/LeadDrawer.jsx'
import { leads as seedLeads, campaigns, campaignById, NICHE_LABELS } from '../data/mockData.js'
import { phone, duration, dateTime } from '../lib/format.js'

const RANGES = [
  { value: '7', label: 'Last 7 days' },
  { value: '14', label: 'Last 14 days' },
  { value: '30', label: 'Last 30 days' },
]

export default function Leads() {
  const [list, setList] = useState(seedLeads)
  const [active, setActive] = useState(null)
  const [search, setSearch] = useState('')
  const [campaign, setCampaign] = useState('')
  const [status, setStatus] = useState('')
  const [appt, setAppt] = useState('')
  const [range, setRange] = useState('30')

  const filtered = useMemo(() => {
    const cutoff = Date.now() - Number(range) * 86400000
    return list.filter((l) => {
      if (new Date(l.created_at).getTime() < cutoff) return false
      if (campaign && l.campaign_id !== campaign) return false
      if (status && l.status !== status) return false
      if (appt === 'yes' && !l.appointment_booked) return false
      if (appt === 'no' && l.appointment_booked) return false
      if (search) {
        const q = search.toLowerCase()
        return l.caller_name.toLowerCase().includes(q) || l.caller_number.includes(q)
      }
      return true
    })
  }, [list, range, campaign, status, appt, search])

  const handleUpdate = (updated) => {
    setList((l) => l.map((x) => (x.id === updated.id ? updated : x)))
    setActive(updated)
  }

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
        return (
          <div>
            <p className="text-slate-200">{c?.name}</p>
            <p className="text-[12px] text-slate-500">{NICHE_LABELS[c?.niche]}</p>
          </div>
        )
      },
    },
    {
      key: 'call_duration',
      header: 'Duration',
      sortable: true,
      align: 'right',
      render: (l) => <span className="font-mono text-[13px] tabular-nums text-slate-300">{duration(l.call_duration)}</span>,
    },
    { key: 'ai_disposition', header: 'AI Score', render: (l) => <StatusBadge status={l.ai_disposition} /> },
    {
      key: 'appointment_booked',
      header: 'Appt',
      render: (l) =>
        l.appointment_booked ? (
          <Badge tone="green" dot={false}>
            <CalendarCheck className="h-3 w-3" /> Booked
          </Badge>
        ) : (
          <span className="text-slate-600">—</span>
        ),
    },
    { key: 'status', header: 'Status', sortable: true, render: (l) => <StatusBadge status={l.status} dot={false} /> },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Leads"
        description="Every inbound call captured by your AI agents, scored and ready to bill."
      />

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search caller or number…" />
        <FilterSelect value={campaign} onChange={setCampaign} allLabel="All campaigns" options={campaigns.map((c) => ({ value: c.id, label: c.name }))} />
        <FilterSelect value={status} onChange={setStatus} allLabel="All statuses" options={[{ value: 'new', label: 'New' }, { value: 'qualified', label: 'Qualified' }, { value: 'billed', label: 'Billed' }, { value: 'invalid', label: 'Invalid' }]} />
        <FilterSelect value={appt} onChange={setAppt} allLabel="Any appt" options={[{ value: 'yes', label: 'Booked' }, { value: 'no', label: 'Not booked' }]} />
        <FilterSelect value={range} onChange={setRange} allLabel="Range" options={RANGES} />
        <span className="ml-auto text-[13px] text-slate-500">{filtered.length} leads</span>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered}
        pageSize={12}
        initialSort={{ key: 'created_at', dir: 'desc' }}
        onRowClick={(l) => setActive(l)}
        empty={
          <EmptyState
            icon={PhoneIncoming}
            title="No leads in range"
            message="Adjust your filters or widen the date range to see captured calls."
          />
        }
      />

      <LeadDrawer lead={active} open={!!active} onClose={() => setActive(null)} onUpdate={handleUpdate} />
    </>
  )
}
