import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import {
  DollarSign,
  Radio,
  PhoneIncoming,
  CalendarCheck,
  Plus,
  UserPlus,
  ArrowRight,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import KpiCard from '../components/ui/KpiCard.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { StatusBadge } from '../components/ui/Badge.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import ChartTooltip, { axisProps, gridProps } from '../components/ui/ChartTooltip.jsx'
import {
  computeMRR,
  campaigns,
  leads,
  leadsPerDay,
  revenueByCampaign,
  leadsThisMonth,
  appointmentsThisMonth,
  campaignById,
  NICHE_LABELS,
} from '../data/mockData.js'
import { currency, relativeTime, phone } from '../lib/format.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const mrr = computeMRR()
  const activeCount = campaigns.filter((c) => c.status === 'active').length
  const series = leadsPerDay()
  const revByCampaign = revenueByCampaign().slice(0, 6)
  const recent = leads.slice(0, 8)

  const kpis = [
    { label: 'Total MRR', value: currency(mrr, { compact: true }), delta: 12.4, icon: DollarSign, accent: true },
    { label: 'Active Campaigns', value: activeCount, delta: 8.0, deltaLabel: 'vs last month', icon: Radio },
    { label: 'Leads This Month', value: leadsThisMonth(), delta: 23.1, icon: PhoneIncoming },
    { label: 'Appointments Booked', value: appointmentsThisMonth(), delta: 15.7, icon: CalendarCheck },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Command Center"
        description="Live pulse across every campaign, lead, and dollar in the agency."
      >
        <Button variant="secondary" icon={UserPlus} onClick={() => navigate('/clients')}>
          Add Client
        </Button>
        <Button icon={Plus} onClick={() => navigate('/campaigns')}>
          New Campaign
        </Button>
      </PageHeader>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <KpiCard key={k.label} index={i} {...k} />
        ))}
      </div>

      {/* Charts */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2 animate-fade-in"
          title="Leads — Last 30 Days"
          subtitle="Inbound calls captured across all active campaigns"
          action={
            <div className="flex items-center gap-4 text-[12px]">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 rounded-[2px] bg-accent" /> Leads
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="h-2 w-2 rounded-[2px] bg-amber" /> Booked
              </span>
            </div>
          }
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gBooked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="date" {...axisProps} interval={4} minTickGap={20} />
                <YAxis {...axisProps} width={40} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="leads" name="Leads" stroke="#0066FF" strokeWidth={2.5} fill="url(#gLeads)" />
                <Area type="monotone" dataKey="booked" name="Booked" stroke="#F59E0B" strokeWidth={2} fill="url(#gBooked)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          className="animate-fade-in"
          title="Revenue by Campaign"
          subtitle="Lifetime billed value"
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revByCampaign} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid {...gridProps} horizontal={false} />
                <XAxis type="number" {...axisProps} tickFormatter={(v) => `$${v / 1000}k`} />
                <YAxis type="category" dataKey="name" {...axisProps} width={64} />
                <Tooltip
                  content={<ChartTooltip formatter={(v) => currency(v)} />}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]} barSize={18}>
                  {revByCampaign.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#0066FF' : 'rgba(0,102,255,0.45)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent leads */}
      <Card
        className="mt-5 animate-fade-in"
        title="Recent Leads"
        subtitle="Latest inbound calls, newest first"
        bodyClassName=""
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hair">
                {['Caller', 'Campaign', 'Score', 'Appt', 'Status', 'When'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left data-label">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map((l, i) => {
                const c = campaignById(l.campaign_id)
                return (
                  <tr
                    key={l.id}
                    onClick={() => navigate('/leads')}
                    className="cursor-pointer border-b border-hair/60 transition hover:bg-white/[0.025] last:border-0 animate-fade-in-fast"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={l.caller_name} size="sm" />
                        <div>
                          <p className="font-medium text-slate-100">{l.caller_name}</p>
                          <p className="text-[12px] text-slate-500">{phone(l.caller_number)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-200">{c?.name}</p>
                      <p className="text-[12px] text-slate-500">{NICHE_LABELS[c?.niche]}</p>
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={l.ai_disposition} /></td>
                    <td className="px-5 py-3">
                      {l.appointment_booked ? (
                        <Badge tone="green">Booked</Badge>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={l.status} dot={false} /></td>
                    <td className="px-5 py-3 text-[13px] text-slate-500">{relativeTime(l.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
