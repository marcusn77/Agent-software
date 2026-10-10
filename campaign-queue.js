import pino from 'pino'

const logger = pino({ name: 'campaign-queue' })

let workerStarted = false

export async function startWorker(agentConfig = {}) {
  if (workerStarted) return
  workerStarted = true

  logger.info({ agentConfig }, 'Campaign worker started')

  // Replace this with a real queue consumer / cron worker.
  // For now, this is a no-op background loop that logs pending work.
  setInterval(() => {
    logger.debug('Campaign worker heartbeat')
  }, 30000)
}

export async function enqueueLead({
  leadId,
  phoneNumber,
  leadName,
  leadContext,
  campaignId,
  scheduleAt,
}) {
  const job = {
    id: `job_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    leadId,
    phoneNumber,
    leadName,
    leadContext,
    campaignId,
    scheduleAt: scheduleAt ?? new Date(),
    createdAt: new Date().toISOString(),
  }

  logger.info({ job }, 'Lead queued for calling')
  return job.id
}

export async function bulkEnqueueLeads(leads = []) {
  for (const lead of leads) {
    await enqueueLead({
      leadId: lead.leadId,
      phoneNumber: lead.phoneNumber,
      leadName: lead.leadName,
      leadContext: lead.leadContext,
      campaignId: lead.campaignId,
      scheduleAt: lead.scheduleAt ? new Date(lead.scheduleAt) : undefined,
    })
  }

  return leads.length
}
