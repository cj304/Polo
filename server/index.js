// ─────────────────────────────────────────────────────────────
// LeadCommand backend API.
//
// A thin Express server that hosts the integration endpoints the SPA
// calls through its /api proxy:
//   /api/telnyx/*         number provisioning + AI assistants
//   /api/stripe/*         invoicing
//   /api/notifications/*  email
//   /api/webhooks/telnyx  inbound call/AI events
//
// Every integration degrades to mocks without keys, so `npm run server`
// works out of the box for the Phase 1 demo.
// ─────────────────────────────────────────────────────────────

import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import telnyxRoutes from './routes/telnyx.js'
import stripeRoutes from './routes/stripe.js'
import notificationRoutes from './routes/notifications.js'
import webhookRoutes from './routes/webhooks.js'

import { telnyxConfigured } from './lib/telnyx.js'
import { stripeConfigured } from './lib/stripe.js'
import { resendConfigured } from './lib/resend.js'
import { supabaseAdminConfigured } from './lib/supabaseAdmin.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

// Health + integration status (powers the "Demo Mode" badge in the UI).
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    integrations: {
      telnyx: telnyxConfigured,
      stripe: stripeConfigured,
      resend: resendConfigured,
      supabase: supabaseAdminConfigured,
    },
  })
})

app.use('/api/telnyx', telnyxRoutes)
app.use('/api/stripe', stripeRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/webhooks', webhookRoutes)

app.use((err, _req, res, _next) => {
  console.error('[server] unhandled error:', err)
  res.status(500).json({ ok: false, error: err.message })
})

const PORT = process.env.PORT || 8787
app.listen(PORT, () => {
  console.log(`\n  LeadCommand API → http://localhost:${PORT}`)
  console.log('  Integrations:', {
    telnyx: telnyxConfigured ? 'live' : 'mock',
    stripe: stripeConfigured ? 'live' : 'mock',
    resend: resendConfigured ? 'live' : 'mock',
    supabase: supabaseAdminConfigured ? 'live' : 'mock',
  })
})
