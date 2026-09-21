import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import { apiRequest } from '../../services/authService.js'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      navigate('/reset-password', { state: { email } })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Forgot password" subtitle="Enter your email to receive a reset code">

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="you@example.com" />
          </div>

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Sending...' : 'Send reset code'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          <button type="button" onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-700">Back to login</button>
        </div>
    </AuthLayout>
  )
}
