/**
 * DB client stub — replace with your actual Prisma/Drizzle/Knex client.
 *
 * The calls router expects these collections:
 *
 *   db.leads           — your leads/contacts table
 *   db.callLogs        — one row per call attempt
 *   db.callTranscripts — one row per call with full transcript JSON
 *   db.tasks           — follow-up task queue
 *
 * Prisma schema additions needed (add to your existing schema.prisma):
 *
 *   model CallLog {
 *     id        String   @id @default(cuid())
 *     callSid   String   @unique
 *     leadId    String
 *     outcome   String
 *     duration  Int      @default(0)
 *     endedAt   DateTime
 *     createdAt DateTime @default(now())
 *     updatedAt DateTime @updatedAt
 *     lead      Lead     @relation(fields: [leadId], references: [id])
 *   }
 *
 *   model CallTranscript {
 *     id        String   @id @default(cuid())
 *     callSid   String   @unique
 *     leadId    String
 *     lines     String   // JSON array of { role, text, ts }
 *     messages  String   // JSON array of LLM message history
 *     createdAt DateTime @default(now())
 *     lead      Lead     @relation(fields: [leadId], references: [id])
 *   }
 *
 *   model Task {
 *     id          String   @id @default(cuid())
 *     leadId      String
 *     type        String
 *     title       String
 *     description String?
 *     dueAt       DateTime
 *     priority    String   @default("medium")
 *     completedAt DateTime?
 *     createdAt   DateTime @default(now())
 *     lead        Lead     @relation(fields: [leadId], references: [id])
 *   }
 *
 * Fields to add to your existing Lead model:
 *   callCount    Int      @default(0)
 *   lastContactedAt DateTime?
 *   dnc          Boolean  @default(false)
 *   invalidPhone Boolean  @default(false)
 *   status       String   @default("new")
 *   // status values: new | called | callback_requested | email_requested |
 *   //                meeting_booked | voicemail_left | not_interested |
 *   //                no_answer | max_attempts | wrong_number
 */

// Swap this import for your real client:
// import { PrismaClient } from '@prisma/client'
// const db = new PrismaClient()

const db = null  // replace with your Prisma/Drizzle instance

export default db
