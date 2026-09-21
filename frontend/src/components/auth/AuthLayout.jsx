import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ThemeToggle from './ThemeToggle.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import Toast from './Toast.jsx'
import TopLoader from './TopLoader.jsx'

const darkAuthImage = '/authimage.png'
const lightAuthImage = '/authimage_lightmode.png'

export default function AuthLayout({ title, subtitle, children, loading = false, toast, toastType = 'error' }) {
  const { t } = useTranslation()
  const [theme, setTheme] = useState(() => localStorage.getItem('uplife-theme') || 'dark')

  return (
    <main className={`auth-shell theme-${theme} relative flex h-screen w-full bg-[#050505] text-white selection:bg-[#22C55E] selection:text-black`}>
      <TopLoader visible={loading} />
      <Toast message={toast} type={toastType} />
      
      {/* Grid me9soum 3la 2 - 50% left / 50% right */}
      <div className="relative z-10 grid h-full w-full lg:grid-cols-2">
        
        {/* === JIHA DYAL L'IMAGE (LEFT 50%) === */}
        {/* Hna l'blan: 7ayedna ga3 l'padding w border, 3tinaha overflow-hidden */}
        <section className="relative hidden h-full w-full flex-col justify-between overflow-hidden lg:flex">
          
          {/* L'IMAGE KAMLA: absolute inset-0 katkhli tsawira tched l'50% khaaamla */}
          <img
            src={theme === 'light' ? lightAuthImage : darkAuthImage}
            alt="UpLife" 
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          />
          
          {/* Image contrast overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/20 to-black/40" />

          <div className="relative z-10 mt-auto p-8 sm:p-12">
            <p className="max-w-md text-4xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
              {t('auth.brand.title')}
            </p>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-neutral-200 drop-shadow-md">
              {t('auth.brand.subtitle')}
            </p>
          </div>
        </section>


        {/* === JIHA DYAL L'FORM (RIGHT 50%) === */}
        {/* Hada b9a kima howa, mcentry w nadi */}
        <section className="auth-panel relative flex h-full w-full flex-col items-center justify-center p-6 sm:p-12">
          
          {/* Switcher lfou9 3la limn */}
          <div className="absolute right-6 top-6 flex items-center gap-2 sm:right-8 sm:top-8">
            <ThemeToggle onThemeChange={setTheme} />
            <LanguageSwitcher />
          </div>

          {/* Form Wrapper */}
          <div className="w-full max-w-[420px]">
            <h1 className="auth-title text-4xl font-extrabold tracking-tight text-white">{title}</h1>
            <p className="auth-subtitle mt-3 text-base text-neutral-400">{subtitle}</p>
            
            <div className="mt-10 w-full">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}