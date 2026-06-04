// ─────────────────────────────────────────────────────────────
// Bundled sample data for the Phase 1 demo. Mirrors the Supabase
// schema exactly so swapping to live data is a drop-in change.
// Deterministic generation keeps charts/tables stable between renders.
// ─────────────────────────────────────────────────────────────

import { NICHE_LABELS } from '../lib/aiScripts.js'

// Seeded PRNG so the dataset is identical on every load.
function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}
const rng = makeRng(424242)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]
const between = (min, max) => Math.floor(rng() * (max - min + 1)) + min

const DAY = 86400000
const now = Date.now()
const iso = (ms) => new Date(ms).toISOString()

// ── Clients ────────────────────────────────────────────────
export const clients = [
  {
    id: 'cl_01',
    name: 'Marcus Reyes',
    business_name: 'Summit Peak Roofing',
    email: 'marcus@summitpeakroofing.com',
    phone: '+13055550142',
    deal_type: 'rent',
    contract_start: iso(now - 210 * DAY),
    contract_renewal: iso(now + 155 * DAY),
    stripe_customer_id: 'cus_SummitPeak01',
    notes: 'Top performer. Wants a second city (Fort Lauderdale) next quarter.',
    created_at: iso(now - 210 * DAY),
  },
  {
    id: 'cl_02',
    name: 'Dana Whitfield',
    business_name: 'Whitfield Comfort Air',
    email: 'dana@whitfieldair.com',
    phone: '+14045550199',
    deal_type: 'jv',
    contract_start: iso(now - 120 * DAY),
    contract_renewal: iso(now + 245 * DAY),
    stripe_customer_id: 'cus_Whitfield02',
    notes: '50/50 profit share on booked jobs. Reports revenue monthly.',
    created_at: iso(now - 120 * DAY),
  },
  {
    id: 'cl_03',
    name: 'Priya Nadakumar',
    business_name: 'RapidDry Restoration',
    email: 'priya@rapiddry.com',
    phone: '+18135550177',
    deal_type: 'sell',
    contract_start: iso(now - 64 * DAY),
    contract_renewal: iso(now + 301 * DAY),
    stripe_customer_id: 'cus_RapidDry03',
    notes: 'Buys water-damage leads at $185 each. Very fast to respond.',
    created_at: iso(now - 64 * DAY),
  },
  {
    id: 'cl_04',
    name: 'Theodore Banks',
    business_name: 'Banks & Cole Injury Law',
    email: 'tbanks@bankscole.com',
    phone: '+12145550118',
    deal_type: 'sell',
    contract_start: iso(now - 95 * DAY),
    contract_renewal: iso(now + 270 * DAY),
    stripe_customer_id: 'cus_BanksCole04',
    notes: 'High-value PI leads. $450/qualified consult booked.',
    created_at: iso(now - 95 * DAY),
  },
  {
    id: 'cl_05',
    name: 'Hector Ramirez',
    business_name: 'Ramirez Brothers Plumbing',
    email: 'hector@ramirezbros.com',
    phone: '+16025550133',
    deal_type: 'rent',
    contract_start: iso(now - 40 * DAY),
    contract_renewal: iso(now + 24 * DAY),
    stripe_customer_id: 'cus_Ramirez05',
    notes: 'Renewal coming up soon — schedule a check-in call.',
    created_at: iso(now - 40 * DAY),
  },
  {
    id: 'cl_06',
    name: 'Unassigned',
    business_name: '— Asset for sale —',
    email: '',
    phone: '',
    deal_type: 'sell',
    contract_start: null,
    contract_renewal: null,
    stripe_customer_id: '',
    notes: 'No client assigned. Campaign asset listed for sale.',
    created_at: iso(now - 30 * DAY),
  },
]

