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
        className="language-trigger flex min-w-[128px] items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-neutral-200 shadow-lg shadow-black/10 backdrop-blur-md transition hover:border-[#22C55E]/60 hover:bg-white/10"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('common.language')}
      >
        <span className="flex items-center gap-2"><Flag language={currentLanguage} />{currentLanguage.label}</span>
        <span className={`text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>

      {open && (
        <div className="language-menu absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#151918]/95 p-1.5 shadow-2xl shadow-black/40 backdrop-blur-xl" role="listbox">
          {languages.map((language) => (
            <button
              key={language.value}
              type="button"
              role="option"
              aria-selected={i18n.language === language.value}
              onClick={() => selectLanguage(language.value)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs transition ${i18n.language === language.value ? 'bg-[#22C55E]/15 text-[#86EFAC]' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}
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
