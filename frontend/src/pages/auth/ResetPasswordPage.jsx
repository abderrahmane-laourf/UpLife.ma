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
<<<<<<< HEAD
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
=======
>>>>>>> 910f0756070465cf157bfe1805ef612ef0de0b9e

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
<<<<<<< HEAD
              <div className="relative">
                <input 
                  name="newPassword" 
                  type={showNewPassword ? 'text' : 'password'}
                  value={form.newPassword} 
                  onChange={updateField} 
                  required 
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-neutral-500 outline-none transition focus:border-[#22C55E] focus:bg-black/50 focus:ring-1 focus:ring-[#22C55E]"
                  placeholder={t('auth.reset.passwordPlaceholder')} 
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                  {showNewPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.reset.confirmPassword')}</label>
              <div className="relative">
                <input 
                  name="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword} 
                  onChange={updateField} 
                  required 
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-white placeholder-neutral-500 outline-none transition focus:border-[#22C55E] focus:bg-black/50 focus:ring-1 focus:ring-[#22C55E]"
                  placeholder={t('auth.reset.confirmPasswordPlaceholder')} 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
=======
              <input name="newPassword" type="password" value={form.newPassword} onChange={updateField} required className={inputClass} placeholder={t('auth.reset.passwordPlaceholder')} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-300">{t('auth.reset.confirmPassword')}</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={updateField} required className={inputClass} placeholder={t('auth.reset.confirmPasswordPlaceholder')} />
>>>>>>> 910f0756070465cf157bfe1805ef612ef0de0b9e
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
