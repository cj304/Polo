import { useState, useEffect } from 'react'
import {
  Bot, Phone, PhoneCall, Sparkles, Pencil, BarChart3, Save, MapPin,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { StatusBadge } from '../components/ui/Badge.jsx'
import Card from '../components/ui/Card.jsx'
import Modal from '../components/ui/Modal.jsx'
import { FormField, Input, Textarea } from '../components/ui/Field.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { api } from '../lib/api.js'
import { campaigns, clientById, leadsForCampaign, NICHE_LABELS } from '../data/mockData.js'
import { buildAgentScript, buildGreeting } from '../lib/aiScripts.js'
import { phone } from '../lib/format.js'

export default function Agents() {
  const toast = useToast()
  const [editing, setEditing] = useState(null)
  const [testing, setTesting] = useState(null)

  // One assistant per campaign (mock parity with Telnyx assistants).
  const agents = campaigns.map((c) => {
    const client = clientById(c.client_id)
    const business = client && client.id !== 'cl_06' ? client.business_name : `${c.city} ${NICHE_LABELS[c.niche]}`
    const leads = leadsForCampaign(c.id)
    return {
      campaign: c,
      business,
      greeting: buildGreeting(c.niche, business),
      script: buildAgentScript(c.niche, business, c.city),
      active: c.status === 'active',
      callVolume: leads.length,
      booked: leads.filter((l) => l.appointment_booked).length,
    }
  })

  const runTestCall = async (agent) => {
    setTesting(agent.campaign.id)
    const res = await api.testCall(agent.campaign.id)
    await new Promise((r) => setTimeout(r, 1100))
    setTesting(null)
    toast(
      res.offline
        ? `Test call simulated for ${agent.campaign.name} (demo mode).`
        : `Test call placed via Telnyx for ${agent.campaign.name}.`,
      { type: 'success', title: 'Test call' },
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Automation"
        title="AI Agents"
        description="Telnyx voice assistants answering, qualifying, and booking on every line."
      >
        <Badge tone="green" className="px-3 py-1.5">
          {agents.filter((a) => a.active).length} of {agents.length} live
        </Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {agents.map((agent, i) => (
          <div key={agent.campaign.id} className="surface animate-fade-in p-5" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${agent.active ? 'border-ok/25 bg-ok/10 text-ok' : 'border-hair bg-white/[0.03] text-slate-500'}`}>
                  <Bot className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">{agent.campaign.name}</p>
                  <p className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <MapPin className="h-3 w-3" /> {agent.campaign.city} · {NICHE_LABELS[agent.campaign.niche]}
                  </p>
                </div>
              </div>
              <StatusBadge status={agent.active ? 'active' : 'inactive'} />
            </div>

            {/* Script preview */}
            <div className="mt-4 rounded-lg border border-hair bg-base-900/60 p-3.5">
              <p className="data-label mb-1.5 flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> Greeting</p>
              <p className="line-clamp-2 text-[13px] leading-relaxed text-slate-300">“{agent.greeting}”</p>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-hair rounded-lg border border-hair bg-base-900/40">
              <AgentStat icon={Phone} label="Number" value={phone(agent.campaign.telnyx_number)} mono />
              <AgentStat icon={PhoneCall} label="Calls" value={agent.callVolume} />
              <AgentStat icon={BarChart3} label="Booked" value={agent.booked} />
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              <Button variant="secondary" size="sm" icon={Pencil} onClick={() => setEditing(agent)}>Edit script</Button>
              <Button variant="ghost" size="sm" icon={PhoneCall} loading={testing === agent.campaign.id} onClick={() => runTestCall(agent)}>
                Test call
              </Button>
            </div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="surface"><EmptyState icon={Bot} title="No agents yet" message="Create a campaign to provision an AI voice agent." /></div>
      )}

      <EditAgentModal agent={editing} onClose={() => setEditing(null)} />
    </>
  )
}

function AgentStat({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-3 text-center">
      <Icon className="h-3.5 w-3.5 text-slate-500" />
      <p className={`font-semibold text-white ${mono ? 'font-mono text-[11.5px]' : 'text-[15px]'}`}>{value}</p>
      <p className="text-[10.5px] uppercase tracking-wide text-slate-600">{label}</p>
    </div>
  )
}

function EditAgentModal({ agent, onClose }) {
  const toast = useToast()
  const [greeting, setGreeting] = useState('')
  const [script, setScript] = useState('')
  const [saving, setSaving] = useState(false)

  // Hydrate the editor whenever a different agent is opened.
  useEffect(() => {
    if (agent) {
      setGreeting(agent.greeting)
      setScript(agent.script)
    }
  }, [agent])

  const close = () => onClose()

  const save = async () => {
    setSaving(true)
    await api.updateAssistant(agent.campaign.telnyx_assistant_id, { greeting, instructions: script })
    await new Promise((r) => setTimeout(r, 700))
    setSaving(false)
    toast(`${agent.campaign.name} agent updated.`, { type: 'success', title: 'Saved to Telnyx' })
    close()
  }

  if (!agent) return null

  return (
    <Modal
      open={!!agent}
      onClose={close}
      title={`Edit Agent — ${agent.campaign.name}`}
      subtitle={`${NICHE_LABELS[agent.campaign.niche]} · ${agent.business}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <Button icon={Save} onClick={save} loading={saving}>Save to Telnyx</Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Greeting" hint="First line the caller hears">
          <Textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={2} />
        </FormField>
        <FormField label="System prompt" hint="Full agent instructions">
          <Textarea value={script} onChange={(e) => setScript(e.target.value)} rows={12} className="font-mono text-[12.5px] leading-relaxed" />
        </FormField>
      </div>
    </Modal>
  )
}
