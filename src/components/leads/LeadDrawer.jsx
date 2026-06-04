import { useState } from 'react'
import { Phone, Calendar, MapPin, FileText, CreditCard, Volume2 } from 'lucide-react'
import Drawer from '../ui/Drawer.jsx'
import Button from '../ui/Button.jsx'
import { StatusBadge } from '../ui/Badge.jsx'
import Avatar from '../ui/Avatar.jsx'
import { Select } from '../ui/Field.jsx'
import { useToast } from '../ui/Toast.jsx'
import RecordingPlayer from './RecordingPlayer.jsx'
import Transcript from './Transcript.jsx'
import { campaignById, clientById, NICHE_LABELS } from '../../data/mockData.js'
import { phone, duration, dateTime, currency } from '../../lib/format.js'

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
        <Transcript text={lead.transcript} />
      </div>
    </Drawer>
  )
}
