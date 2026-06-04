import { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { FormField, Input, Select, Textarea } from '../ui/Field.jsx'
import { useToast } from '../ui/Toast.jsx'
import { DEAL_TYPE_LABELS } from '../../lib/format.js'

const EMPTY = {
  name: '',
  business_name: '',
  email: '',
  phone: '',
  deal_type: 'rent',
  contract_start: '',
  contract_renewal: '',
  notes: '',
}

export default function ClientFormModal({ open, onClose, onSave, initial }) {
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
    if (!form.name.trim()) e.name = 'Contact name is required'
    if (!form.business_name.trim()) e.business_name = 'Business name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    setSaving(false)
    onSave?.(form)
    toast(`${form.business_name} added. Stripe customer created.`, {
      type: 'success',
      title: 'Client onboarded',
    })
    setForm(EMPTY)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Edit Client' : 'Add Client'}
      subtitle="Onboard a client and link them to campaigns and billing."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>{initial ? 'Save changes' : 'Add client'}</Button>
        </>
      }
    >
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Business name" required error={errors.business_name}>
          <Input value={form.business_name} onChange={(e) => set('business_name', e.target.value)} placeholder="Summit Peak Roofing" error={errors.business_name} />
        </FormField>
        <FormField label="Contact name" required error={errors.name}>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Marcus Reyes" error={errors.name} />
        </FormField>
        <FormField label="Email" required error={errors.email}>
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="marcus@business.com" error={errors.email} />
        </FormField>
        <FormField label="Phone">
          <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1 305 555 0142" />
        </FormField>
        <FormField label="Deal type" required>
          <Select value={form.deal_type} onChange={(e) => set('deal_type', e.target.value)}>
            {Object.entries(DEAL_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Contract start">
            <Input type="date" value={form.contract_start?.slice(0, 10) || ''} onChange={(e) => set('contract_start', e.target.value)} />
          </FormField>
          <FormField label="Renewal">
            <Input type="date" value={form.contract_renewal?.slice(0, 10) || ''} onChange={(e) => set('contract_renewal', e.target.value)} />
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <FormField label="Notes">
            <Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Internal notes about this relationship…" rows={3} />
          </FormField>
        </div>
      </form>
    </Modal>
  )
}
