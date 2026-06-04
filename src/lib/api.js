// Thin client wrapper around the LeadCommand backend API (Express, /server).
// Every method degrades gracefully when the backend isn't running so the
// UI stays fully demonstrable on mock data.

async function call(path, { method = 'GET', body } = {}) {
  try {
    const res = await fetch(`/api${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`)
    return json
  } catch (err) {
    // Surface a typed result the UI can branch on without try/catch noise.
    return { ok: false, offline: true, error: err.message }
  }
}

export const api = {
  // ── Telnyx number provisioning ───────────────────────────
  searchNumbers: (areaCode) => call(`/telnyx/numbers/search?area_code=${areaCode}`),
  buyNumber: (phoneNumber, campaignId) =>
    call('/telnyx/numbers/buy', { method: 'POST', body: { phoneNumber, campaignId } }),

  // ── Telnyx AI assistants ─────────────────────────────────
  createAssistant: (payload) =>
    call('/telnyx/assistants', { method: 'POST', body: payload }),
  updateAssistant: (id, payload) =>
    call(`/telnyx/assistants/${id}`, { method: 'PATCH', body: payload }),
  testCall: (campaignId, toNumber) =>
    call('/telnyx/assistants/test-call', {
      method: 'POST',
      body: { campaignId, toNumber },
    }),

  // ── Stripe invoicing ─────────────────────────────────────
  createInvoice: (payload) => call('/stripe/invoices', { method: 'POST', body: payload }),

  // ── Resend notifications ─────────────────────────────────
  sendNotification: (payload) =>
    call('/notifications/send', { method: 'POST', body: payload }),
}
