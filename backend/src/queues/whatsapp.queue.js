import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { sendWhatsAppMessage } from '../lib/whatsapp.js'

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const queueConnection = new IORedis(redisUrl, { maxRetriesPerRequest: null })
const workerConnection = new IORedis(redisUrl, { maxRetriesPerRequest: null })

export const whatsappQueue = new Queue('whatsapp-messages', {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 100,
  },
})

export async function enqueueWhatsAppMessage({ phone, text, type }) {
  return whatsappQueue.add(type || 'message', { phone, text })
}

export const whatsappWorker = new Worker(
  'whatsapp-messages',
  async (job) => {
    await sendWhatsAppMessage(job.data)
  },
  { connection: workerConnection, concurrency: 5 },
)

whatsappWorker.on('completed', (job) => {
  console.log(`WhatsApp job ${job.id} sent successfully`)
})

whatsappWorker.on('failed', (job, error) => {
  console.error(`WhatsApp job ${job?.id || 'unknown'} failed:`, error.message)
})
