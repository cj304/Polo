import { useState } from 'react'
import {
  KeyRound, Phone, CreditCard, Mail, Bell, Building2, User, Save,
  Eye, EyeOff, CheckCircle2, AlertCircle,
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader.jsx'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Badge from '../components/ui/Badge.jsx'
import { FormField, Input, Textarea } from '../components/ui/Field.jsx'
import { useToast } from '../components/ui/Toast.jsx'

function SecretInput({ value, onChange, placeholder, configured }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10 font-mono text-[12.5px]"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

function IntegrationCard({ icon: Icon, name, description, keyName, value, onChange, connected }) {
  return (
    <div className="rounded-xl border border-hair bg-base-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-hair bg-white/[0.03] text-slate-300">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="font-semibold text-white">{name}</p>
            <p className="text-[12px] text-slate-500">{description}</p>
          </div>
        </div>
        {connected ? (
          <Badge tone="green" dot={false}><CheckCircle2 className="h-3 w-3" /> Connected</Badge>
        ) : (
          <Badge tone="amber" dot={false}><AlertCircle className="h-3 w-3" /> Not set</Badge>
        )}
      </div>
      <FormField label={keyName}>
        <SecretInput value={value} onChange={onChange} placeholder={`Enter your ${name} key…`} />
      </FormField>
    </div>
  )
}

export default function Settings() {
  const toast = useToast()
  const [keys, setKeys] = useState({ telnyx: '', stripe: '', resend: '' })
  const [business, setBusiness] = useState({
    name: 'FaHow Lead Group',
    phone: '+1 800 555 0100',
    address: '500 Brickell Ave, Miami, FL',
    greeting: 'Thanks for calling — how can we help you today?',
  })
  const [notify, setNotify] = useState({ newLead: true, hotLead: true, booking: true, invoicePaid: true, dailyDigest: false })
  const [saving, setSaving] = useState(false)

  const save = async (section) => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast(`${section} saved.`, { type: 'success' })
  }

  return (
    <>
      <PageHeader eyebrow="Configuration" title="Settings" description="API keys, notifications, and business identity used across the platform." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* API Keys */}
          <Card title="API Keys" subtitle="Credentials are stored server-side and never exposed to the browser." action={<KeyRound className="h-4 w-4 text-slate-500" />}>
            <div className="space-y-3">
              <IntegrationCard icon={Phone} name="Telnyx" description="Phone numbers, call tracking, AI voice agents" keyName="TELNYX_API_KEY" value={keys.telnyx} onChange={(v) => setKeys((k) => ({ ...k, telnyx: v }))} connected={keys.telnyx.length > 8} />
              <IntegrationCard icon={CreditCard} name="Stripe" description="Invoicing and payments" keyName="STRIPE_SECRET_KEY" value={keys.stripe} onChange={(v) => setKeys((k) => ({ ...k, stripe: v }))} connected={keys.stripe.length > 8} />
              <IntegrationCard icon={Mail} name="Resend" description="Email notifications" keyName="RESEND_API_KEY" value={keys.resend} onChange={(v) => setKeys((k) => ({ ...k, resend: v }))} connected={keys.resend.length > 8} />
            </div>
            <div className="mt-4 flex justify-end">
              <Button icon={Save} loading={saving} onClick={() => save('API keys')}>Save keys</Button>
            </div>
          </Card>

          {/* Business info */}
          <Card title="Business Information" subtitle="Used in AI agent greetings and outbound email." action={<Building2 className="h-4 w-4 text-slate-500" />}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Agency name"><Input value={business.name} onChange={(e) => setBusiness((b) => ({ ...b, name: e.target.value }))} /></FormField>
              <FormField label="Main phone"><Input value={business.phone} onChange={(e) => setBusiness((b) => ({ ...b, phone: e.target.value }))} /></FormField>
              <div className="sm:col-span-2"><FormField label="Address"><Input value={business.address} onChange={(e) => setBusiness((b) => ({ ...b, address: e.target.value }))} /></FormField></div>
              <div className="sm:col-span-2"><FormField label="Default agent greeting" hint="Fallback when a campaign has no custom greeting"><Textarea rows={2} value={business.greeting} onChange={(e) => setBusiness((b) => ({ ...b, greeting: e.target.value }))} /></FormField></div>
            </div>
            <div className="mt-4 flex justify-end"><Button icon={Save} loading={saving} onClick={() => save('Business info')}>Save</Button></div>
          </Card>
        </div>

        <div className="space-y-5">
          {/* Notifications */}
          <Card title="Notifications" subtitle="When should we ping you?" action={<Bell className="h-4 w-4 text-slate-500" />}>
            <div className="space-y-1">
              <Toggle label="New lead captured" checked={notify.newLead} onChange={(v) => setNotify((n) => ({ ...n, newLead: v }))} />
              <Toggle label="Hot lead alert" checked={notify.hotLead} onChange={(v) => setNotify((n) => ({ ...n, hotLead: v }))} />
              <Toggle label="Appointment booked" checked={notify.booking} onChange={(v) => setNotify((n) => ({ ...n, booking: v }))} />
              <Toggle label="Invoice paid" checked={notify.invoicePaid} onChange={(v) => setNotify((n) => ({ ...n, invoicePaid: v }))} />
              <Toggle label="Daily digest email" checked={notify.dailyDigest} onChange={(v) => setNotify((n) => ({ ...n, dailyDigest: v }))} />
            </div>
            <div className="mt-4 flex justify-end"><Button variant="secondary" size="sm" icon={Save} onClick={() => save('Notification preferences')}>Save</Button></div>
          </Card>

          {/* Account */}
          <Card title="Account" subtitle="Your operator profile" action={<User className="h-4 w-4 text-slate-500" />}>
            <div className="space-y-4">
              <FormField label="Name"><Input defaultValue="CJ Howard" /></FormField>
              <FormField label="Email"><Input defaultValue="cj@fahow.org" /></FormField>
              <Button variant="secondary" size="sm" className="w-full" icon={Save} onClick={() => save('Account')}>Update profile</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg px-1 py-2.5 transition hover:bg-white/[0.02]">
      <span className="text-[13.5px] text-slate-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? 'left-[18px]' : 'left-0.5'}`} />
      </button>
    </label>
  )
}
