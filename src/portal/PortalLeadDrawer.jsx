import { Phone, Calendar, MapPin, FileText, Volume2, CalendarClock } from 'lucide-react'
import Drawer from '../components/ui/Drawer.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { StatusBadge } from '../components/ui/Badge.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import RecordingPlayer from '../components/leads/RecordingPlayer.jsx'
import Transcript from '../components/leads/Transcript.jsx'
import { campaignById, NICHE_LABELS } from '../data/mockData.js'
import { phone, duration, dateTime } from '../lib/format.js'

// Client-side pipeline a client manages for their own leads.
export const CLIENT_STAGES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]
const STAGE_TONE = { new: 'blue', contacted: 'amber', won: 'green', lost: 'slate' }

// Client-facing lead detail. No internal billing/economics — clients manage
// their own follow-up pipeline and review the call + transcript.
export default function PortalLeadDrawer({ lead, open, onClose, stage, onStage }) {
  if (!lead) return null
  const campaign = campaignById(lead.campaign_id)

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={lead.caller_name}
      subtitle={phone(lead.caller_number)}
      badge={<StatusBadge status={lead.ai_disposition} />}
      width="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button icon={Phone} onClick={() => { window.location.href = `tel:${lead.caller_number}` }}>
            Call back
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3 rounded-xl border border-hair bg-base-800 p-4">
        <Avatar name={lead.caller_name} size="lg" accent />
        <div className="min-w-0">
          <p className="text-base font-semibold text-white">{lead.caller_name}</p>
          <p className="text-[13px] text-slate-400">{campaign?.name} · {NICHE_LABELS[campaign?.niche]}</p>
        </div>
      </div>

      <div className="mt-5">
        <p className="data-label mb-2 flex items-center gap-1.5"><Volume2 className="h-3.5 w-3.5" /> Call Recording</p>
        <RecordingPlayer seconds={lead.call_duration} />
      </div>

      <div className="mt-5 divide-y divide-hair">
        <Row icon={Phone} label="Caller">
          <span className="font-mono">{phone(lead.caller_number)}</span> · {duration(lead.call_duration)} call
        </Row>
        <Row icon={Calendar} label="Received">{dateTime(lead.created_at)}</Row>
        {lead.appointment_booked && (
          <Row icon={CalendarClock} label="Appointment Booked">
            <span className="text-ok">{dateTime(lead.appointment_datetime)}</span>
          </Row>
        )}
      </div>

      {/* Client pipeline */}
      <div className="mt-5 rounded-xl border border-hair bg-base-800 p-4">
        <p className="data-label mb-2.5">Your follow-up status</p>
        <div className="flex flex-wrap gap-2">
          {CLIENT_STAGES.map((s) => {
            const active = (stage || 'new') === s.value
            return (
              <button
                key={s.value}
                onClick={() => onStage?.(lead.id, s.value)}
                className={`rounded-lg border px-3 py-1.5 text-[13px] font-semibold transition ${
                  active
                    ? 'border-accent/50 bg-accent/15 text-white'
                    : 'border-hair-strong text-slate-400 hover:border-hair-strong hover:text-slate-200'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5">
        <p className="data-label mb-2 flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Call Transcript</p>
        <Transcript text={lead.transcript} />
      </div>
    </Drawer>
  )
}

export { STAGE_TONE }

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <div className="mt-0.5 text-[14px] text-slate-200">{children}</div>
      </div>
    </div>
  )
}
