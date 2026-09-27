import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'

const STORAGE_KEY = 'uplife-theme'

// Get system preference
function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// Get initial theme mode (system/light/dark)
function getInitialTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY)
  if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
    return savedTheme
  }
  return 'system' // Default to system preference
}

// Get actual theme to apply (resolve 'system' to 'light' or 'dark')
function getResolvedTheme(themeMode) {
  if (themeMode === 'system') {
    return getSystemTheme()
  }
  return themeMode
}

export default function ThemeToggle({ onThemeChange }) {
  const [themeMode, setThemeMode] = useState(getInitialTheme)
  const [resolvedTheme, setResolvedTheme] = useState(() => getResolvedTheme(getInitialTheme()))

  useEffect(() => {
    const resolved = getResolvedTheme(themeMode)
    setResolvedTheme(resolved)
    
    // Apply theme to document
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    document.documentElement.dataset.theme = resolved
    localStorage.setItem(STORAGE_KEY, themeMode)
    onThemeChange?.(resolved)
  }, [themeMode, onThemeChange])

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (themeMode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const newResolved = getSystemTheme()
      setResolvedTheme(newResolved)
      
      if (newResolved === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      
      document.documentElement.dataset.theme = newResolved
      onThemeChange?.(newResolved)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [themeMode, onThemeChange])

  function cycleTheme() {
    setThemeMode((current) => {
      // Cycle: system → light → dark → system
      if (current === 'system') return 'light'
      if (current === 'light') return 'dark'
      return 'system'
    })
  }

  const isDark = resolvedTheme === 'dark'
  const isSystem = themeMode === 'system'

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className="theme-toggle group relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] text-neutral-200 shadow-lg shadow-black/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#22C55E]/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#22C55E]/60"
      aria-label={isSystem ? 'System theme' : (isDark ? 'Dark mode' : 'Light mode')}
      title={isSystem ? 'System theme' : (isDark ? 'Dark mode' : 'Light mode')}
    >
      {/* System icon */}
      <span className={`absolute transition-all duration-500 ease-out ${isSystem ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} aria-hidden="true">
        <Monitor className="h-5 w-5 text-blue-400" strokeWidth={1.8} />
      </span>
      
      {/* Sun icon (light mode) */}
      <span className={`absolute transition-all duration-500 ease-out ${!isSystem && !isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}`} aria-hidden="true">
        <Sun className="h-5 w-5 text-amber-400" strokeWidth={1.8} />
      </span>
      
      {/* Moon icon (dark mode) */}
      <span className={`absolute transition-all duration-500 ease-out ${!isSystem && isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} aria-hidden="true">
        <Moon className="h-[22px] w-[22px] text-slate-300" strokeWidth={1.8} fill="none" />
      </span>
    </button>
  )
}
