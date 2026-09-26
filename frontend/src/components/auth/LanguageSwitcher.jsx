import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { changeLanguage } from '../../i18n/index.js'

const languages = [
  { value: 'darija', label: 'Darija', country: 'ma', countryName: 'Morocco' },
  { value: 'fr', label: 'Français', country: 'fr', countryName: 'France' },
  { value: 'en', label: 'English', country: 'us', countryName: 'United States' },
]

function Flag({ language }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${language.country}.png`}
      alt={language.countryName}
      className="h-4 w-6 rounded-sm object-cover"
      loading="lazy"
    />
  )
}

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const switcherRef = useRef(null)
  const currentLanguage = languages.find((language) => language.value === i18n.language) || languages[0]

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!switcherRef.current?.contains(event.target)) setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  function selectLanguage(language) {
    changeLanguage(language)
    setOpen(false)
  }

  return (
    <div ref={switcherRef} className="relative z-30">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="language-trigger flex min-w-[128px] items-center justify-between gap-3 rounded-xl border px-3 py-2 text-xs font-medium shadow-lg backdrop-blur-md transition border-gray-200 bg-white text-gray-700 shadow-gray-200/50 hover:border-[#22C55E]/60 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-200 dark:shadow-black/10 dark:hover:border-[#22C55E]/60 dark:hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('common.language')}
      >
        <span className="flex items-center gap-2"><Flag language={currentLanguage} />{currentLanguage.label}</span>
        <span className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>

      {open && (
        <div className="language-menu absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border p-1.5 shadow-2xl backdrop-blur-xl border-gray-200 bg-white shadow-gray-200/50 dark:border-white/10 dark:bg-[#151918]/95 dark:shadow-black/40" role="listbox">
          {languages.map((language) => (
            <button
              key={language.value}
              type="button"
              role="option"
              aria-selected={i18n.language === language.value}
              onClick={() => selectLanguage(language.value)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition ${i18n.language === language.value ? 'bg-[#22C55E]/15 text-[#16A34A] dark:text-[#86EFAC]' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white'}`}
            >
              <span className="flex items-center gap-2"><Flag language={language} />{language.label}</span>
              {i18n.language === language.value && <span className="text-[#22C55E]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
