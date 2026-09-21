import { useEffect, useState } from 'react'

const TOAST_TIMEOUT = 4000

export default function Toast({ message, type = 'error' }) {
  const [dismissedMessage, setDismissedMessage] = useState('')

  useEffect(() => {
    if (!message) return undefined
    const timer = window.setTimeout(() => setDismissedMessage(message), TOAST_TIMEOUT)
    return () => window.clearTimeout(timer)
  }, [message])

  if (!message || dismissedMessage === message) return null

  return (
    <div className={`auth-toast auth-toast-${type}`} role="status">
      <span className="auth-toast-progress" aria-hidden="true" />
      <span className="auth-toast-message">{message}</span>
    </div>
  )
}
