import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Users, ArrowUpRight, Mail, Phone as PhoneIcon, LayoutGrid, List } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { FilterBar, SearchInput, FilterSelect } from '../components/ui/Filters.jsx'
import ClientFormModal from '../components/forms/ClientFormModal.jsx'
import { clients as seedClients, campaignsForClient } from '../data/mockData.js'
import { currency, phone, dateShort, DEAL_TYPE_LABELS } from '../lib/format.js'

const clientMRR = (id) =>
  campaignsForClient(id)
    .filter((c) => c.status === 'active')
    .reduce((s, c) => s + (c.monthly_value || 0), 0)

const DEAL_TONE = { rent: 'blue', jv: 'amber', sell: 'green' }

export default function Clients() {
  const navigate = useNavigate()
  const [list, setList] = useState(seedClients.filter((c) => c.id !== 'cl_06'))
  const [modal, setModal] = useState(false)
  const [search, setSearch] = useState('')
  const [deal, setDeal] = useState('')
  const [view, setView] = useState('cards')

  const filtered = useMemo(
    () =>
      list.filter((c) => {
        if (deal && c.deal_type !== deal) return false
        if (search) {
          const q = search.toLowerCase()
          return c.business_name.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
        }
        return true
      }),
    [list, deal, search],
  )

  const handleSave = (form) => {
    const id = `cl_${Math.random().toString(36).slice(2, 7)}`
    setList((l) => [{ id, stripe_customer_id: `cus_${id}`, created_at: new Date().toISOString(), ...form }, ...l])
  }

  const columns = [
    {
      key: 'business_name',
      header: 'Client',
      sortable: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          <Avatar name={c.business_name} />
          <div>
            <p className="font-medium text-slate-100">{c.business_name}</p>
            <p className="text-[12px] text-slate-500">{c.name}</p>
          </div>
        </div>
      ),
    },
    { key: 'deal_type', header: 'Deal', render: (c) => <Badge tone={DEAL_TONE[c.deal_type]}>{DEAL_TYPE_LABELS[c.deal_type]}</Badge> },
    { key: 'mrr', header: 'MRR', align: 'right', sortable: true, accessor: (c) => clientMRR(c.id), render: (c) => <span className="font-semibold tabular-nums text-white">{currency(clientMRR(c.id))}</span> },
    { key: 'campaigns', header: 'Campaigns', align: 'right', accessor: (c) => campaignsForClient(c.id).length, render: (c) => <span className="tabular-nums text-slate-300">{campaignsForClient(c.id).length}</span> },
    { key: 'renewal', header: 'Renewal', sortable: true, accessor: (c) => c.contract_renewal, render: (c) => <span className="text-[13px] text-slate-400">{dateShort(c.contract_renewal)}</span> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <Button variant="ghost" size="sm" onClick={() => navigate(`/clients/${c.id}`)}>
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Relationships"
        title="Clients"
        description="Local businesses buying leads, renting assets, or splitting profit with you."
      >
        <div className="hidden items-center rounded-lg border border-hair-strong bg-base-850 p-0.5 sm:flex">
          <ToggleBtn active={view === 'cards'} onClick={() => setView('cards')} icon={LayoutGrid} />
          <ToggleBtn active={view === 'table'} onClick={() => setView('table')} icon={List} />
        </div>
        <Button icon={UserPlus} onClick={() => setModal(true)}>Add Client</Button>
      </PageHeader>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search clients…" />
        <FilterSelect value={deal} onChange={setDeal} allLabel="All deals" options={Object.entries(DEAL_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
        <span className="ml-auto text-[13px] text-slate-500">{filtered.length} clients</span>
      </FilterBar>

      {filtered.length === 0 ? (
        <div className="surface">
          <EmptyState icon={Users} title="No clients yet" message="Add your first client to start tracking deals and revenue." action={<Button icon={UserPlus} onClick={() => setModal(true)}>Add Client</Button>} />
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => (
            <ClientCard key={c.id} client={c} index={i} onOpen={() => navigate(`/clients/${c.id}`)} />
          ))}
        </div>
      ) : (
        <DataTable columns={columns} rows={filtered} onRowClick={(c) => navigate(`/clients/${c.id}`)} />
      )}

      <ClientFormModal open={modal} onClose={() => setModal(false)} onSave={handleSave} />
    </>
  )
}

function ClientCard({ client, index, onOpen }) {
  const campaigns = campaignsForClient(client.id)
  const active = campaigns.filter((c) => c.status === 'active').length
  return (
    <button
      onClick={onOpen}
      className="surface group animate-fade-in p-5 text-left transition-all hover:border-hair-strong hover:bg-base-750"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={client.business_name} size="lg" />
          <div>
            <p className="font-semibold text-white">{client.business_name}</p>
            <p className="text-[13px] text-slate-500">{client.name}</p>
          </div>
        </div>
        <Badge tone={DEAL_TONE[client.deal_type]}>{DEAL_TYPE_LABELS[client.deal_type]}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 border-y border-hair py-3.5">
        <Metric label="MRR" value={currency(clientMRR(client.id), { compact: true })} />
        <Metric label="Active" value={`${active}/${campaigns.length}`} />
        <Metric label="Renews" value={dateShort(client.contract_renewal)} small />
      </div>

      <div className="mt-3 space-y-1.5 text-[13px] text-slate-400">
        <p className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5 text-slate-500" /> {client.email || '—'}</p>
        <p className="flex items-center gap-2"><PhoneIcon className="h-3.5 w-3.5 text-slate-500" /> {phone(client.phone)}</p>
      </div>
    </button>
  )
}

function Metric({ label, value, small }) {
  return (
    <div>
      <p className="data-label">{label}</p>
      <p className={`mt-1 font-semibold text-white ${small ? 'text-[13px]' : 'text-[15px]'}`}>{value}</p>
    </div>
  )
}

function ToggleBtn({ active, onClick, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition ${active ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
