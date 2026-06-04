import { useState } from 'react'
import { LifeBuoy, Mail, Phone, Send, MessageSquare, Radio } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader.jsx'
import Card from '../../components/ui/Card.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { FormField, Input, Select, Textarea } from '../../components/ui/Field.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { api } from '../../lib/api.js'
import { usePortalData } from '../usePortalData.js'
import { NICHE_LABELS } from '../../data/mockData.js'

const TOPICS = ['Lead quality', 'Billing question', 'Pause / adjust a campaign', 'Add a new campaign', 'Something else']

export default function PortalSupport() {
  const data = usePortalData()
  const toast = useToast()
  const [topic, setTopic] = useState(TOPICS[0])
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  if (!data) return null
  const { client, campaigns } = data

  const send = async (e) => {
    e.preventDefault()
    if (!message.trim()) {
      toast('Please add a message.', { type: 'error' })
      return
    }
    setSending(true)
    await api.sendNotification({
      to: 'support@leadcommand.io',
      subject: `[Portal] ${topic} — ${client.business_name}`,
      text: message,
    })
    await new Promise((r) => setTimeout(r, 700))
    setSending(false)
    setMessage('')
    toast('Message sent. Your account manager will reply shortly.', { type: 'success', title: 'Sent' })
  }

  return (
    <>
      <PageHeader
        eyebrow="Help"
        title="Support"
        description="Questions about your leads, billing, or campaigns? We're one message away."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Send a message" subtitle="Your dedicated account manager typically replies within a few hours.">
            <form onSubmit={send} className="space-y-4">
              <FormField label="Topic">
                <Select value={topic} onChange={(e) => setTopic(e.target.value)}>
                  {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </Select>
              </FormField>
              <FormField label="Message">
                <Textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help…"
                />
              </FormField>
              <div className="flex justify-end">
                <Button type="submit" icon={Send} loading={sending}>Send message</Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Your account manager">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-[14px] font-semibold text-accent">CJ</span>
              <div>
                <p className="font-semibold text-white">CJ Howard</p>
                <p className="text-[12.5px] text-slate-500">FaHow Lead Group</p>
              </div>
            </div>
            <div className="mt-4 space-y-2.5 text-[13.5px]">
              <a href="mailto:cj@fahow.org" className="flex items-center gap-2.5 text-slate-300 transition hover:text-white">
                <Mail className="h-4 w-4 text-slate-500" /> cj@fahow.org
              </a>
              <a href="tel:+18005550100" className="flex items-center gap-2.5 text-slate-300 transition hover:text-white">
                <Phone className="h-4 w-4 text-slate-500" /> (800) 555-0100
              </a>
            </div>
          </Card>

          <Card title="Your campaigns" subtitle={`${campaigns.length} total`}>
            {campaigns.length ? (
              <div className="space-y-2">
                {campaigns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-hair bg-base-900/40 p-2.5">
                    <div className="flex items-center gap-2.5">
                      <Radio className="h-4 w-4 text-slate-500" />
                      <div>
                        <p className="text-[13px] font-medium text-white">{c.name}</p>
                        <p className="text-[11.5px] text-slate-500">{NICHE_LABELS[c.niche]}</p>
                      </div>
                    </div>
                    <Badge tone={c.status === 'active' ? 'green' : c.status === 'paused' ? 'red' : 'blue'} dot={false}>
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-slate-500">No campaigns yet.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}
