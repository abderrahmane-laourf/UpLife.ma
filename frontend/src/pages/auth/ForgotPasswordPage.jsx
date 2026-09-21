import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import { apiRequest } from '../../services/authService.js'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await apiRequest('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      })
      navigate('/reset-password', { state: { phone } })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.forgot.title')} subtitle={t('auth.forgot.subtitle')} loading={loading} toast={error}>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.forgot.phone')}</label>
            <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-500 outline-none transition focus:border-[#22C55E] focus:bg-black/50 focus:ring-1 focus:ring-[#22C55E]" placeholder={t('auth.forgot.phonePlaceholder')} />
          </div>

          <button type="submit" disabled={loading} className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-4 py-3.5 font-bold text-black transition hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? t('auth.forgot.loading') : t('auth.forgot.submit')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-medium">
          <button type="button" onClick={() => navigate('/login')} className="text-[#22C55E] transition-colors hover:text-[#4ADE80]">{t('auth.forgot.loginLink')}</button>
        </div>
    </AuthLayout>
  )
}
