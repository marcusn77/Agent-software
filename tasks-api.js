import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ ok: true, tasks: [] })
})

router.post('/', (req, res) => {
  const task = {
    id: `task_${Date.now()}`,
    ...req.body,
    createdAt: new Date().toISOString(),
  }

  res.status(201).json({ ok: true, task })
})

export { router as tasksRouter }
