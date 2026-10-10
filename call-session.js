import pino from 'pino'

const logger = pino({ name: 'CallSession' })

export class CallSession {
  constructor({ callSid, leadId, leadName, leadContext, ws, agentConfig }) {
    this.callSid = callSid
    this.leadId = leadId
    this.leadName = leadName ?? 'there'
    this.leadContext = leadContext ?? ''
    this.ws = ws
    this.agentConfig = agentConfig
    this.outcome = 'in_progress'
    this.startedAt = new Date()
    this.streamSid = null
  }

  async onStart(streamSid) {
    this.streamSid = streamSid
    logger.info({ callSid: this.callSid, streamSid, leadId: this.leadId }, 'Call session started')

    // TODO: initialize LLM/voice pipeline here
    // Example: connect to your TTS/STT or AI orchestration service
  }

  onAudio(payload) {
    // TODO: decode media payload from Twilio and forward into your AI pipeline
    // payload is the base64-encoded audio chunk
    logger.debug({ callSid: this.callSid, payloadLength: payload?.length ?? 0 }, 'Audio chunk received')
  }

  async onStop() {
    logger.info({ callSid: this.callSid, leadId: this.leadId, outcome: this.outcome }, 'Call session stopped')

    // TODO: flush transcript and finalize CRM update / task creation
  }
}
