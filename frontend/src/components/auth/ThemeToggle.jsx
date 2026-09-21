import { useEffect, useState } from 'react'

const STORAGE_KEY = 'uplife-theme'

function getInitialTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return 'dark'
}

export default function ThemeToggle({ onThemeChange }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
    onThemeChange?.(theme)
  }, [onThemeChange, theme])

  function toggleTheme() {
    setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] text-neutral-200 shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#22C55E]/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/60"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <span className={`absolute transition-all duration-500 ease-out ${isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} aria-hidden="true">
        <svg className="h-5 w-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3.5" />
          <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
        </svg>
      </span>
      <span className={`absolute transition-all duration-500 ease-out ${isDark ? '-rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} aria-hidden="true">
        <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.5A8.5 8.5 0 0 1 8.5 3 8.5 8.5 0 1 0 21 15.5Z" />
        </svg>
      </span>
    </button>
  )
}
