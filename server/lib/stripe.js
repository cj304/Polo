// ─────────────────────────────────────────────────────────────
// Stripe client (server-side) — implemented against the REST API with
// fetch so there's no SDK dependency. Mocks cleanly without a key.
// ─────────────────────────────────────────────────────────────

const API = 'https://api.stripe.com/v1'
const KEY = process.env.STRIPE_SECRET_KEY

export const stripeConfigured = Boolean(KEY)

// Stripe expects application/x-www-form-urlencoded with bracket notation.
function encode(obj, prefix) {
  const parts = []
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (typeof v === 'object') parts.push(encode(v, key))
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
  }
  return parts.join('&')
}

async function stripe(path, { method = 'POST', body } = {}) {
  if (!stripeConfigured) throw new Error('STRIPE_SECRET_KEY not configured')
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body ? encode(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Stripe ${path} failed: ${json.error?.message || res.statusText}`)
  return json
}

/**
 * Create a one-off invoice for a client and finalize/send it.
 * Mirrors the flow: invoice item → invoice → finalize → send.
 */
export async function createInvoice({ stripeCustomerId, amount, description, dueDays = 14 }) {
  if (!stripeConfigured) {
    return {
      mock: true,
      id: `in_mock_${Math.random().toString(36).slice(2, 10)}`,
      amount_due: Math.round(amount * 100),
      hosted_invoice_url: 'https://invoice.stripe.com/mock',
      status: 'open',
    }
  }

  // 1. Pending invoice item on the customer.
  await stripe('/invoiceitems', {
    body: {
      customer: stripeCustomerId,
      amount: Math.round(amount * 100),
      currency: 'usd',
      description,
    },
  })

  // 2. Draft invoice that collects pending items.
  const invoice = await stripe('/invoices', {
    body: {
      customer: stripeCustomerId,
      collection_method: 'send_invoice',
      days_until_due: dueDays,
      description,
    },
  })

  // 3. Finalize + send.
  await stripe(`/invoices/${invoice.id}/finalize`)
  const sent = await stripe(`/invoices/${invoice.id}/send`)
  return { mock: false, id: sent.id, amount_due: sent.amount_due, hosted_invoice_url: sent.hosted_invoice_url, status: sent.status }
}

/** Create a Stripe customer when onboarding a client. */
export async function createCustomer({ name, email, businessName }) {
  if (!stripeConfigured) return { mock: true, id: `cus_mock_${Date.now()}` }
  const cust = await stripe('/customers', { body: { name: businessName || name, email, description: name } })
  return { mock: false, id: cust.id }
}
