import 'dotenv/config'

export const config = {
  server: {
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? '0.0.0.0',
  },
  app: {
    businessName: process.env.BUSINESS_NAME ?? 'Summit Field Services',
    agentName: process.env.AGENT_NAME ?? 'Alex',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER ?? '',
  },
  crm: {
    webhookUrl: process.env.CRM_WEBHOOK_URL ?? '',
  },
  queue: {
    defaultConcurrency: Number(process.env.QUEUE_CONCURRENCY ?? 2),
  },
}
