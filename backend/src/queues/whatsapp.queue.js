import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'
import { sendWhatsAppMessage } from '../lib/whatsapp.js'

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
const queueConnection = new IORedis(redisUrl, { maxRetriesPerRequest: null })
const workerConnection = new IORedis(redisUrl, { maxRetriesPerRequest: null })

/**
 * WHATSAPP MESSAGE QUEUE
 * - Organise messages f queue
 * - Ma ysiftch bzaaf messages f nfs w9t (bash WhatsApp ma yblock numero)
 * - 3awed ysift message ila fshel
 */
export const whatsappQueue = new Queue('whatsapp-messages', {
  connection: queueConnection,
  defaultJobOptions: {
    attempts: 3, // 3awed 3 mrat ila fshel
    backoff: {
      type: 'exponential', // Tsenna ktar kol mera (2s, 4s, 8s)
      delay: 2000, // Awel delay = 2 secondes
    },
    removeOnComplete: 100, // 7fed ghir 100 jobs complétés
    removeOnFail: 100, // 7fed ghir 100 jobs failed
  },
})

/**
 * Ajouter message l queue
 * @param {Object} data - {phone, text, type}
 * @returns {Promise<Job>}
 */
export async function enqueueWhatsAppMessage({ phone, text, type }) {
  // Priority dyal messages:
  // - OTP messages = priority 1 (urgent)
  // - Normal messages = priority 5 (normal)
  const priority = type?.includes('otp') ? 1 : 5;
  
  return whatsappQueue.add(
    type || 'message',
    { phone, text },
    {
      priority,
      // Delay bash ma ysiftch bzaaf messages f nfs w9t
      // Chaque message ghaytdir 2 secondes delay
      delay: 2000,
    }
  );
}

/**
 * WORKER - Background process li kaysift messages
 * - Concurrency = 2 (ghir 2 messages f nfs w9t)
 * - Bash ma yblockch numero dyal WhatsApp
 */
export const whatsappWorker = new Worker(
  'whatsapp-messages',
  async (job) => {
    console.log(`📤 Sending WhatsApp message to ${job.data.phone}`);
    
    try {
      await sendWhatsAppMessage(job.data);
      console.log(`✅ Message sent successfully to ${job.data.phone}`);
    } catch (error) {
      console.error(`❌ Failed to send message to ${job.data.phone}:`, error.message);
      throw error; // Throw bash y3awed ysift
    }
  },
  {
    connection: workerConnection,
    concurrency: 2, // Ghir 2 messages f nfs w9t (ma yblokasch numero)
    limiter: {
      max: 10, // Maximum 10 messages
      duration: 60000, // F 1 minute (60 seconds)
    },
  }
)

whatsappWorker.on('completed', (job) => {
  console.log(`✅ WhatsApp job ${job.id} completed successfully`)
})

whatsappWorker.on('failed', (job, error) => {
  console.error(`❌ WhatsApp job ${job?.id || 'unknown'} failed:`, error.message)
  
  // Ila fshel 3 mrat, log it
  if (job && job.attemptsMade >= 3) {
    console.error(`🚨 Job ${job.id} failed after 3 attempts. Giving up.`)
  }
})

whatsappWorker.on('error', (error) => {
  console.error('❌ Worker error:', error)
})

// Log queue statistics kol 30 seconds
setInterval(async () => {
  try {
    const waiting = await whatsappQueue.getWaitingCount()
    const active = await whatsappQueue.getActiveCount()
    const failed = await whatsappQueue.getFailedCount()
    
    if (waiting > 0 || active > 0 || failed > 0) {
      console.log(`📊 Queue Stats: Waiting=${waiting}, Active=${active}, Failed=${failed}`)
    }
  } catch (error) {
    // Silent error
  }
}, 30000)