// ── Campaigns ──────────────────────────────────────────────
export const campaigns = [
  {
    id: 'cmp_01',
    name: 'Miami Roof Repair',
    niche: 'roofing',
    city: 'Miami',
    state: 'FL',
    telnyx_number: '+13055550142',
    telnyx_assistant_id: 'assistant_miami_roof',
    status: 'active',
    deal_type: 'rent',
    client_id: 'cl_01',
    monthly_value: 3500,
    per_lead_rate: null,
    jv_percentage: null,
    created_at: iso(now - 200 * DAY),
  },
  {
    id: 'cmp_02',
    name: 'Atlanta HVAC Repair',
    niche: 'hvac',
    city: 'Atlanta',
    state: 'GA',
    telnyx_number: '+14045550199',
    telnyx_assistant_id: 'assistant_atl_hvac',
    status: 'active',
    deal_type: 'jv',
    client_id: 'cl_02',
    monthly_value: 4200,
    per_lead_rate: null,
    jv_percentage: 50,
    created_at: iso(now - 118 * DAY),
  },
  {
    id: 'cmp_03',
    name: 'Tampa Water Damage',
    niche: 'water_damage',
    city: 'Tampa',
    state: 'FL',
    telnyx_number: '+18135550177',
    telnyx_assistant_id: 'assistant_tampa_water',
    status: 'active',
    deal_type: 'sell',
    client_id: 'cl_03',
    monthly_value: 5550,
    per_lead_rate: 185,
    jv_percentage: null,
    created_at: iso(now - 62 * DAY),
  },
  {
    id: 'cmp_04',
    name: 'Dallas Injury Intake',
    niche: 'personal_injury',
    city: 'Dallas',
    state: 'TX',
    telnyx_number: '+12145550118',
    telnyx_assistant_id: 'assistant_dallas_pi',
    status: 'active',
    deal_type: 'sell',
    client_id: 'cl_04',
    monthly_value: 6750,
    per_lead_rate: 450,
    jv_percentage: null,
    created_at: iso(now - 93 * DAY),
  },
  {
    id: 'cmp_05',
    name: 'Phoenix Emergency Plumbing',
    niche: 'plumbing',
    city: 'Phoenix',
    state: 'AZ',
    telnyx_number: '+16025550133',
    telnyx_assistant_id: 'assistant_phx_plumb',
    status: 'active',
    deal_type: 'rent',
    client_id: 'cl_05',
    monthly_value: 2800,
    per_lead_rate: null,
    jv_percentage: null,
    created_at: iso(now - 38 * DAY),
  },
  {
    id: 'cmp_06',
    name: 'Denver Tree Removal',
    niche: 'tree_service',
    city: 'Denver',
    state: 'CO',
    telnyx_number: '+17205550161',
    telnyx_assistant_id: 'assistant_den_tree',
    status: 'for_sale',
    deal_type: 'sell',
    client_id: 'cl_06',
    monthly_value: 0,
    per_lead_rate: 95,
    jv_percentage: null,
    created_at: iso(now - 30 * DAY),
  },
  {
    id: 'cmp_07',
    name: 'Orlando Roof Replacement',
    niche: 'roofing',
    city: 'Orlando',
    state: 'FL',
    telnyx_number: '+14075550188',
    telnyx_assistant_id: 'assistant_orl_roof',
    status: 'paused',
    deal_type: 'rent',
    client_id: 'cl_01',
    monthly_value: 3000,
    per_lead_rate: null,
    jv_percentage: null,
    created_at: iso(now - 150 * DAY),
  },
]

// ── Call routing (one row per campaign) ────────────────────
export const callRouting = campaigns.map((c, i) => ({
  id: `rt_${String(i + 1).padStart(2, '0')}`,
  campaign_id: c.id,
  forward_to_number: clients.find((cl) => cl.id === c.client_id)?.phone || '',
  backup_number: '+18005550100',
  business_hours_start: '08:00',
  business_hours_end: '18:00',
  after_hours_ai: true,
  created_at: c.created_at,
}))

// ── Leads (generated across the last 30 days) ──────────────
const FIRST = ['James', 'Maria', 'Robert', 'Linda', 'David', 'Susan', 'Carlos', 'Aisha', 'Kevin', 'Emily', 'Frank', 'Nadia', 'Greg', 'Tanya', 'Omar', 'Beth']
const LAST = ['Carter', 'Nguyen', 'Patel', 'Johnson', 'Brooks', 'Diaz', 'Foster', 'Hughes', 'Khan', 'Powell', 'Reed', 'Vance', 'Wong', 'Mills', 'Ortega', 'Shaw']
const DISPO = ['hot', 'warm', 'cold']
const STATUS = ['new', 'qualified', 'billed', 'invalid']

