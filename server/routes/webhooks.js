// ─────────────────────────────────────────────────────────────
// POST /api/webhooks/telnyx
//
// Single entry point for all Telnyx call + AI assistant events.
// Maps each event to a lead-lifecycle mutation:
//
//   call.initiated      → create a `leads` row (status: new)
//   call.answered       → mark the lead answered
//   call.hangup         → write call_duration
//   call.recording.saved→ save recording_url
//   transcription.ready → save transcript + AI disposition
//   appointment.booked  → flag appointment + datetime  (custom assistant tool)
//
// Telnyx wraps every event as { data: { event_type, payload } }.
// We key leads by Telnyx's call_control_id / call_leg_id.
// ─────────────────────────────────────────────────────────────

import express from 'express'
import { insertRow, updateRows } from '../lib/supabaseAdmin.js'
import { resendConfigured, newLeadEmail, appointmentEmail } from '../lib/resend.js'

const router = express.Router()

// Optional: verify Telnyx signature if a public key is configured.
// (Ed25519 verification — left as a no-op stub in demo mode.)
function verifySignature(req) {
  if (!process.env.TELNYX_PUBLIC_KEY) return true
  // In production: validate `telnyx-signature-ed25519` + `telnyx-timestamp`
  // headers against the raw body. Returning true keeps the demo functional.
  return true
}

// Resolve the campaign that owns the called number (DID).
async function resolveCampaign(toNumber) {
  // In live mode this queries Supabase; in demo mode it's a no-op and the
  // handler simply logs the association.
  return { campaign_id: null, client_id: null, to: toNumber }
}

router.post('/telnyx', async (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'invalid signature' })
  }

  const event = req.body?.data || req.body
  const type = event?.event_type || event?.type
  const payload = event?.payload || {}
  const callId = payload.call_control_id || payload.call_leg_id || payload.call_session_id

  try {
    switch (type) {
      case 'call.initiated': {
        const ctx = await resolveCampaign(payload.to)
        await insertRow('leads', {
          telnyx_call_id: callId,
          campaign_id: ctx.campaign_id,
          client_id: ctx.client_id,
          caller_number: payload.from,
          caller_name: payload.from_display_name || null,
          status: 'new',
          appointment_booked: false,
          created_at: new Date().toISOString(),
        })
        // Fire-and-forget operator notification.
        if (resendConfigured && process.env.OPERATOR_EMAIL) {
          newLeadEmail({
            to: process.env.OPERATOR_EMAIL,
            callerName: payload.from,
            campaign: payload.to,
            disposition: 'new',
          }).catch(() => {})
        }
        break
      }

      case 'call.answered': {
        await updateRows('leads', { telnyx_call_id: callId }, { status: 'qualified', answered_at: new Date().toISOString() })
        break
      }

      case 'call.hangup': {
        const seconds = computeDuration(payload)
        await updateRows('leads', { telnyx_call_id: callId }, { call_duration: seconds })
        break
      }

      case 'call.recording.saved':
      case 'recording.saved': {
        const url = payload.recording_urls?.mp3 || payload.public_recording_urls?.mp3 || payload.recording_url
        await updateRows('leads', { telnyx_call_id: callId }, { recording_url: url })
        break
      }

      case 'transcription.ready':
      case 'transcript.ready': {
        const transcript = payload.transcript || payload.transcription_text || ''
        await updateRows('leads', { telnyx_call_id: callId }, {
          transcript,
          ai_disposition: inferDisposition(transcript),
        })
        break
      }

      case 'appointment.booked': {
        // Emitted by the assistant's book_appointment tool.
        await updateRows('leads', { telnyx_call_id: callId }, {
          appointment_booked: true,
          appointment_datetime: payload.datetime,
          caller_name: payload.caller_name || undefined,
          status: 'qualified',
        })
        if (resendConfigured && process.env.OPERATOR_EMAIL) {
          appointmentEmail({
            to: process.env.OPERATOR_EMAIL,
            callerName: payload.caller_name || payload.from,
            datetime: payload.datetime,
            campaign: payload.to,
          }).catch(() => {})
        }
        break
      }

      default:
        // Acknowledge unhandled events so Telnyx doesn't retry.
        console.log(`[telnyx] unhandled event: ${type}`)
    }
  } catch (err) {
    console.error('[telnyx webhook] error:', err.message)
    // Still 200 so Telnyx doesn't hammer retries on transient write errors;
    // surface the error in the body for observability.
    return res.status(200).json({ received: true, warning: err.message })
  }

  res.status(200).json({ received: true, event: type })
})

function computeDuration(payload) {
  if (payload.call_duration_secs) return Number(payload.call_duration_secs)
  if (payload.start_time && payload.end_time) {
    return Math.max(0, Math.round((new Date(payload.end_time) - new Date(payload.start_time)) / 1000))
  }
  return 0
}

// Cheap keyword heuristic for hot/warm/cold until the assistant supplies one.
function inferDisposition(transcript = '') {
  const t = transcript.toLowerCase()
  if (/(emergency|urgent|right now|asap|flooding|still active|completely down|leak)/.test(t)) return 'hot'
  if (/(schedule|appointment|estimate|book|tomorrow|this week)/.test(t)) return 'warm'
  return 'cold'
}

export default router
