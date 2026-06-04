// ─────────────────────────────────────────────────────────────
// Telnyx API client (server-side).
//
// Covers the integrations LeadCommand needs:
//   1. Phone number search + purchase
//   2. AI voice assistant create / update + number assignment
//   3. Outbound test calls
//
// Every method degrades to a deterministic mock when TELNYX_API_KEY is
// absent, so the product is fully demonstrable before keys are added.
// ─────────────────────────────────────────────────────────────

import { buildAgentScript, buildGreeting } from '../../src/lib/aiScripts.js'

const API = 'https://api.telnyx.com/v2'
const KEY = process.env.TELNYX_API_KEY
const CONNECTION_ID = process.env.TELNYX_CONNECTION_ID
const WEBHOOK_BASE = process.env.TELNYX_WEBHOOK_BASE_URL || ''

export const telnyxConfigured = Boolean(KEY)

async function telnyx(path, { method = 'GET', body } = {}) {
  if (!telnyxConfigured) throw new Error('TELNYX_API_KEY not configured')
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail = json?.errors?.[0]?.detail || res.statusText
    throw new Error(`Telnyx ${path} failed: ${detail}`)
  }
  return json
}

// ── 1. Phone number provisioning ───────────────────────────

/** Search available local numbers by area code. */
export async function searchNumbers(areaCode) {
  if (!telnyxConfigured) {
    return {
      mock: true,
      numbers: Array.from({ length: 5 }, (_, i) => ({
        phone_number: `+1${areaCode}555${String(1000 + i * 137).padStart(4, '0')}`,
        region: 'US',
        features: ['voice', 'sms'],
        monthly_cost: '1.00',
      })),
    }
  }
  const data = await telnyx(
    `/available_phone_numbers?filter[national_destination_code]=${areaCode}&filter[features][]=voice&filter[limit]=10`,
  )
  return {
    mock: false,
    numbers: (data.data || []).map((n) => ({
      phone_number: n.phone_number,
      region: n.region_information?.[0]?.region_name || 'US',
      features: (n.features || []).map((f) => f.name),
      monthly_cost: n.cost_information?.monthly_cost,
    })),
  }
}

/** Purchase a number via an order and attach it to the voice connection. */
export async function buyNumber(phoneNumber) {
  if (!telnyxConfigured) {
    return { mock: true, phone_number: phoneNumber, status: 'active', order_id: `mock_order_${Date.now()}` }
  }
  const order = await telnyx('/number_orders', {
    method: 'POST',
    body: {
      phone_numbers: [{ phone_number: phoneNumber }],
      connection_id: CONNECTION_ID,
    },
  })
  return { mock: false, phone_number: phoneNumber, status: order.data?.status, order_id: order.data?.id }
}

// ── 2. AI voice assistants ──────────────────────────────────

const ASSISTANT_TOOLS = [
  {
    type: 'book_appointment',
    book_appointment: {
      description: 'Book an appointment once the caller agrees to a date and time.',
    },
  },
  {
    type: 'transfer',
    transfer: { description: 'Transfer the call to a human at the forwarding number.' },
  },
]

/**
 * Create a Telnyx AI Assistant for a campaign, wired with the niche script,
 * greeting, booking + transfer tools, and the campaign's phone number.
 */
export async function createAssistant({ niche, businessName, city, phoneNumber, voice = 'female' }) {
  const instructions = buildAgentScript(niche, businessName, city)
  const greeting = buildGreeting(niche, businessName)

  if (!telnyxConfigured) {
    return {
      mock: true,
      id: `assistant_mock_${niche}_${Date.now()}`,
      name: `${businessName} — ${city}`,
      instructions,
      greeting,
      tools: ASSISTANT_TOOLS.map((t) => t.type),
    }
  }

  const assistant = await telnyx('/ai/assistants', {
    method: 'POST',
    body: {
      name: `${businessName} — ${city} (${niche})`,
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
      instructions,
      greeting,
      voice_settings: { voice },
      tools: ASSISTANT_TOOLS,
    },
  })
  const id = assistant.data?.id

  // Bind the assistant to the campaign number so inbound calls route to it.
  if (id && phoneNumber) {
    await assignAssistantToNumber(id, phoneNumber).catch(() => {})
  }
  return { mock: false, id, name: assistant.data?.name, instructions, greeting }
}

export async function updateAssistant(id, patch) {
  if (!telnyxConfigured) return { mock: true, id, ...patch }
  const res = await telnyx(`/ai/assistants/${id}`, { method: 'PUT', body: patch })
  return { mock: false, id, data: res.data }
}

/** Point a phone number's inbound voice at an AI assistant. */
export async function assignAssistantToNumber(assistantId, phoneNumber) {
  if (!telnyxConfigured) return { mock: true, assistantId, phoneNumber }
  return telnyx('/ai/assistants/' + assistantId, {
    method: 'PUT',
    body: {
      telephony_settings: {
        default_texml_app_settings: {
          webhook_url: `${WEBHOOK_BASE}/api/webhooks/telnyx`,
        },
        supported_telephony_providers: ['telnyx'],
        phone_numbers: [phoneNumber],
      },
    },
  })
}

// ── 3. Outbound test call ───────────────────────────────────

/** Place an outbound call that connects the AI assistant to a test number. */
export async function placeTestCall({ assistantId, fromNumber, toNumber }) {
  if (!telnyxConfigured) {
    return { mock: true, call_control_id: `mock_call_${Date.now()}`, status: 'initiated' }
  }
  const res = await telnyx('/calls', {
    method: 'POST',
    body: {
      connection_id: CONNECTION_ID,
      to: toNumber,
      from: fromNumber,
      webhook_url: `${WEBHOOK_BASE}/api/webhooks/telnyx`,
      // The TeXML app / assistant handles the media once answered.
    },
  })
  return { mock: false, call_control_id: res.data?.call_control_id, status: res.data?.status }
}
