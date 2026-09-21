import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import { apiRequest, saveAccessToken } from '../../services/authService.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })

      saveAccessToken(data.accessToken)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Login" subtitle="Welcome back to UpLife">

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input name="email" type="email" value={form.email} onChange={updateField} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
            <input name="password" type="password" value={form.password} onChange={updateField} required className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-blue-500" placeholder="••••••••" />
          </div>

          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button type="button" onClick={() => navigate('/register')} className="text-blue-600 hover:text-blue-700">Create account</button>
          <button type="button" onClick={() => navigate('/forgot-password')} className="text-slate-600 hover:text-slate-800">Forgot password?</button>
        </div>
    </AuthLayout>
  )
}
