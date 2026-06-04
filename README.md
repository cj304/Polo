# LeadCommand

> Lead-generation command center for a local lead-gen agency — niche landing
> pages, Telnyx inbound call tracking, AI voice agents that book appointments,
> and client management across three deal types: **sell leads**, **rent the
> asset**, or **JV profit share**.

LeadCommand is an internal, enterprise-grade operations console. The Phase 1
build ships a fully interactive UI running on bundled sample data, plus a
backend that wires up Telnyx, Stripe, Resend, and Supabase — every integration
degrades gracefully to mocks until real API keys are supplied, so the product
is demonstrable end-to-end out of the box.

---

## Stack

| Layer      | Tech                                                      |
| ---------- | -------------------------------------------------------- |
| Frontend   | React + Vite, Tailwind CSS, React Router, Recharts       |
| Icons      | Lucide React                                             |
| Fonts      | Syne (display) + DM Sans (body) via Google Fonts         |
| Backend    | Node + Express (`/server`)                               |
| Database   | Supabase (Postgres + Auth)                               |
| Telephony  | Telnyx (numbers, call tracking, AI voice assistants)     |
| Payments   | Stripe (invoicing)                                       |
| Email      | Resend (notifications)                                   |

## Design language

A dark, Fortune-500 SaaS aesthetic — deep near-black navy base (`#0A0F1E`),
a single electric-blue accent (`#0066FF`) with amber as a secondary signal,
hairline 1px borders, generous whitespace, color-coded status badges, and
restrained micro-animations. See `tailwind.config.js` for the full token set.

---

## Getting started

```bash
npm install            # install dependencies
cp .env.example .env   # add API keys later; demo works without them

npm run dev            # frontend  → http://localhost:5173
npm run server         # backend   → http://localhost:8787  (separate shell)
# or run both together:
npm run dev:all
```

The Vite dev server proxies `/api/*` to the Express backend.

### Demo mode vs. live data

The app boots in **Demo Mode** against deterministic sample data in
`src/data/mockData.js`. Flip `VITE_USE_LIVE_DATA=true` (with Supabase
configured) to read from the live database. The topbar badge reflects the
active mode.

---

## Project structure

```
.
├── index.html                  # Vite entry, Google Fonts
├── src/
│   ├── App.jsx                 # route table
│   ├── components/
│   │   ├── layout/             # Sidebar, Topbar, MobileNav, AppLayout
│   │   ├── ui/                 # Button, Badge, Card, DataTable, Modal, Drawer…
│   │   ├── forms/              # Campaign / Client / Invoice modal forms
│   │   └── leads/              # LeadDrawer (recording + transcript)
│   ├── pages/                  # Dashboard, Campaigns, Leads, Clients, Revenue…
│   ├── lib/                    # supabase, api client, format, aiScripts
│   └── data/mockData.js        # sample data mirroring the DB schema
├── server/
│   ├── index.js                # Express app
│   ├── lib/                    # telnyx, stripe, resend, supabaseAdmin
│   └── routes/                 # telnyx, stripe, notifications, webhooks
└── supabase/schema.sql         # database schema + RLS
```

---

## Pages

- **Dashboard** — MRR / active campaigns / leads / appointments KPIs, 30-day
  leads area chart, revenue-by-campaign bar chart, recent leads.
- **Campaigns** — sortable/filterable table, new-campaign modal (provisions a
  number + AI agent), per-campaign detail with leads, agent script, call
  routing, and revenue tabs.
- **Leads** — full pipeline table with a detail drawer: call recording player,
  chat-style AI transcript, appointment info, status updates, and one-click
  "Bill this lead".
- **Clients** — card / table views, add-client form, client detail with
  campaigns, leads, revenue, and invoices.
- **Revenue** — MRR tracker, collected-vs-outstanding chart, filterable ledger,
  and a Create-Invoice flow (Stripe).
- **AI Agents** — one Telnyx assistant per campaign, script preview, inline
  editor, test-call button, and per-agent call volume stats.
- **Settings** — masked API keys (Telnyx / Stripe / Resend), business identity
  used in agent greetings, notification preferences, and account.

---

## Telnyx integration (`server/`)

1. **Number provisioning** — `GET /api/telnyx/numbers/search?area_code=` and
   `POST /api/telnyx/numbers/buy`.
2. **AI voice agents** — `POST /api/telnyx/assistants` creates an assistant per
   campaign with the niche script, greeting, **book_appointment** and
   **transfer** tools, then binds it to the campaign number. `PATCH` updates it.
3. **Webhook handler** — `POST /api/webhooks/telnyx` maps events to the lead
   lifecycle:

   | Telnyx event            | Action                                  |
   | ----------------------- | --------------------------------------- |
   | `call.initiated`        | create `leads` row (status `new`)       |
   | `call.answered`         | mark answered                           |
   | `call.hangup`           | write `call_duration`                   |
   | `recording.saved`       | save `recording_url`                    |
   | `transcription.ready`   | save `transcript` + AI disposition      |
   | `appointment.booked`    | set `appointment_booked` + datetime     |

4. **Call routing** — forward to the client during business hours, AI agent
   after hours, backup number on no-answer (`call_routing` table).

### AI agent scripts

Niche prompt templates live in `src/lib/aiScripts.js` (roofing, HVAC, water
damage, personal injury, plumbing, tree service). `buildAgentScript(niche,
businessName, city)` interpolates the business + city and appends shared
behavioral guardrails before sending to Telnyx.

---

## Database

Apply `supabase/schema.sql` in the Supabase SQL editor. It defines the
`campaigns`, `clients`, `leads`, `revenue`, and `call_routing` tables (with
enums, indexes, and authenticated-user RLS policies).

---

## Build roadmap

Phase 1 (this build) covers the layout shell, all seven pages on sample data,
the Telnyx webhook handler, the AI Agents console, and Stripe invoicing.
Remaining: live Supabase wiring for every page, and a separate client portal
login.
