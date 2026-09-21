export function normalizeWhatsAppNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('0')) return `${process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '212'}${digits.slice(1)}`
  return digits
}

export async function sendWhatsAppMessage({ phone, text }) {
  const baseUrl = (process.env.EVOLUTION_API_URL || 'http://localhost:8080').replace(/\/$/, '')
  const instance = process.env.EVOLUTION_INSTANCE
  const apiKey = process.env.EVOLUTION_API_KEY

  if (!instance || !apiKey) {
    throw new Error('Evolution API is not configured. Set EVOLUTION_INSTANCE and EVOLUTION_API_KEY.')
  }

  const response = await fetch(`${baseUrl}/message/sendText/${encodeURIComponent(instance)}`, {
    method: 'POST',
    headers: {
      apikey: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      number: normalizeWhatsAppNumber(phone),
      text,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Evolution API message failed (${response.status}): ${body}`)
  }

  return response.json()
}

export function registrationOtpMessage({ code, expiresAt }) {
  return `UpLife verification code: ${code}. This code expires at ${new Date(expiresAt).toLocaleTimeString()}. Do not share it.`
}

export function passwordResetOtpMessage({ code, expiresAt }) {
  return `UpLife password reset code: ${code}. This code expires at ${new Date(expiresAt).toLocaleTimeString()}. Do not share it.`
}