const transcriptFor = (niche, name) => {
  const lines = {
    roofing: `Agent: Thanks for calling — how can I help with your roof today?\nCaller: Hi, I've got a leak in my bedroom ceiling after the storm.\nAgent: I'm sorry to hear that. Can I get the property address and a good callback number?\nCaller: Sure, it's 418 Palm Ave. Number's the one I'm calling from.\nAgent: Got it. How urgent — is it actively dripping?\nCaller: Yeah, we've got a bucket under it.\nAgent: Understood. I can get an estimator out tomorrow between 9 and 11. Does that work?\nCaller: That's perfect.\nAgent: Booked. You'll get a confirmation text shortly, ${name}.`,
    hvac: `Agent: Thanks for calling — heating, cooling, or maintenance today?\nCaller: My AC stopped blowing cold this morning.\nAgent: Got it. Is the system completely down or just weak?\nCaller: Completely down, house is 84 inside.\nAgent: Let's get someone out fast. What's the address?\nCaller: 22 Oakridge Court.\nAgent: I can have a tech there this afternoon, 2 to 4. Work for you?\nCaller: Yes please.\nAgent: Scheduled, ${name}. Confirmation on the way.`,
    water_damage: `Agent: Are you dealing with active water right now?\nCaller: Yes! Pipe burst under the kitchen sink, water everywhere.\nAgent: Okay, shut the main valve if you safely can. What's the address?\nCaller: 1190 Riverbend Drive.\nAgent: A crew is being dispatched now — ETA about 40 minutes. Stay safe, ${name}.`,
    personal_injury: `Agent: I can help you get started. What type of accident was it?\nCaller: I got rear-ended at a red light last week.\nAgent: I'm glad you called. Any injuries?\nCaller: Neck and lower back, seeing a chiropractor.\nAgent: Thank you. Let me get your details and book a free consultation with an attorney.\nCaller: Okay.\nAgent: You're set for Thursday at 10am, ${name}.`,
    plumbing: `Agent: What can I help you schedule today?\nCaller: Water heater's leaking in the garage.\nAgent: Got it — what's the address and how urgent?\nCaller: 77 Cactus Lane, it's getting worse.\nAgent: I'll get a plumber out today between 1 and 3. Sound good?\nCaller: Great.\nAgent: Booked, ${name}.`,
    tree_service: `Agent: Removal, trimming, or emergency today?\nCaller: A big branch came down on my driveway.\nAgent: Got it. What's the property address?\nCaller: 305 Birchwood Street.\nAgent: I'll schedule a free estimate for tomorrow morning. Confirmed, ${name}.`,
  }
  return lines[niche] || lines.roofing
}

