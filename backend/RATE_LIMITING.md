# 🛡️ Rate Limiting & WhatsApp Queue Protection

## 📚 Overview

Had l'système kayt7akem f:
1. **Rate Limiting** - Ma ykhlich user ysaweb bzaaf requests
2. **WhatsApp Queue** - Ma yblockch numero dyal WhatsApp

---

## 🔐 Rate Limiting Rules

### 1. Login
```
- Maximum: 5 attempts
- Window: 15 minutes
- Key: Phone number
- Error: "Too many login attempts. Please try again in 15 minutes."
```

**Example:**
```javascript
// User ysaweb login 5 mrat
POST /api/auth/login { phone: "+212600000000", password: "..." }
POST /api/auth/login { phone: "+212600000000", password: "..." }
POST /api/auth/login { phone: "+212600000000", password: "..." }
POST /api/auth/login { phone: "+212600000000", password: "..." }
POST /api/auth/login { phone: "+212600000000", password: "..." }

// 6ème attempt → ❌ 429 Too Many Requests
POST /api/auth/login { phone: "+212600000000", password: "..." }
// Response: "Too many login attempts. Please try again in 15 minutes."
```

---

### 2. Register OTP Request
```
- Maximum: 3 attempts
- Window: 10 minutes
- Key: Phone number
- Error: "Too many registration attempts. Please try again in 10 minutes."
```

**Why?** Bash ma ysiftch bzaaf OTP messages l WhatsApp

---

### 3. Password Reset OTP Request
```
- Maximum: 3 attempts
- Window: 10 minutes
- Key: Phone number
- Error: "Too many password reset attempts. Please try again in 10 minutes."
```

---

### 4. OTP Verification
```
- Maximum: 5 attempts
- Window: 10 minutes
- Key: Phone number
- Error: "Too many verification attempts. Please try again in 10 minutes."
```

**Why?** User kayt7awal ygues OTP codes bzaaf

---

## 📱 WhatsApp Queue Protection

### Configuration

```javascript
Queue Settings:
- Priority: OTP messages = 1 (urgent), Normal = 5
- Delay: 2 seconds between messages
- Attempts: 3 retries on failure
- Backoff: Exponential (2s, 4s, 8s)

Worker Settings:
- Concurrency: 2 messages at same time (ma yblokasch)
- Rate Limit: 10 messages per minute
```

### How it Works

```
User 1 requests OTP → Queue (priority 1, delay 2s)
User 2 requests OTP → Queue (priority 1, delay 2s)
User 3 requests OTP → Queue (priority 1, delay 2s)
                             ↓
                    Worker picks 2 at time
                             ↓
                    Sends with 2s delay
                             ↓
                    Max 10 per minute
```

### Protection Against WhatsApp Ban

1. **Concurrency = 2**: Ma ysiftch bzaaf messages f nfs w9t
2. **Delay = 2s**: Tsenna 2 secondes bin kol message
3. **Rate Limit**: 10 messages per minute maximum
4. **Retry Logic**: Ila fshel, 3awed 3 mrat b delays (2s, 4s, 8s)

---

## 🧪 Testing Rate Limits

### Test Login Rate Limit
```bash
# Send 6 requests quickly
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"phone":"212600000000","password":"test123"}'
  echo "\n"
done

# 6th request should return 429
```

### Check Rate Limit Headers
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"212600000000","password":"test"}' \
  -v

# Headers:
# X-RateLimit-Limit: 5
# X-RateLimit-Remaining: 4
# X-RateLimit-Reset: 900 (seconds)
```

### Reset Rate Limit (For Testing)
```javascript
// In Node.js console
import { resetRateLimit } from './src/lib/rateLimiter.js'
await resetRateLimit('212600000000')
```

---

## 📊 Monitoring Queue

### Check Queue Stats
```bash
# Redis CLI
docker exec -it uplife-redis redis-cli

# Get queue stats
KEYS "bull:whatsapp-messages:*"

# Get waiting jobs
LLEN "bull:whatsapp-messages:wait"

# Get active jobs
LLEN "bull:whatsapp-messages:active"

# Get failed jobs
ZCARD "bull:whatsapp-messages:failed"
```

### View Queue in Code
```javascript
import { whatsappQueue } from './src/queues/whatsapp.queue.js'

const waiting = await whatsappQueue.getWaitingCount()
const active = await whatsappQueue.getActiveCount()
const failed = await whatsappQueue.getFailedCount()

console.log({ waiting, active, failed })
```

---

## 🔧 Configuration

### Change Rate Limits
Edit `backend/src/lib/rateLimiter.js`:

```javascript
export const RATE_LIMITS = {
  LOGIN: {
    maxRequests: 10,        // Beddel 5 → 10
    windowSeconds: 30 * 60, // Beddel 15min → 30min
    message: 'Your custom message',
  },
}
```

### Change Queue Settings
Edit `backend/src/queues/whatsapp.queue.js`:

```javascript
// Worker concurrency
export const whatsappWorker = new Worker(
  'whatsapp-messages',
  async (job) => { ... },
  {
    concurrency: 5, // Beddel 2 → 5 (more messages at once)
    limiter: {
      max: 20,      // Beddel 10 → 20 messages
      duration: 60000, // Per minute
    },
  }
)
```

---

## ✅ Summary

### Rate Limiting
- ✅ Login: 5 attempts / 15min
- ✅ Register OTP: 3 attempts / 10min
- ✅ Reset Password OTP: 3 attempts / 10min
- ✅ OTP Verify: 5 attempts / 10min

### WhatsApp Queue
- ✅ Concurrency: 2 messages at time
- ✅ Rate: 10 messages per minute
- ✅ Retry: 3 attempts with backoff
- ✅ Priority: OTP messages first
- ✅ Delay: 2 seconds between messages

### Benefits
- 🛡️ **Protection**: Against brute force attacks
- 📱 **No WhatsApp Ban**: Controlled message rate
- 🔄 **Reliability**: Retry failed messages
- 📊 **Monitoring**: Queue stats every 30s
- ⚡ **Performance**: Priority for important messages

---

## 🚨 Troubleshooting

### Rate Limit Not Working
```bash
# Check Redis connection
docker exec -it uplife-redis redis-cli PING
# Should return: PONG

# Check rate limit keys
docker exec -it uplife-redis redis-cli KEYS "ratelimit:*"
```

### Queue Not Processing
```bash
# Check worker logs
# Should see: "📤 Sending WhatsApp message..."

# Check queue connection
docker exec -it uplife-redis redis-cli CLIENT LIST
```

### WhatsApp Messages Not Sending
```bash
# Check Evolution API
curl http://localhost:8080/instance/fetchInstances \
  -H "apikey: uplife-evolution-local-key-change-me"

# Check if instance connected
# connectionStatus should be "open"
```
