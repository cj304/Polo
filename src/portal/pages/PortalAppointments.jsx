import { useState, useMemo } from 'react'
import { CalendarClock, CalendarCheck, Phone, ChevronRight, CheckCircle2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import KpiCard from '../../components/ui/KpiCard.jsx'
import Badge, { StatusBadge } from '../../components/ui/Badge.jsx'
import Avatar from '../../components/ui/Avatar.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { usePortalData } from '../usePortalData.js'
import { campaignById, NICHE_LABELS } from '../../data/mockData.js'
import { phone, dateTime } from '../../lib/format.js'

// Group appointments into Upcoming vs Past, sorted chronologically.
function splitAppointments(appointments) {
  const now = Date.now()
  const upcoming = []
  const past = []
  appointments.forEach((a) => {
    if (new Date(a.appointment_datetime).getTime() >= now) upcoming.push(a)
    else past.push(a)
  })
  upcoming.sort((x, y) => new Date(x.appointment_datetime) - new Date(y.appointment_datetime))
  past.sort((x, y) => new Date(y.appointment_datetime) - new Date(x.appointment_datetime))
  return { upcoming, past }
}

function dayLabel(dt) {
  const d = new Date(dt)
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 86400000)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function AppointmentRow({ appt }) {
  const c = campaignById(appt.campaign_id)
  const d = new Date(appt.appointment_datetime)
  return (
    <div className="flex items-center gap-4 rounded-xl border border-hair bg-base-900/40 p-3.5 transition hover:border-hair-strong">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
        <span className="text-[10px] font-semibold uppercase leading-none">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
        <span className="text-[17px] font-bold leading-tight">{d.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <Avatar name={appt.caller_name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-white">{appt.caller_name}</p>
            <p className="truncate text-[12px] text-slate-500">{c?.name} · {NICHE_LABELS[c?.niche]}</p>
          </div>
        </div>
      </div>
      <div className="hidden items-center gap-1.5 text-[13px] text-slate-400 sm:flex">
        <Phone className="h-3.5 w-3.5" /> <span className="font-mono">{phone(appt.caller_number)}</span>
      </div>
      <div className="text-right">
        <p className="text-[13px] font-semibold text-white">{d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
        <StatusBadge status={appt.ai_disposition} dot={false} />
      </div>
    </div>
  )
}

export default function PortalAppointments() {
  const data = usePortalData()
  const [view, setView] = useState('upcoming')
  if (!data) return null

  const { appointments } = data
  const { upcoming, past } = useMemo(() => splitAppointments(appointments), [appointments])
  const list = view === 'upcoming' ? upcoming : past

  // Group the active list by day for a calendar-ish feel.
  const grouped = useMemo(() => {
    const map = new Map()
    list.forEach((a) => {
      const key = dayLabel(a.appointment_datetime)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(a)
    })
    return [...map.entries()]
  }, [list])

  return (
    <>
      <PageHeader
        eyebrow="Calendar"
        title="Appointments"
        description="Every appointment your AI agent booked, ready for your team to service."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard index={0} label="Upcoming" value={upcoming.length} icon={CalendarClock} accent />
        <KpiCard index={1} label="Total Booked" value={appointments.length} icon={CalendarCheck} />
        <KpiCard index={2} label="Completed" value={past.length} icon={CheckCircle2} />
      </div>

      <div className="mt-6 mb-4 inline-flex items-center rounded-lg border border-hair-strong bg-base-850 p-0.5">
        {[['upcoming', `Upcoming (${upcoming.length})`], ['past', `Past (${past.length})`]].map(([v, label]) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition ${view === v ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {grouped.length ? (
        <div className="space-y-6">
          {grouped.map(([day, items]) => (
            <div key={day} className="animate-fade-in">
              <div className="mb-2.5 flex items-center gap-3">
                <h3 className="text-[13px] font-semibold text-slate-300">{day}</h3>
                <span className="h-px flex-1 bg-hair" />
                <Badge tone="slate" dot={false}>{items.length}</Badge>
              </div>
              <div className="space-y-2.5">
                {items.map((a) => <AppointmentRow key={a.id} appt={a} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={CalendarClock}
            title={view === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
            message="When your AI agent books an appointment, it will show up here."
          />
        </Card>
      )}
    </>
  )
}
