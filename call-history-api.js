import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ ok: true, message: 'Call history API ready' })
})

router.get('/:leadId', (req, res) => {
  const { leadId } = req.params
  res.json({
    ok: true,
    leadId,
    history: [],
  })
})

export { router as callHistoryRouter }
