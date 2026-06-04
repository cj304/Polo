// Telnyx provisioning + assistant management routes.
import express from 'express'
import {
  searchNumbers, buyNumber, createAssistant, updateAssistant, placeTestCall, telnyxConfigured,
} from '../lib/telnyx.js'

const router = express.Router()

// GET /api/telnyx/numbers/search?area_code=305
router.get('/numbers/search', async (req, res) => {
  try {
    const result = await searchNumbers(req.query.area_code || '305')
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

// POST /api/telnyx/numbers/buy { phoneNumber, campaignId }
router.post('/numbers/buy', async (req, res) => {
  try {
    const result = await buyNumber(req.body.phoneNumber)
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

// POST /api/telnyx/assistants  { niche, businessName, city, phoneNumber }
router.post('/assistants', async (req, res) => {
  try {
    const result = await createAssistant(req.body)
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

// PATCH /api/telnyx/assistants/:id  { greeting, instructions }
router.patch('/assistants/:id', async (req, res) => {
  try {
    const result = await updateAssistant(req.params.id, req.body)
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

// POST /api/telnyx/assistants/test-call  { campaignId, toNumber, assistantId, fromNumber }
router.post('/assistants/test-call', async (req, res) => {
  try {
    const result = await placeTestCall({
      assistantId: req.body.assistantId,
      fromNumber: req.body.fromNumber,
      toNumber: req.body.toNumber || process.env.OPERATOR_PHONE,
    })
    res.json({ ok: true, configured: telnyxConfigured, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

export default router
