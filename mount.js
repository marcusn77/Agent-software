/**
 * Mount all voice calling routes into your existing Nova/SES Express app.
 *
 * In your main app.js / server.js, add:
 *
 *   import { mountVoiceRoutes } from './crm-intake/src/mount.js'
 *   mountVoiceRoutes(app)
 */

import { callsRouter } from './routes/calls.js'
import { callHistoryRouter } from './call-history-api.js'
import { tasksRouter } from './tasks-api.js'

export function mountVoiceRoutes(app, prefix = '/api/calls') {
  app.use(prefix, callsRouter)
  app.use('/api/call-history', callHistoryRouter)
  app.use('/api/tasks', tasksRouter)

  console.log(`[voice] Intake webhook  → ${prefix}`)
  console.log(`[voice] Call history    → /api/call-history`)
  console.log(`[voice] Task queue      → /api/tasks`)
}
