import { useState, useRef } from 'react'
import {
  Play,
  Pause,
  Phone,
  Calendar,
  MapPin,
  FileText,
  CreditCard,
  Volume2,
} from 'lucide-react'
import Drawer from '../ui/Drawer.jsx'
import Button from '../ui/Button.jsx'
import Badge, { StatusBadge } from '../ui/Badge.jsx'
import Avatar from '../ui/Avatar.jsx'
import { Select } from '../ui/Field.jsx'
import { useToast } from '../ui/Toast.jsx'
import { campaignById, clientById, NICHE_LABELS } from '../../data/mockData.js'
import { phone, duration, dateTime, currency } from '../../lib/format.js'

// Faux audio player — visualizes a recording without a real file.
function RecordingPlayer({ seconds }) {
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const timer = useRef(null)

  const toggle = () => {
    if (playing) {
      clearInterval(timer.current)
      setPlaying(false)
    } else {
      setPlaying(true)
      timer.current = setInterval(() => {
        setT((cur) => {
          if (cur >= seconds) {
            clearInterval(timer.current)
            setPlaying(false)
            return 0
          }
          return cur + 1
        })
      }, 120)
    }
  }

  const pct = Math.min(100, (t / seconds) * 100)
  // Static waveform bars.
  const bars = Array.from({ length: 48 }, (_, i) => 20 + ((i * 37) % 70))

  return (
    <div className="surface-muted flex items-center gap-3 p-3">
      <button
        onClick={toggle}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-hover"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex h-9 items-center gap-[2px] overflow-hidden">
          {bars.map((h, i) => {
            const active = (i / bars.length) * 100 <= pct
            return (
              <span
                key={i}
                className={`w-[3px] shrink-0 rounded-full transition-colors ${active ? 'bg-accent' : 'bg-white/15'}`}
                style={{ height: `${h}%` }}
              />
            )
          })}
        </div>
      </div>
      <span className="shrink-0 font-mono text-[12px] tabular-nums text-slate-400">
        {duration(t)} / {duration(seconds)}
      </span>
    </div>
  )
}

function InfoRow({ icon: Icon, label, children }) {
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

export default function LeadDrawer({ lead, open, onClose, onUpdate }) {
  const toast = useToast()
  const [status, setStatus] = useState(lead?.status || 'new')
  const [billing, setBilling] = useState(false)

  if (!lead) return null
  const campaign = campaignById(lead.campaign_id)
  const client = clientById(lead.client_id)

  const saveStatus = (val) => {
    setStatus(val)
    onUpdate?.({ ...lead, status: val })
    toast(`Lead marked ${val}.`, { type: 'success' })
  }

  const billLead = async () => {
    setBilling(true)
    await new Promise((r) => setTimeout(r, 800))
    setBilling(false)
    saveStatus('billed')
    toast(`Invoice drafted in Stripe for ${client?.business_name || 'client'}.`, {
      type: 'success',
      title: 'Lead billed',
    })
  }

  const rate = campaign?.per_lead_rate

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
          <Button
            icon={CreditCard}
            onClick={billLead}
            loading={billing}
            disabled={status === 'billed' || campaign?.deal_type !== 'sell'}
          >
            {status === 'billed' ? 'Billed' : `Bill this lead${rate ? ` · ${currency(rate)}` : ''}`}
          </Button>
        </>
      }
    >
      {/* Caller summary */}
      <div className="flex items-center gap-3 rounded-xl border border-hair bg-base-800 p-4">
        <Avatar name={lead.caller_name} size="lg" accent />
        <div className="min-w-0">
          <p className="text-base font-semibold text-white">{lead.caller_name}</p>
          <p className="text-[13px] text-slate-400">
            {campaign?.name} · {NICHE_LABELS[campaign?.niche]}
          </p>
        </div>
      </div>

      {/* Recording */}
      <div className="mt-5">
        <p className="data-label mb-2 flex items-center gap-1.5">
          <Volume2 className="h-3.5 w-3.5" /> Call Recording
        </p>
        <RecordingPlayer seconds={lead.call_duration} />
      </div>

      {/* Facts */}
      <div className="mt-5 divide-y divide-hair">
        <InfoRow icon={Phone} label="Caller">
          <span className="font-mono">{phone(lead.caller_number)}</span> · {duration(lead.call_duration)} call
        </InfoRow>
        <InfoRow icon={Calendar} label="Received">
          {dateTime(lead.created_at)}
        </InfoRow>
        {lead.appointment_booked && (
          <InfoRow icon={MapPin} label="Appointment Booked">
            <span className="text-ok">{dateTime(lead.appointment_datetime)}</span>
          </InfoRow>
        )}
      </div>

      {/* Status control */}
      <div className="mt-5 rounded-xl border border-hair bg-base-800 p-4">
        <p className="data-label mb-2">Lead Status</p>
        <Select value={status} onChange={(e) => saveStatus(e.target.value)}>
          <option value="new">New</option>
          <option value="qualified">Qualified</option>
          <option value="billed">Billed</option>
          <option value="invalid">Invalid</option>
        </Select>
      </div>

      {/* Transcript */}
      <div className="mt-5">
        <p className="data-label mb-2 flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" /> AI Transcript
        </p>
        <div className="surface-muted max-h-72 space-y-2.5 overflow-y-auto p-4">
          {lead.transcript.split('\n').map((line, i) => {
            const isAgent = line.startsWith('Agent:')
            const [, text] = line.split(/^(Agent:|Caller:)/).slice(1)
            return (
              <div key={i} className={`flex ${isAgent ? '' : 'justify-end'}`}>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-snug ${
                    isAgent
                      ? 'bg-white/[0.04] text-slate-200'
                      : 'bg-accent/10 text-slate-100'
                  }`}
                >
                  <span className={`mb-0.5 block text-[10px] font-semibold uppercase tracking-wide ${isAgent ? 'text-slate-500' : 'text-accent'}`}>
                    {isAgent ? 'AI Agent' : 'Caller'}
                  </span>
                  {text?.trim()}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Drawer>
  )
}
