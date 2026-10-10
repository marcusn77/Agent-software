import express from 'express'

const router = express.Router()

router.post('/incoming', (req, res) => {
  const { leadId, leadName, leadContext } = req.body

  res.json({
    ok: true,
    message: 'Inbound call webhook received',
    leadId,
    leadName,
    leadContext,
  })
})

router.post('/amd', (req, res) => {
  const { CallSid, AnsweredBy } = req.body

  res.json({
    ok: true,
    CallSid,
    AnsweredBy,
    outcome: AnsweredBy === 'machine_start' ? 'voicemail' : 'human',
  })
})

router.post('/status', (req, res) => {
  const { CallSid, CallStatus } = req.body

  res.json({
    ok: true,
    CallSid,
    CallStatus,
  })
})

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'calls-api' })
})

export { router as callsRouter }
