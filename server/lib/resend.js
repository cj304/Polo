// ─────────────────────────────────────────────────────────────
// Resend email client (server-side). Sends operator + client
// notifications. No-ops (logs) when RESEND_API_KEY is absent.
// ─────────────────────────────────────────────────────────────

const KEY = process.env.RESEND_API_KEY
const FROM = process.env.RESEND_FROM_EMAIL || 'alerts@leadcommand.io'

export const resendConfigured = Boolean(KEY)

export async function sendEmail({ to, subject, html, text }) {
  if (!resendConfigured) {
    console.log(`[resend:mock] → ${to} · ${subject}`)
    return { mock: true, id: `email_mock_${Date.now()}` }
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html, text }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(`Resend failed: ${json.message || res.statusText}`)
  return { mock: false, id: json.id }
}

// Branded notification templates -----------------------------------------

const shell = (title, body) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#070B16;padding:32px;color:#e2e8f0">
    <div style="max-width:520px;margin:0 auto;background:#0E1424;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden">
      <div style="padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.07)">
        <span style="font-size:18px;font-weight:800;color:#fff">Lead<span style="color:#0066FF">Command</span></span>
      </div>
      <div style="padding:24px">
        <h1 style="font-size:18px;margin:0 0 12px;color:#fff">${title}</h1>
        ${body}
      </div>
    </div>
  </div>`

export function newLeadEmail({ to, callerName, campaign, disposition }) {
  return sendEmail({
    to,
    subject: `New ${disposition} lead — ${campaign}`,
    html: shell(
      'New lead captured',
      `<p style="color:#94a3b8;line-height:1.6"><b style="color:#fff">${callerName}</b> just called <b style="color:#fff">${campaign}</b>. AI disposition: <b style="color:#0066FF">${disposition}</b>.</p>`,
    ),
  })
}

export function appointmentEmail({ to, callerName, datetime, campaign }) {
  return sendEmail({
    to,
    subject: `Appointment booked — ${campaign}`,
    html: shell(
      'Appointment booked',
      `<p style="color:#94a3b8;line-height:1.6"><b style="color:#fff">${callerName}</b> booked an appointment for <b style="color:#fff">${datetime}</b> via ${campaign}.</p>`,
    ),
  })
}

export function invoiceEmail({ to, businessName, amount, url }) {
  return sendEmail({
    to,
    subject: `Invoice from LeadCommand — $${amount}`,
    html: shell(
      'New invoice',
      `<p style="color:#94a3b8;line-height:1.6">An invoice for <b style="color:#fff">$${amount}</b> has been issued to ${businessName}.</p>
       <a href="${url}" style="display:inline-block;margin-top:12px;background:#0066FF;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">View &amp; pay invoice</a>`,
    ),
  })
}
