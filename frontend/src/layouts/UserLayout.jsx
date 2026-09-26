import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import BranchedMenu from '../components/common/BranchedMenu.jsx'
import LanguageSwitcher from '../components/auth/LanguageSwitcher.jsx'

const menuItems = [
  {
    label: 'Main',
    children: [
      { value: '/dashboard', label: 'Dashboard', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1"/>
          <rect width="7" height="5" x="14" y="3" rx="1"/>
          <rect width="7" height="9" x="14" y="12" rx="1"/>
          <rect width="7" height="5" x="3" y="16" rx="1"/>
        </svg>
      )},
      { value: '/dashboard/settings', label: 'Settings', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )},
    ]
  },
  {
    label: 'Activity',
    children: [
      { value: '/dashboard/activities', label: 'Activities', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" x2="8" y1="13" y2="13"/>
          <line x1="16" x2="8" y1="17" y2="17"/>
          <line x1="10" x2="8" y1="9" y2="9"/>
        </svg>
      )},
      { value: '/dashboard/notes', label: 'Mdawanat', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/><rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9.5 8h5"/><path d="M9.5 12h5"/><path d="M9.5 16h5"/>
        </svg>
      )},
      { value: '/dashboard/history', label: 'History', icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M12 7v5l4 2"/>
        </svg>
      )},
    ]
  },
]

export default function UserLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('uplife-theme') || 'dark')
  const [searchFocused, setSearchFocused] = useState(false)

  const handleMenuSelect = (value) => {
    navigate(value)
    setSidebarOpen(false)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('uplife-theme', newTheme)
  }

  const bgColor = theme === 'dark' ? 'bg-black' : 'bg-gray-50'
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900'
  const panelBg = theme === 'dark' ? 'bg-white/5' : 'bg-white/80'
  const borderColor = theme === 'dark' ? 'border-white/10' : 'border-gray-200/50'
  const menuColor = theme === 'dark' ? '#f5f5f5' : '#18181b'

  return (
    <div className={`flex h-screen ${bgColor} p-4 gap-4 transition-colors duration-300`}>
      {/* Floating Transparent Sidebar with Backdrop Blur */}
      <aside className={`fixed inset-4 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div 
          className={`flex h-full flex-col backdrop-blur-xl ${panelBg} border ${borderColor} rounded-3xl shadow-2xl shadow-black/20 overflow-hidden`}
        >
          {/* Content */}
          <div className="flex h-full flex-col">
          {/* Logo Section - Clean and Simple */}
          <div className={`flex h-20 items-center justify-center border-b ${borderColor} px-4 py-3`}>
            <img 
              src="/asideimage.png" 
              alt="UpLife Logo" 
              className="h-14 w-auto object-contain"
            />
          </div>

          {/* Navigation with BranchedMenu */}
          <nav className="flex-1 overflow-y-auto px-6 py-8">
            <BranchedMenu
              items={menuItems}
              defaultOpen={[0]}
              defaultActive={location.pathname}
              onSelect={handleMenuSelect}
              color={menuColor}
              accentColor="#22C55E"
              lineColor={theme === 'dark' ? '#3f3f46' : '#d4d4d8'}
              width={240}
              rowHeight={40}
              indent={42}
              trunk={14}
              radius={10}
              lineWidth={1.5}
              fontSize={14}
              drawDuration={400}
              foldDuration={300}
            />
          </nav>


          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex flex-1 flex-col overflow-hidden rounded-3xl backdrop-blur-xl ${panelBg} border ${borderColor} shadow-2xl shadow-black/20`}>
        {/* Transparent Header with Icons */}
        <header className="flex h-20 items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors lg:hidden`}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className={`relative transition-all duration-200 ${searchFocused ? 'scale-105' : ''}`}>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                  theme === 'dark' 
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#22C55E] focus:bg-white/10' 
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#22C55E] focus:bg-white'
                } outline-none transition-all`}
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
              } transition-all`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Notification Icon with Badge */}
            <button
              className={`relative p-2 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
              } transition-all`}
              title="Notifications"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-current"></span>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Account Avatar */}
            <button
              onClick={() => navigate('/dashboard/settings')}
              className={`flex items-center gap-2 p-1.5 rounded-xl ${
                theme === 'dark' 
                  ? 'bg-white/5 hover:bg-white/10' 
                  : 'bg-gray-100 hover:bg-gray-200'
              } transition-all`}
              title={user?.name}
            >
              <div className="flex h-8 w-full items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-sm font-bold text-black shadow-md shadow-[#22C55E]/20">
                {user?.name?.[0] || 'U'}
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-transparent p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
