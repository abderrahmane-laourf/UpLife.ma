import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout.jsx'
import { apiRequest } from '../../services/authService.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { isValidPhoneNumber, getPhoneValidationError } from '../../lib/validation.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { login } = useAuth()

  const [form, setForm] = useState({ phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
    
    if (event.target.name === 'phone') {
      setPhoneError('')
      setError('')
    }
  }

  function validatePhone() {
    const phone = form.phone.trim()
    
    if (!isValidPhoneNumber(phone)) {
      const errorMsg = getPhoneValidationError(phone, t)
      setPhoneError(errorMsg)
      return false
    }
    
    setPhoneError('')
    return true
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    
    if (!validatePhone()) {
      return
    }
    
    setLoading(true)

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })

      login(data.user, data.accessToken)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout 
      title={t('auth.login.title')} 
      subtitle={t('auth.login.subtitle')} 
      loading={loading} 
      toast={error || location.state?.toast} 
      toastType={error ? 'error' : 'success'}
    >
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        
        {/* WhatsApp phone input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:!text-neutral-300">
            {t('auth.login.phone')}
          </label>
          <input 
            name="phone" 
            type="tel" 
            value={form.phone} 
            onChange={updateField}
            onBlur={validatePhone}
            required 
            className={`w-full rounded-xl border ${phoneError ? 'border-red-500' : 'border-zinc-300 dark:!border-white/10'} bg-white dark:!bg-[#ffffff0a] px-4 py-3 text-zinc-900 dark:!text-white placeholder-zinc-400 dark:!placeholder-neutral-500 outline-none transition-all duration-300 focus:border-[#22C55E] focus:bg-zinc-50 dark:focus:!bg-black/50 focus:ring-1 focus:ring-[#22C55E]`}
            placeholder={t('auth.login.phonePlaceholder')} 
          />
          {phoneError && (
            <p className="mt-2 text-sm text-red-500 dark:!text-red-400">{phoneError}</p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:!text-neutral-300">
            {t('auth.login.password')}
          </label>
          <div className="relative">
            <input 
              name="password" 
              type={showPassword ? 'text' : 'password'} 
              value={form.password} 
              onChange={updateField} 
              required 
              className="w-full rounded-xl border border-zinc-300 dark:!border-white/10 bg-white dark:!bg-[#ffffff0a] px-4 py-3 pr-12 text-zinc-900 dark:!text-white placeholder-zinc-400 dark:!placeholder-neutral-500 outline-none transition-all duration-300 focus:border-[#22C55E] focus:bg-zinc-50 dark:focus:!bg-black/50 focus:ring-1 focus:ring-[#22C55E]" 
              placeholder={t('auth.login.passwordPlaceholder')} 
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:!text-neutral-400 transition-colors hover:text-zinc-900 dark:hover:!text-white focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading || !!phoneError} 
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-4 py-3.5 font-bold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5 animate-spin text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('auth.login.loading')}
            </span>
          ) : (
            t('auth.login.submit')
          )}
        </button>
      </form>

      {/* Bottom Links */}
      <div className="mt-6 flex items-center justify-between text-sm font-medium">
        <button 
          type="button" 
          onClick={() => navigate('/register')} 
          className="text-[#22C55E] transition-colors hover:text-[#4ADE80]"
        >
          {t('auth.login.registerLink')}
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/forgot-password')} 
          className="text-zinc-500 dark:!text-neutral-400 transition-colors hover:text-zinc-900 dark:hover:!text-white"
        >
          {t('auth.login.forgotLink')}
        </button>
      </div>
    </AuthLayout>
  )
}