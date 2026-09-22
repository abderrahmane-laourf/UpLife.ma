import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import CodeSlots from '../../components/common/CodeSlots.jsx'
import Stepper, { Step } from '../../components/auth/Stepper.jsx'
import { apiRequest } from '../../services/authService.js'
import { isValidPhoneNumber, getPhoneValidationError } from '../../lib/validation.js'

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-500 outline-none transition focus:border-[#22C55E] focus:bg-black/50 focus:ring-1 focus:ring-[#22C55E]'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ phone: '', code: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpStatus, setOtpStatus] = useState('idle')

  function updateField(event) {
    setForm((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }))
    setError('')
  }

  async function handleBeforeNext(step) {
    setError('')
    setLoading(true)

    try {
      if (step === 1) {
        const normalizedPhone = form.phone.trim()

        // Use validation utility
        if (!isValidPhoneNumber(normalizedPhone)) {
          setError(getPhoneValidationError(normalizedPhone, t))
          return false
        }

        setForm((currentForm) => ({ ...currentForm, phone: normalizedPhone }))

        await apiRequest('/api/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ phone: normalizedPhone }),
        })
        return true
      }

      if (step === 2) {
        if (!/^\d{6}$/.test(form.code)) {
          setError(t('auth.reset.otpInvalid'))
          return false
        }

        // ✅ Verify OTP with backend before moving to next step
        await apiRequest('/api/auth/verify-password-otp', {
          method: 'POST',
          body: JSON.stringify({ phone: form.phone.trim(), code: form.code }),
        })
        return true
      }

      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  async function completePasswordReset() {
    setError('')

    if (!form.newPassword || form.newPassword.length < 8) {
      setError(t('auth.reset.passwordInvalid'))
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setError(form.newPassword ? t('auth.reset.passwordMismatch') : t('auth.reset.passwordRequired'))
      return
    }

    setLoading(true)
    try {
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ 
          phone: form.phone.trim(), 
          code: form.code, 
          newPassword: form.newPassword 
        }),
      })
      navigate('/login', { state: { toast: t('auth.reset.success') }, replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.reset.title')} subtitle={t('auth.reset.subtitle')} loading={loading} toast={error}>

      <Stepper
        initialStep={1}
        onBeforeNext={handleBeforeNext}
        onFinalStepCompleted={completePasswordReset}
        backButtonText={t('auth.reset.back')}
        nextButtonText={t('auth.reset.next')}
        completeButtonText={t('auth.reset.submit')}
      >
        <Step>
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.reset.phone')}</label>
            <input name="phone" type="tel" value={form.phone} onChange={updateField} required className={inputClass} placeholder={t('auth.reset.phonePlaceholder')} />
          </div>
        </Step>

        <Step>
          <div>
            <p className="text-sm leading-6 text-neutral-400">{t('auth.reset.otpSubtitle', { phone: form.phone })}</p>
            <label className="mb-2 mt-6 block text-sm font-medium text-neutral-300">{t('auth.reset.otp')}</label>
            <div className="flex justify-center">
              <CodeSlots
                length={6}
                value={form.code}
                status={otpStatus}
                onChange={(code) => {
                  setForm((currentForm) => ({ ...currentForm, code }))
                  setOtpStatus('idle')
                  setError('')
                }}
                onComplete={(code) => {
                  setForm((currentForm) => ({ ...currentForm, code }))
                }}
                disabled={loading}
                autoFocus
                accentColor="#22C55E"
                slotSize={56}
                gap={12}
              />
            </div>
          </div>
        </Step>

        <Step>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.reset.password')}</label>
              <input name="newPassword" type="password" value={form.newPassword} onChange={updateField} required className={inputClass} placeholder={t('auth.reset.passwordPlaceholder')} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.reset.confirmPassword')}</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} required className={inputClass} placeholder={t('auth.reset.confirmPasswordPlaceholder')} />
            </div>
          </div>
        </Step>
      </Stepper>

      <div className="mt-6 text-center text-sm font-medium">
        <button type="button" onClick={() => navigate('/login')} className="text-[#22C55E] transition-colors hover:text-[#4ADE80]">{t('auth.reset.loginLink')}</button>
      </div>
    </AuthLayout>
  )
}
