import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import { apiRequest } from '../../services/authService.js'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: location.state?.email || '', code: '', newPassword: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const data = await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setMessage(data.message)
      setTimeout(() => navigate('/login'), 800)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter the code received by email">

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input name="email" type="email" value={form.email} onChange={updateField} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">OTP code</label>
            <input name="code" type="text" value={form.code} onChange={updateField} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="123456" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
            <input name="newPassword" type="password" value={form.newPassword} onChange={updateField} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="••••••••" />
          </div>

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
    </AuthLayout>
  )
}
