import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import {
  PhoneIncoming, CalendarCheck, Radio, Receipt, ArrowRight, CalendarClock,
} from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import KpiCard from '../../components/ui/KpiCard.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge, { StatusBadge } from '../../components/ui/Badge.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import ChartTooltip, { axisProps, gridProps } from '../../components/ui/ChartTooltip.jsx'
import { usePortalData } from '../usePortalData.js'
import { campaignById, NICHE_LABELS } from '../../data/mockData.js'
import { currency, phone, relativeTime, dateTime } from '../../lib/format.js'

export default function PortalDashboard() {
  const navigate = useNavigate()
  const data = usePortalData()
  if (!data) return null

  const { client, leadsThisMonth, bookedCount, activeCampaigns, amountDue, leadSeries, leads, appointments } = data
  const recent = leads.slice(0, 6)
  const upcoming = appointments.filter((a) => new Date(a.appointment_datetime) >= new Date()).slice(0, 4)

  const firstName = client.name?.split(' ')[0] || 'there'

  return (
    <>
      <PageHeader
        eyebrow={`Welcome back, ${firstName}`}
        title="Your dashboard"
        description="A live view of the leads we're capturing and booking for your business."
      >
        <Button variant="secondary" icon={Receipt} onClick={() => navigate('/portal/billing')}>Billing</Button>
        <Button icon={PhoneIncoming} onClick={() => navigate('/portal/leads')}>View leads</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard index={0} label="Leads This Month" value={leadsThisMonth.length} icon={PhoneIncoming} accent />
        <KpiCard index={1} label="Appointments Booked" value={bookedCount} icon={CalendarCheck} />
        <KpiCard index={2} label="Active Campaigns" value={activeCampaigns.length} icon={Radio} />
        <KpiCard index={3} label="Amount Due" value={currency(amountDue, { compact: true })} icon={Receipt} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          className="lg:col-span-2 animate-fade-in"
          title="Your Leads — Last 30 Days"
          subtitle="Inbound calls captured for your campaigns"
          action={
            <div className="flex items-center gap-4 text-[12px]">
              <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-[2px] bg-accent" /> Leads</span>
              <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-[2px] bg-amber" /> Booked</span>
            </div>
          }
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadSeries} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="pLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066FF" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#0066FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pBooked" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="date" {...axisProps} interval={4} minTickGap={20} />
                <YAxis {...axisProps} width={32} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Area type="monotone" dataKey="leads" name="Leads" stroke="#0066FF" strokeWidth={2.5} fill="url(#pLeads)" />
                <Area type="monotone" dataKey="booked" name="Booked" stroke="#F59E0B" strokeWidth={2} fill="url(#pBooked)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="animate-fade-in" title="Upcoming Appointments" subtitle="Booked by your AI agent"
          action={<Button variant="ghost" size="sm" onClick={() => navigate('/portal/appointments')}>All <ArrowRight className="h-3.5 w-3.5" /></Button>}
        >
          {upcoming.length ? (
            <div className="space-y-2.5">
              {upcoming.map((a) => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-hair bg-base-900/40 p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-white">{a.caller_name}</p>
                    <p className="text-[12px] text-slate-500">{dateTime(a.appointment_datetime)}</p>
                  </div>
                  <StatusBadge status={a.ai_disposition} dot={false} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={CalendarClock} title="No upcoming appointments" message="New bookings will appear here." />
          )}
        </Card>
      </div>

      <Card
        className="mt-5 animate-fade-in"
        title="Recent Leads"
        subtitle="Latest calls captured for your business"
        bodyClassName=""
        action={<Button variant="ghost" size="sm" onClick={() => navigate('/portal/leads')}>View all <ArrowRight className="h-3.5 w-3.5" /></Button>}
      >
        {recent.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-hair">
                  {['Caller', 'Campaign', 'Score', 'Appt', 'When'].map((h) => (
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
                      onClick={() => navigate('/portal/leads')}
                      className="cursor-pointer border-b border-hair/60 transition hover:bg-white/[0.025] last:border-0 animate-fade-in-fast"
                      style={{ animationDelay: `${i * 25}ms` }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={l.caller_name} size="sm" />
                          <div>
                            <p className="font-medium text-slate-100">{l.caller_name}</p>
                            <p className="font-mono text-[12px] text-slate-500">{phone(l.caller_number)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-300">{c?.name}<span className="block text-[12px] text-slate-500">{NICHE_LABELS[c?.niche]}</span></td>
                      <td className="px-5 py-3"><StatusBadge status={l.ai_disposition} /></td>
                      <td className="px-5 py-3">{l.appointment_booked ? <Badge tone="green">Booked</Badge> : <span className="text-slate-600">—</span>}</td>
                      <td className="px-5 py-3 text-[13px] text-slate-500">{relativeTime(l.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon={PhoneIncoming} title="No leads yet" message="As soon as a call comes in, it will show up here." />
        )}
      </Card>
    </>
  )
}
