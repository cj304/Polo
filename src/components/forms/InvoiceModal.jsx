import { useState } from 'react'
import { CreditCard } from 'lucide-react'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { FormField, Input, Select } from '../ui/Field.jsx'
import { useToast } from '../ui/Toast.jsx'
import { clients } from '../../data/mockData.js'
import { currency } from '../../lib/format.js'

const TYPES = [
  { value: 'lead_sale', label: 'Lead Sale' },
  { value: 'monthly_rent', label: 'Monthly Rent' },
  { value: 'jv_payment', label: 'JV Payment' },
]

// Create-invoice flow. In live mode this POSTs to /api/stripe/invoices.
export default function InvoiceModal({ open, onClose, onSave }) {
  const toast = useToast()
  const [form, setForm] = useState({ client_id: '', type: 'monthly_rent', amount: '', description: '', due_date: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }))
  }

  const submit = async (e) => {
    e.preventDefault()
    const err = {}
    if (!form.client_id) err.client_id = 'Select a client'
    if (!form.amount || Number(form.amount) <= 0) err.amount = 'Enter an amount'
    if (!form.description.trim()) err.description = 'Add a description'
    setErrors(err)
    if (Object.keys(err).length) return

    setSaving(true)
    await new Promise((r) => setTimeout(r, 900)) // Stripe invoice create latency
    setSaving(false)
    const client = clients.find((c) => c.id === form.client_id)
    onSave?.({
      ...form,
      amount: Number(form.amount),
      client_id: form.client_id,
      stripe_invoice_id: `in_${Math.random().toString(36).slice(2, 10)}`,
    })
    toast(`Invoice sent to ${client?.business_name} for ${currency(Number(form.amount))}.`, {
      type: 'success',
      title: 'Stripe invoice created',
    })
    setForm({ client_id: '', type: 'monthly_rent', amount: '', description: '', due_date: '' })
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Invoice"
      subtitle="Generate a Stripe invoice and email it to the client."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button icon={CreditCard} onClick={submit} loading={saving}>Create & send</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Client" required error={errors.client_id}>
          <Select value={form.client_id} onChange={(e) => set('client_id', e.target.value)} error={errors.client_id}>
            <option value="">— Select client —</option>
            {clients.filter((c) => c.id !== 'cl_06').map((c) => (
              <option key={c.id} value={c.id}>{c.business_name}</option>
            ))}
          </Select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type" required>
            <Select value={form.type} onChange={(e) => set('type', e.target.value)}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </FormField>
          <FormField label="Amount ($)" required error={errors.amount}>
            <Input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="3500" error={errors.amount} />
          </FormField>
        </div>
        <FormField label="Description" required error={errors.description}>
          <Input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="October retainer — Miami Roof Repair" error={errors.description} />
        </FormField>
        <FormField label="Due date">
          <Input type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} />
        </FormField>
      </form>
    </Modal>
  )
}