function buildLeads() {
  const out = []
  let n = 1
  for (let d = 29; d >= 0; d--) {
    const dayStart = now - d * DAY
    const activeCampaigns = campaigns.filter((c) => c.status === 'active')
    // Weekends quieter, weekdays busier.
    const weekday = new Date(dayStart).getDay()
    const base = weekday === 0 || weekday === 6 ? between(1, 4) : between(3, 9)
    for (let i = 0; i < base; i++) {
      const cmp = pick(activeCampaigns)
      const name = `${pick(FIRST)} ${pick(LAST)}`
      const dispo = rng() < 0.34 ? 'hot' : rng() < 0.6 ? 'warm' : 'cold'
      const booked = dispo === 'hot' ? rng() < 0.8 : dispo === 'warm' ? rng() < 0.35 : false
      let status
      if (booked && rng() < 0.6) status = 'billed'
      else if (dispo === 'cold' && rng() < 0.35) status = 'invalid'
      else if (booked) status = 'qualified'
      else status = pick(['new', 'qualified', 'new'])
      const ts = dayStart + between(8, 19) * 3600000 + between(0, 59) * 60000
      out.push({
        id: `ld_${String(n).padStart(4, '0')}`,
        campaign_id: cmp.id,
        client_id: cmp.client_id,
        caller_number: `+1${between(200, 989)}555${String(between(0, 9999)).padStart(4, '0')}`,
        caller_name: name,
        call_duration: between(45, 480),
        recording_url: `https://recordings.telnyx.example/${cmp.id}/${n}.mp3`,
        transcript: transcriptFor(cmp.niche, name.split(' ')[0]),
        ai_disposition: dispo,
        appointment_booked: booked,
        appointment_datetime: booked ? iso(ts + between(1, 4) * DAY) : null,
        status,
        created_at: iso(ts),
      })
      n++
    }
  }
  return out.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export const leads = buildLeads()

// ── Revenue ────────────────────────────────────────────────
function buildRevenue() {
  const rows = []
  let n = 1
  // Recurring monthly rows for rent/jv clients over the last 4 months.
  for (let m = 3; m >= 0; m--) {
    const monthMs = now - m * 30 * DAY
    campaigns.forEach((c) => {
      if (c.status === 'for_sale') return
      const client = clients.find((cl) => cl.id === c.client_id)
      if (!client) return
      if (c.deal_type === 'rent') {
        rows.push({
          id: `rev_${String(n++).padStart(3, '0')}`,
          client_id: c.client_id,
          campaign_id: c.id,
          type: 'monthly_rent',
          amount: c.monthly_value,
          description: `${c.name} — monthly retainer`,
          stripe_invoice_id: `in_${c.id}_${m}`,
          paid: m > 0,
          due_date: iso(monthMs),
          paid_date: m > 0 ? iso(monthMs + 3 * DAY) : null,
          created_at: iso(monthMs - 5 * DAY),
        })
      } else if (c.deal_type === 'jv') {
        const amt = between(2800, 5200)
        rows.push({
          id: `rev_${String(n++).padStart(3, '0')}`,
          client_id: c.client_id,
          campaign_id: c.id,
          type: 'jv_payment',
          amount: amt,
          description: `${c.name} — JV profit share (${c.jv_percentage}%)`,
          stripe_invoice_id: `in_${c.id}_jv_${m}`,
          paid: m > 0,
          due_date: iso(monthMs),
          paid_date: m > 0 ? iso(monthMs + 5 * DAY) : null,
          created_at: iso(monthMs - 5 * DAY),
        })
      }
    })
  }
  // Per-lead sales from billed leads on "sell" campaigns this month.
  leads
    .filter((l) => l.status === 'billed')
    .forEach((l) => {
      const c = campaigns.find((cmp) => cmp.id === l.campaign_id)
      if (!c || c.deal_type !== 'sell' || !c.per_lead_rate) return
      rows.push({
        id: `rev_${String(n++).padStart(3, '0')}`,
        client_id: l.client_id,
        campaign_id: l.campaign_id,
        type: 'lead_sale',
        amount: c.per_lead_rate,
        description: `Qualified lead — ${l.caller_name}`,
        stripe_invoice_id: rng() < 0.7 ? `in_lead_${l.id}` : null,
        paid: rng() < 0.65,
        due_date: l.created_at,
        paid_date: rng() < 0.65 ? iso(new Date(l.created_at).getTime() + 2 * DAY) : null,
        created_at: l.created_at,
      })
    })
  return rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export const revenue = buildRevenue()

// ── Derived helpers used by pages ──────────────────────────
export function clientById(id) {
  return clients.find((c) => c.id === id) || null
}
export function campaignById(id) {
  return campaigns.find((c) => c.id === id) || null
}
export function leadsForCampaign(id) {
  return leads.filter((l) => l.campaign_id === id)
}
export function leadsForClient(id) {
  return leads.filter((l) => l.client_id === id)
}
export function campaignsForClient(id) {
  return campaigns.filter((c) => c.client_id === id)
}
export function revenueForClient(id) {
  return revenue.filter((r) => r.client_id === id)
}
export function revenueForCampaign(id) {
  return revenue.filter((r) => r.campaign_id === id)
}

// Monthly recurring revenue: active rent + jv (latest cycle) campaign values.
export function computeMRR() {
  return campaigns
    .filter((c) => c.status === 'active')
    .reduce((sum, c) => sum + (c.monthly_value || 0), 0)
}

// Leads-per-day series for the last 30 days (dashboard line chart).
export function leadsPerDay() {
  const buckets = {}
  for (let d = 29; d >= 0; d--) {
    const key = new Date(now - d * DAY).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    buckets[key] = { date: key, leads: 0, booked: 0 }
  }
  leads.forEach((l) => {
    const key = new Date(l.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    if (buckets[key]) {
      buckets[key].leads += 1
      if (l.appointment_booked) buckets[key].booked += 1
    }
  })
  return Object.values(buckets)
}

// Revenue by campaign (dashboard bar chart).
export function revenueByCampaign() {
  return campaigns
    .map((c) => ({
      name: c.city,
      campaign: c.name,
      revenue: revenue
        .filter((r) => r.campaign_id === c.id)
        .reduce((s, r) => s + r.amount, 0),
    }))
    .filter((r) => r.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
}

// Monthly revenue totals for the revenue page chart.
export function monthlyRevenue() {
  const buckets = {}
  for (let m = 5; m >= 0; m--) {
    const dt = new Date(now - m * 30 * DAY)
    const key = dt.toLocaleDateString('en-US', { month: 'short' })
    buckets[key] = { month: key, paid: 0, outstanding: 0 }
  }
  revenue.forEach((r) => {
    const key = new Date(r.created_at).toLocaleDateString('en-US', { month: 'short' })
    if (buckets[key]) {
      if (r.paid) buckets[key].paid += r.amount
      else buckets[key].outstanding += r.amount
    }
  })
  return Object.values(buckets)
}

export function leadsThisMonth() {
  const monthAgo = now - 30 * DAY
  return leads.filter((l) => new Date(l.created_at).getTime() >= monthAgo).length
}

export function appointmentsThisMonth() {
  const monthAgo = now - 30 * DAY
  return leads.filter(
    (l) => l.appointment_booked && new Date(l.created_at).getTime() >= monthAgo,
  ).length
}

export { NICHE_LABELS }
