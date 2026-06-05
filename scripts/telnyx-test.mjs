#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Standalone Telnyx connectivity / phone-number tester.
//
// Run this on a machine that can reach api.telnyx.com (your laptop or a
// deployed server) — NOT inside a restricted sandbox. It reads
// TELNYX_API_KEY (and friends) from your .env automatically.
//
// Usage:
//   node scripts/telnyx-test.mjs whoami
//   node scripts/telnyx-test.mjs search 305
//   node scripts/telnyx-test.mjs buy +13055551234
//   node scripts/telnyx-test.mjs numbers
//   node scripts/telnyx-test.mjs call <from_number> <to_number>
//
// "from" must be a Telnyx number you own; "to" is the phone to ring.
// ─────────────────────────────────────────────────────────────

import 'dotenv/config'

const API = 'https://api.telnyx.com/v2'
const KEY = process.env.TELNYX_API_KEY
const CONNECTION_ID = process.env.TELNYX_CONNECTION_ID

const c = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', blue: '\x1b[34m', dim: '\x1b[2m', bold: '\x1b[1m',
}
const ok = (m) => console.log(`${c.green}✓${c.reset} ${m}`)
const err = (m) => console.log(`${c.red}✗${c.reset} ${m}`)
const info = (m) => console.log(`${c.blue}›${c.reset} ${m}`)

if (!KEY) {
  err('TELNYX_API_KEY is not set. Add it to your .env (copy from .env.example).')
  process.exit(1)
}

async function telnyx(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    // Network-level failure (DNS, firewall, allowlist, offline).
    throw new Error(
      `network error reaching api.telnyx.com (${e.message}). ` +
        `If you see "Host not in allowlist", you are on a restricted network — run this locally.`,
    )
  }
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = { raw: text } }
  if (!res.ok) {
    const detail = json?.errors?.[0]?.detail || json.raw || res.statusText
    const errObj = new Error(`HTTP ${res.status} — ${detail}`)
    errObj.status = res.status
    throw errObj
  }
  return json
}

const cmd = process.argv[2]
const args = process.argv.slice(3)

const commands = {
  // Verify the key is valid by reading the account balance.
  async whoami() {
    info('Checking API key against Telnyx (GET /balance)…')
    const { data } = await telnyx('/balance')
    ok(`Key is valid. Balance: ${c.bold}${data.currency} ${data.balance}${c.reset} (credit limit ${data.credit_limit})`)
  },

  // Search available local numbers by area code.
  async search() {
    const areaCode = args[0] || '305'
    info(`Searching available voice numbers in area code ${areaCode}…`)
    const { data } = await telnyx(
      `/available_phone_numbers?filter[national_destination_code]=${areaCode}&filter[features][]=voice&filter[limit]=10`,
    )
    if (!data?.length) return err('No numbers returned for that area code.')
    ok(`${data.length} numbers available:`)
    data.forEach((n) =>
      console.log(`   ${c.bold}${n.phone_number}${c.reset} ${c.dim}· ${n.region_information?.[0]?.region_name || 'US'} · $${n.cost_information?.monthly_cost || '?'}/mo${c.reset}`),
    )
    console.log(`\n${c.dim}Buy one with:  node scripts/telnyx-test.mjs buy ${data[0].phone_number}${c.reset}`)
  },

  // Purchase a number (creates a real order — costs money).
  async buy() {
    const number = args[0]
    if (!number) return err('Usage: buy <+E164number>')
    if (!CONNECTION_ID) info(`${c.yellow}Warning:${c.reset} TELNYX_CONNECTION_ID is not set — number won't be attached to a voice app.`)
    info(`Ordering ${number}…`)
    const { data } = await telnyx('/number_orders', {
      method: 'POST',
      body: { phone_numbers: [{ phone_number: number }], connection_id: CONNECTION_ID },
    })
    ok(`Order ${data.id} created — status: ${c.bold}${data.status}${c.reset}`)
  },

  // List numbers already on the account.
  async numbers() {
    info('Listing phone numbers on the account…')
    const { data } = await telnyx('/phone_numbers?page[size]=25')
    if (!data?.length) return info('No numbers on the account yet. Use `search` then `buy`.')
    ok(`${data.length} number(s):`)
    data.forEach((n) =>
      console.log(`   ${c.bold}${n.phone_number}${c.reset} ${c.dim}· ${n.status} · connection ${n.connection_id || '—'}${c.reset}`),
    )
  },

  // Place an outbound call (rings `to`, connecting from your Telnyx `from`).
  async call() {
    const [from, to] = args
    if (!from || !to) return err('Usage: call <from_telnyx_number> <to_number>')
    if (!CONNECTION_ID) return err('TELNYX_CONNECTION_ID is required to place a call. Add it to .env.')
    info(`Placing test call from ${from} → ${to}…`)
    const { data } = await telnyx('/calls', {
      method: 'POST',
      body: {
        connection_id: CONNECTION_ID,
        to,
        from,
        webhook_url: (process.env.TELNYX_WEBHOOK_BASE_URL || '') + '/api/webhooks/telnyx',
      },
    })
    ok(`Call initiated — call_control_id: ${c.bold}${data.call_control_id}${c.reset}, status: ${data.status}`)
    console.log(`${c.dim}Watch your server logs for the webhook events.${c.reset}`)
  },
}

const run = commands[cmd]
if (!run) {
  console.log(`${c.bold}Telnyx tester${c.reset}\n`)
  console.log('Commands:')
  console.log('  whoami                       verify the API key works')
  console.log('  search <areaCode>            list available numbers (e.g. 305)')
  console.log('  buy <+E164>                  purchase a number (real charge)')
  console.log('  numbers                      list numbers on the account')
  console.log('  call <from> <to>             place a test call')
  console.log(`\n${c.dim}Reads TELNYX_API_KEY / TELNYX_CONNECTION_ID from .env${c.reset}`)
  process.exit(0)
}

try {
  await run()
} catch (e) {
  err(e.message)
  if (String(e.message).includes('allowlist') || String(e.message).includes('network error')) {
    console.log(`\n${c.yellow}This network can't reach Telnyx.${c.reset} Run this script on your local machine instead.`)
  } else if (e.status === 401) {
    console.log(`\n${c.yellow}401 = bad/expired key.${c.reset} Double-check TELNYX_API_KEY in .env (and rotate if it leaked).`)
  }
  process.exit(1)
}
