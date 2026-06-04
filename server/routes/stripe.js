// Stripe invoicing routes.
import express from 'express'
import { createInvoice } from '../lib/stripe.js'
import { invoiceEmail, resendConfigured } from '../lib/resend.js'

const router = express.Router()

// POST /api/stripe/invoices
// { stripeCustomerId, amount, description, clientEmail, businessName }
router.post('/invoices', async (req, res) => {
  const { stripeCustomerId, amount, description, clientEmail, businessName } = req.body
  if (!amount) return res.status(400).json({ ok: false, error: 'amount is required' })

  try {
    const invoice = await createInvoice({ stripeCustomerId, amount, description })

    // Notify the client by email when we have an address + Resend.
    if (resendConfigured && clientEmail) {
      invoiceEmail({ to: clientEmail, businessName, amount, url: invoice.hosted_invoice_url }).catch(() => {})
    }

    res.json({ ok: true, ...invoice })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

export default router
