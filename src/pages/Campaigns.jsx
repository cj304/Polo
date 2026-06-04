import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Radio, Pause, Play, Pencil, PhoneIncoming, MoreHorizontal } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { StatusBadge } from '../components/ui/Badge.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { FilterBar, SearchInput, FilterSelect } from '../components/ui/Filters.jsx'
import CampaignFormModal from '../components/forms/CampaignFormModal.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { campaigns as seedCampaigns, clientById, leadsForCampaign, NICHE_LABELS } from '../data/mockData.js'
import { NICHES } from '../lib/aiScripts.js'
import { currency, phone, DEAL_TYPE_LABELS } from '../lib/format.js'

const dealValue = (c) =>
  c.deal_type === 'rent'
    ? currency(c.monthly_value)
    : c.deal_type === 'sell'
    ? `${currency(c.per_lead_rate)}/lead`
    : `${c.jv_percentage}% JV`

export default function Campaigns() {
  const navigate = useNavigate()
  const toast = useToast()
  const [list, setList] = useState(seedCampaigns)
  const [modal, setModal] = useState(false)
  const [search, setSearch] = useState('')
  const [niche, setNiche] = useState('')
  const [status, setStatus] = useState('')
  const [deal, setDeal] = useState('')

  const filtered = useMemo(
    () =>
      list.filter((c) => {
        if (niche && c.niche !== niche) return false
        if (status && c.status !== status) return false
        if (deal && c.deal_type !== deal) return false
        if (search) {
          const q = search.toLowerCase()
          return (
            c.name.toLowerCase().includes(q) ||
            c.city.toLowerCase().includes(q) ||
            (c.telnyx_number || '').includes(q)
          )
        }
        return true
      }),
    [list, niche, status, deal, search],
  )

  const togglePause = (e, c) => {
    e.stopPropagation()
    const next = c.status === 'paused' ? 'active' : 'paused'
    setList((l) => l.map((x) => (x.id === c.id ? { ...x, status: next } : x)))
    toast(`${c.name} ${next === 'paused' ? 'paused' : 'resumed'}.`, {
      type: next === 'paused' ? 'info' : 'success',
    })
  }

  const handleSave = (form) => {
    const id = `cmp_${Math.random().toString(36).slice(2, 7)}`
    setList((l) => [
      {
        id,
        ...form,
        monthly_value: Number(form.monthly_value) || 0,
        per_lead_rate: Number(form.per_lead_rate) || null,
        jv_percentage: Number(form.jv_percentage) || null,
        telnyx_number: `+1${form.area_code || '305'}555${Math.floor(1000 + Math.random() * 8999)}`,
        telnyx_assistant_id: `assistant_${id}`,
        status: 'active',
        created_at: new Date().toISOString(),
      },
      ...l,
    ])
  }

  const columns = [
    {
      key: 'name',
      header: 'Campaign',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-hair bg-white/[0.03] text-slate-400">
            <Radio className="h-4 w-4" />
          </span>
          <div>
            <p className="font-medium text-slate-100">{c.name}</p>
            <p className="text-[12px] text-slate-500">{NICHE_LABELS[c.niche]}</p>
          </div>
        </div>
      ),
    },
    { key: 'city', header: 'Location', sortable: true, render: (c) => <span className="text-slate-300">{c.city}, {c.state}</span> },
    {
      key: 'telnyx_number',
      header: 'Number',
      render: (c) => <span className="font-mono text-[12.5px] text-slate-300">{phone(c.telnyx_number)}</span>,
    },
    {
      key: 'client_id',
      header: 'Client',
      sortable: true,
      accessor: (c) => clientById(c.client_id)?.business_name || 'zzz',
      render: (c) => {
        const cl = clientById(c.client_id)
        return cl && cl.id !== 'cl_06' ? (
          <span className="text-slate-300">{cl.business_name}</span>
        ) : (
          <span className="text-slate-600">Unassigned</span>
        )
      },
    },
    {
      key: 'deal_type',
      header: 'Deal',
      render: (c) => <Badge tone="slate">{DEAL_TYPE_LABELS[c.deal_type]}</Badge>,
    },
    {
      key: 'value',
      header: 'Value',
      align: 'right',
      sortable: true,
      accessor: (c) => c.monthly_value || c.per_lead_rate || c.jv_percentage || 0,
      render: (c) => <span className="font-semibold tabular-nums text-white">{dealValue(c)}</span>,
    },
    { key: 'status', header: 'Status', render: (c) => <StatusBadge status={c.status} /> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <IconBtn title="View leads" onClick={() => navigate(`/campaigns/${c.id}`)}>
            <PhoneIncoming className="h-4 w-4" />
          </IconBtn>
          <IconBtn title={c.status === 'paused' ? 'Resume' : 'Pause'} onClick={(e) => togglePause(e, c)}>
            {c.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </IconBtn>
          <IconBtn title="Edit" onClick={() => navigate(`/campaigns/${c.id}`)}>
            <Pencil className="h-4 w-4" />
          </IconBtn>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Assets"
        title="Campaigns"
        description="Every niche landing page, tracking number, and AI agent in one ledger."
      >
        <Button icon={Plus} onClick={() => setModal(true)}>New Campaign</Button>
      </PageHeader>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search campaigns, cities, numbers…" />
        <FilterSelect value={niche} onChange={setNiche} allLabel="All niches" options={NICHES.map((n) => ({ value: n, label: NICHE_LABELS[n] }))} />
        <FilterSelect value={status} onChange={setStatus} allLabel="All statuses" options={[{ value: 'active', label: 'Active' }, { value: 'paused', label: 'Paused' }, { value: 'for_sale', label: 'For Sale' }]} />
        <FilterSelect value={deal} onChange={setDeal} allLabel="All deals" options={Object.entries(DEAL_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        <span className="ml-auto text-[13px] text-slate-500">{filtered.length} campaigns</span>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filtered}
        onRowClick={(c) => navigate(`/campaigns/${c.id}`)}
        empty={
          <EmptyState
            icon={Radio}
            title="No campaigns match"
            message="Try clearing filters, or launch a new campaign to provision a number and AI agent."
            action={<Button icon={Plus} onClick={() => setModal(true)}>New Campaign</Button>}
          />
        }
      />

      <CampaignFormModal open={modal} onClose={() => setModal(false)} onSave={handleSave} />
    </>
  )
}

function IconBtn({ children, title, onClick }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition hover:border-hair-strong hover:bg-white/[0.05] hover:text-white"
    >
      {children}
    </button>
  )
}
