import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.js'
import fr from './locales/fr.js'
import darija from './locales/darija.js'

const supportedLanguages = ['darija', 'fr', 'en']
const savedLanguage = localStorage.getItem('uplife-language')
const initialLanguage = supportedLanguages.includes(savedLanguage) ? savedLanguage : 'darija'

i18n
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, fr: { translation: fr }, darija: { translation: darija } },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export function changeLanguage(language) {
  if (!supportedLanguages.includes(language)) return
  localStorage.setItem('uplife-language', language)
  document.documentElement.lang = language === 'darija' ? 'ar-MA' : language
  document.documentElement.dir = 'ltr'
  i18n.changeLanguage(language)
}

changeLanguage(initialLanguage)

export default i18n
