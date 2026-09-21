import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import OtpInput from '../../components/auth/OtpInput.jsx'
import { apiRequest } from '../../services/authService.js'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const location = useLocation()
  const [form, setForm] = useState({ phone: location.state?.phone || '', code: '', newPassword: '' })
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
    <AuthLayout title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')} loading={loading} toast={error}>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.reset.phone')}</label>
            <input name="phone" type="tel" value={form.phone} onChange={updateField} required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-500 outline-none transition focus:border-[#22C55E] focus:bg-black/50 focus:ring-1 focus:ring-[#22C55E]" placeholder={t('auth.reset.phonePlaceholder')} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.reset.password')}</label>
            <input name="newPassword" type="password" value={form.newPassword} onChange={updateField} required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-500 outline-none transition focus:border-[#22C55E] focus:bg-black/50 focus:ring-1 focus:ring-[#22C55E]" placeholder={t('auth.reset.passwordPlaceholder')} />
          </div>

          <OtpInput value={form.code} onChange={(code) => setForm({ ...form, code })} disabled={loading} />

          {message && <p className="rounded-xl border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-3 text-sm text-[#86EFAC]">{message}</p>}

          <button type="submit" disabled={loading} className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-4 py-3.5 font-bold text-black transition hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? t('auth.reset.loading') : t('auth.reset.submit')}
          </button>
        </form>
    </AuthLayout>
  )
}
