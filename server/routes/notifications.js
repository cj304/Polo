// Generic notification dispatch route (Resend).
import express from 'express'
import { sendEmail } from '../lib/resend.js'

const router = express.Router()

// POST /api/notifications/send  { to, subject, html, text }
router.post('/send', async (req, res) => {
  const { to, subject, html, text } = req.body
  if (!to || !subject) return res.status(400).json({ ok: false, error: 'to and subject are required' })
  try {
    const result = await sendEmail({ to, subject, html, text })
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message })
  }
})

export default router
