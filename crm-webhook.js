export async function notifyCRM(payload) {
  const { callSid, leadId, outcome, duration, transcript, messages, endedAt } = payload

  console.log('[crm-webhook] Sending CRM update', {
    callSid,
    leadId,
    outcome,
    duration,
    transcriptCount: transcript?.length ?? 0,
    endedAt,
  })

  // Replace this stub with your real CRM integration.
  // Example: fetch('/api/crm/webhook', { method: 'POST', body: JSON.stringify(payload) })

  return {
    ok: true,
    callSid,
    leadId,
    outcome,
    message: 'CRM webhook stub processed successfully',
  }
}
