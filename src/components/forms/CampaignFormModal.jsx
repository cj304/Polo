import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { FormField, Input, Select } from '../ui/Field.jsx'
import { useToast } from '../ui/Toast.jsx'
import { NICHES, NICHE_LABELS } from '../../lib/aiScripts.js'
import { clients } from '../../data/mockData.js'
import { DEAL_TYPE_LABELS } from '../../lib/format.js'

const EMPTY = {
  name: '',
  niche: 'roofing',
  city: '',
  state: '',
  deal_type: 'rent',
  client_id: '',
  monthly_value: '',
  per_lead_rate: '',
  jv_percentage: '',
  area_code: '',
}

// New / edit campaign form. Validates inline, shows loading + success toast.
export default function CampaignFormModal({ open, onClose, onSave, initial }) {
  const toast = useToast()
  const [form, setForm] = useState(initial || EMPTY)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Campaign name is required'
    if (!form.city.trim()) e.city = 'City is required'
    if (!form.state.trim()) e.state = 'State is required'
    if (form.deal_type === 'rent' && !form.monthly_value) e.monthly_value = 'Set a monthly value'
    if (form.deal_type === 'sell' && !form.per_lead_rate) e.per_lead_rate = 'Set a per-lead rate'
    if (form.deal_type === 'jv' && !form.jv_percentage) e.jv_percentage = 'Set a JV percentage'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    // Simulate provisioning latency (Telnyx number search + assistant create).
    await new Promise((r) => setTimeout(r, 900))
    setSaving(false)
    onSave?.(form)
    toast(`${form.name} created and number provisioned.`, {
      type: 'success',
      title: 'Campaign live',
    })
    setForm(EMPTY)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Campaign' : 'New Campaign'}
      subtitle="Provision a tracking number and AI voice agent for a niche."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>
            {initial ? 'Save changes' : 'Create campaign'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField label="Campaign name" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Miami Roof Repair"
              error={errors.name}
            />
          </FormField>
        </div>

        <FormField label="Niche" required>
          <Select value={form.niche} onChange={(e) => set('niche', e.target.value)}>
            {NICHES.map((n) => (
              <option key={n} value={n}>{NICHE_LABELS[n]}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="Assign client" hint="Optional">
          <Select value={form.client_id} onChange={(e) => set('client_id', e.target.value)}>
            <option value="">— Unassigned —</option>
            {clients.filter((c) => c.id !== 'cl_06').map((c) => (
              <option key={c.id} value={c.id}>{c.business_name}</option>
            ))}
          </Select>
        </FormField>

        <FormField label="City" required error={errors.city}>
          <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Miami" error={errors.city} />
        </FormField>

        <FormField label="State" required error={errors.state}>
          <Input
            value={form.state}
            onChange={(e) => set('state', e.target.value.toUpperCase().slice(0, 2))}
            placeholder="FL"
            error={errors.state}
          />
        </FormField>

        <FormField label="Deal type" required>
          <Select value={form.deal_type} onChange={(e) => set('deal_type', e.target.value)}>
            {Object.entries(DEAL_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormField>

        {form.deal_type === 'rent' && (
          <FormField label="Monthly value ($)" required error={errors.monthly_value}>
            <Input type="number" value={form.monthly_value} onChange={(e) => set('monthly_value', e.target.value)} placeholder="3500" error={errors.monthly_value} />
          </FormField>
        )}
        {form.deal_type === 'sell' && (
          <FormField label="Per-lead rate ($)" required error={errors.per_lead_rate}>
            <Input type="number" value={form.per_lead_rate} onChange={(e) => set('per_lead_rate', e.target.value)} placeholder="185" error={errors.per_lead_rate} />
          </FormField>
        )}
        {form.deal_type === 'jv' && (
          <FormField label="JV profit share (%)" required error={errors.jv_percentage}>
            <Input type="number" value={form.jv_percentage} onChange={(e) => set('jv_percentage', e.target.value)} placeholder="50" error={errors.jv_percentage} />
          </FormField>
        )}

        <div className="sm:col-span-2">
          <FormField label="Phone number area code" hint="We'll provision a local Telnyx number">
            <Input
              value={form.area_code}
              onChange={(e) => set('area_code', e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="305"
            />
          </FormField>
        </div>
      </form>
    </Modal>
  )
}
