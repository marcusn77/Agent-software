import Fastify from 'fastify'
import fastifyWs from '@fastify/websocket'
import fastifyFormBody from '@fastify/formbody'
import { config } from './config.js'
import { CallSession } from './call-session.js'
import { notifyCRM } from './crm-webhook.js'
import { startWorker, enqueueLead, bulkEnqueueLeads } from './campaign-queue.js'
import pino from 'pino'

const logger = pino({ name: 'server' })

// In-memory call session store — replace with Redis in production
const activeSessions = new Map()

const agentConfig = {
  businessName: process.env.BUSINESS_NAME ?? 'Summit Field Services',
  agentName: process.env.AGENT_NAME ?? 'Alex',
}

// ─── Fastify Setup ───────────────────────────────────────────────────────────

const app = Fastify({ logger: true })

await app.register(fastifyFormBody)
await app.register(fastifyWs)

// ─── Twilio Webhook: Call Connects ───────────────────────────────────────────
// Twilio POSTs here when the call is answered.
// We return TwiML that opens a bidirectional media stream WebSocket.

app.post('/call/incoming', async (req, reply) => {
  const { leadId, leadName, leadContext, businessName, agentName } = req.query

  const wsUrl = `wss://${req.hostname}/call/media?leadId=${leadId}&leadName=${encodeURIComponent(leadName)}&leadContext=${encodeURIComponent(leadContext ?? '')}`

  // TwiML: open a media stream back to our WebSocket
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${wsUrl}" track="inbound_track">
      <Parameter name="leadId" value="${leadId}"/>
    </Stream>
  </Connect>
</Response>`

  reply.type('text/xml').send(twiml)
})

// ─── Twilio Webhook: AMD (Answering Machine Detection) ───────────────────────
// Twilio posts here when it determines if a human or machine answered.

app.post('/call/amd', async (req, reply) => {
  const { CallSid, AnsweredBy } = req.body
  logger.info({ CallSid, AnsweredBy }, 'AMD result')

  const session = activeSessions.get(CallSid)

  if (AnsweredBy === 'machine_start' || AnsweredBy === 'fax') {
    // Machine answered — trigger voicemail flow in the session
    if (session) {
      session.outcome = 'voicemail'
      // The session will speak the voicemail script and hang up
    }
  }

  reply.send({ ok: true })
})

// ─── Twilio Webhook: Call Status Updates ─────────────────────────────────────

app.post('/call/status', async (req, reply) => {
  const { CallSid, CallStatus, CallDuration } = req.body
  logger.info({ CallSid, CallStatus, CallDuration }, 'Call status update')

  if (CallStatus === 'no-answer' || CallStatus === 'busy') {
    await notifyCRM({
      callSid: CallSid,
      leadId: req.query.leadId,
      outcome: CallStatus === 'no-answer' ? 'no_answer' : 'busy',
      duration: 0,
      transcript: [],
      messages: [],
      endedAt: new Date().toISOString(),
    })
  }

  reply.send({ ok: true })
})

// ─── Media Stream WebSocket ───────────────────────────────────────────────────
// Bidirectional audio stream between Twilio and our server.

app.register(async (fastify) => {
  fastify.get('/call/media', { websocket: true }, async (ws, req) => {
    const { leadId, leadName, leadContext } = req.query

    let session = null

    ws.on('message', async (raw) => {
      let msg
      try {
        msg = JSON.parse(raw.toString())
      } catch {
        return
      }

      switch (msg.event) {
        case 'connected':
          logger.info('WebSocket connected')
          break

        case 'start': {
          const callSid = msg.start.callSid
          const streamSid = msg.start.streamSid

          session = new CallSession({
            callSid,
            leadId,
            leadName: decodeURIComponent(leadName ?? ''),
            leadContext: decodeURIComponent(leadContext ?? ''),
            ws,
            agentConfig,
          })

          activeSessions.set(callSid, session)
          await session.onStart(streamSid)
          break
        }

        case 'media': {
          if (session) {
            session.onAudio(msg.media.payload)
          }
          break
        }

        case 'stop': {
          if (session) {
            await session.onStop()
            activeSessions.delete(session.callSid)
            session = null
          }
          break
        }
      }
    })

    ws.on('close', async () => {
      if (session) {
        await session.onStop()
        activeSessions.delete(session.callSid)
      }
    })

    ws.on('error', (err) => {
      logger.error({ err }, 'WebSocket error')
    })
  })
})

// ─── Campaign API ─────────────────────────────────────────────────────────────

// Enqueue a single lead
app.post('/campaign/dial', async (req, reply) => {
  const { leadId, phoneNumber, leadName, leadContext, campaignId, scheduleAt } = req.body

  if (!leadId || !phoneNumber || !campaignId) {
    return reply.status(400).send({ error: 'leadId, phoneNumber, campaignId required' })
  }

  const jobId = await enqueueLead({
    leadId,
    phoneNumber,
    leadName: leadName ?? 'there',
    leadContext,
    campaignId,
    scheduleAt: scheduleAt ? new Date(scheduleAt) : undefined,
  })

  reply.send({ ok: true, jobId })
})

// Bulk enqueue leads
app.post('/campaign/bulk', async (req, reply) => {
  const { leads } = req.body

  if (!Array.isArray(leads) || leads.length === 0) {
    return reply.status(400).send({ error: 'leads array required' })
  }

  await bulkEnqueueLeads(leads)
  reply.send({ ok: true, count: leads.length })
})

// Health check
app.get('/health', async () => ({ ok: true, activeCalls: activeSessions.size }))

// ─── Start ────────────────────────────────────────────────────────────────────

// Start the campaign queue worker
startWorker(agentConfig)

try {
  await app.listen({ port: config.server.port, host: '0.0.0.0' })
  logger.info(`Server running on port ${config.server.port}`)
} catch (err) {
  logger.error(err)
  process.exit(1)
}
