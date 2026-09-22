import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import CodeSlots from '../../components/common/CodeSlots.jsx'
import Stepper, { Step } from '../../components/auth/Stepper.jsx'
import { apiRequest } from '../../services/authService.js'
import { isValidPhoneNumber, getPhoneValidationError } from '../../lib/validation.js'

const inputClass = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-neutral-500 outline-none transition focus:border-[#22C55E] focus:bg-black/50 focus:ring-1 focus:ring-[#22C55E]'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', phone: '', code: '', password: '', confirmPassword: '' })
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
        const normalizedName = form.name.trim()
        const normalizedPhone = form.phone.trim()

        if (normalizedName.length < 3) {
          setError(t('auth.register.nameInvalid'))
          return false
        }

        // Use validation utility
        if (!isValidPhoneNumber(normalizedPhone)) {
          setError(getPhoneValidationError(normalizedPhone, t))
          return false
        }

        setForm((currentForm) => ({ ...currentForm, name: normalizedName, phone: normalizedPhone }))

        if (!normalizedName || !normalizedPhone) {
          setError(t('auth.register.detailsRequired'))
          return false
        }

        await apiRequest('/api/auth/register/request-otp', {
          method: 'POST',
          body: JSON.stringify({ name: normalizedName, phone: normalizedPhone }),
        })
        return true
      }

      if (step === 2) {
        if (!/^\d{6}$/.test(form.code)) {
          setError(t('auth.register.otpInvalid'))
          return false
        }

        await apiRequest('/api/auth/register/verify-otp', {
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

  async function completeRegistration() {
    setError('')

    if (!form.password || form.password.length < 8) {
      setError(t('auth.register.passwordInvalid'))
      return
    }

    if (form.password !== form.confirmPassword) {
      setError(form.password ? t('auth.register.passwordMismatch') : t('auth.register.passwordRequired'))
      return
    }

    setLoading(true)
    try {
      await apiRequest('/api/auth/register/complete', {
        method: 'POST',
        body: JSON.stringify({ phone: form.phone.trim(), code: form.code, password: form.password }),
      })
      navigate('/login', { state: { toast: t('auth.register.success') }, replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t('auth.register.title')} subtitle={t('auth.register.subtitle')} loading={loading} toast={error}>

      <Stepper
        initialStep={1}
        onBeforeNext={handleBeforeNext}
        onFinalStepCompleted={completeRegistration}
        backButtonText={t('auth.register.back')}
        nextButtonText={t('auth.register.next')}
        completeButtonText={t('auth.register.submit')}
      >
        <Step>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.register.name')}</label>
              <input name="name" type="text" value={form.name} onChange={updateField} required className={inputClass} placeholder={t('auth.register.namePlaceholder')} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.register.phone')}</label>
              <input name="phone" type="tel" value={form.phone} onChange={updateField} required className={inputClass} placeholder={t('auth.register.phonePlaceholder')} />
            </div>
          </div>
        </Step>

        <Step>
          <div>
            <p className="text-sm leading-6 text-neutral-400">{t('auth.register.otpSubtitle', { phone: form.phone })}</p>
            <label className="mb-2 mt-6 block text-sm font-medium text-neutral-300">{t('auth.register.otp')}</label>
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
              <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.register.password')}</label>
              <input name="password" type="password" value={form.password} onChange={updateField} required className={inputClass} placeholder={t('auth.register.passwordPlaceholder')} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.register.confirmPassword')}</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} required className={inputClass} placeholder={t('auth.register.confirmPasswordPlaceholder')} />
            </div>
          </div>
        </Step>
      </Stepper>

      <div className="mt-6 text-center text-sm font-medium">
        <button type="button" onClick={() => navigate('/login')} className="text-[#22C55E] transition-colors hover:text-[#4ADE80]">{t('auth.register.loginLink')}</button>
      </div>
    </AuthLayout>
  )
}
