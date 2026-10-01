import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useCategories } from '../../hooks/useCategories.jsx'
import SwipeToast from '../../components/common/SwipeToast.jsx'
import GoalSettings from '../../components/GoalSettings.jsx'
import NoFapCounter from '../../components/NoFapCounter.jsx'

// ─── Reusable input field ─────────────────────────────────────────────────────
function Field({ label, id, icon, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
        <span className="text-[#22C55E]">{icon}</span>
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 dark:text-gray-600">{hint}</p>}
    </div>
  )
}

function Input({ id, type = 'text', value, onChange, placeholder, disabled }) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all duration-200 ${
        disabled
          ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400 dark:border-white/5 dark:bg-white/[0.02] dark:text-gray-600'
          : 'border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500 dark:focus:border-[#22C55E]'
      }`}
    />
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, subtitle, icon, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#22C55E]/10 text-[#22C55E]">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { categories, loading: categoriesLoading, addCategory, removeCategory } = useCategories()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile State
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '', phone: user?.phone || '', email: user?.email || '', bio: '', city: '',
  })

  // Categories State
  const [newCatLabel, setNewCatLabel] = useState('')
  const [newCatDescription, setNewCatDescription] = useState('')
  const [newCatColor, setNewCatColor] = useState('#22C55E')
  
  // Toast State
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' })

  const initials = (user?.name || 'U').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  // Show toast helper
  const showToast = (message, type = 'success') => {
    setToast({ open: true, message, type })
  }

  // Close toast helper
  const closeToast = () => {
    setToast(prev => ({ ...prev, open: false }))
  }

  function handleProfileSubmit(e) {
    e.preventDefault()
    setSaved(true)
    showToast('Profile updated successfully!', 'success')
    setTimeout(() => setSaved(false), 3000)
  }

  async function handleAddCategory(e) {
    e.preventDefault()
    if (!newCatLabel.trim()) {
      showToast('Category name is required', 'error')
      return
    }
    
    const result = await addCategory({
      name: newCatLabel.trim(),
      color: newCatColor,
      description: newCatDescription.trim()
    })

    if (result.success) {
      setNewCatLabel('')
      setNewCatDescription('')
      showToast('Category added successfully!', 'success')
    } else {
      showToast(result.error || 'Failed to add category', 'error')
    }
  }

  async function handleDeleteCategory(id) {
    const result = await removeCategory(id)
    
    if (result.success) {
      showToast('Category deleted successfully!', 'success')
    } else {
      showToast(result.error || 'Failed to delete category', 'error')
    }
  }

  return (
    <div className="w-full space-y-6">
      
      {/* Toast Notifications */}
      <SwipeToast
        open={toast.open}
        onClose={closeToast}
        title={toast.type === 'success' ? 'Success' : 'Error'}
        description={toast.message}
        icon={
          toast.type === 'success' ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
        background={toast.type === 'success' ? '#22C55E' : '#EF4444'}
        color="#FFFFFF"
        fuseColor="#FFFFFF"
        duration={4000}
        pauseOnHover={true}
        dismissible={true}
      />

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your profile, goals, and app preferences.</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-white/10 pb-px">
        <button onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'profile' ? 'border-[#22C55E] text-[#22C55E]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}>
          Profile
        </button>
        <button onClick={() => setActiveTab('goal')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'goal' ? 'border-[#22C55E] text-[#22C55E]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}>
          My Goal
        </button>
        <button onClick={() => setActiveTab('nofap')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'nofap' ? 'border-[#22C55E] text-[#22C55E]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}>
          NoFap 💪
        </button>
        <button onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-b-2 ${
            activeTab === 'categories' ? 'border-[#22C55E] text-[#22C55E]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}>
          Categories
        </button>
      </div>

      {/* ── Profile Tab ── */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
            <div className="h-28 bg-gradient-to-br from-[#22C55E]/80 via-[#16A34A] to-[#15803D]">
              <div className="absolute inset-x-0 top-0 h-28 opacity-20"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }}
              />
            </div>
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4 flex items-end justify-between">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-2xl font-extrabold text-black shadow-lg dark:border-[#0a0a0a]">
                    {initials}
                  </div>
                  <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-[#22C55E] dark:border-[#0a0a0a]" />
                </div>
                <div className="flex items-center gap-2 pb-1">
                  <button onClick={logout} className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">{user?.name || 'Your Name'}</h1>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <svg className="h-3.5 w-3.5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  {user?.role || 'Member'} · UpLife
                </p>
              </div>
            </div>
          </div>

          <Section title="Personal Information" subtitle="Update your profile details" icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          }>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="name" label="Full Name" icon={<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Abderrahmane Laourf" />
                </Field>
                <Field id="city" label="City" icon={<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}>
                  <Input id="city" value={formData.city} onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))} placeholder="Casablanca, Morocco" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="phone" label="Phone Number" hint="Phone number cannot be changed" icon={<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>}>
                  <Input id="phone" type="tel" value={formData.phone} disabled />
                </Field>
                <Field id="email" label="Email (Optional)" icon={<svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="you@email.com" />
                </Field>
              </div>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/5">
                {saved ? <span className="flex items-center gap-1.5 text-sm font-medium text-[#22C55E]"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Changes saved!</span> : <div />}
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A]">
                  Save Changes
                </button>
              </div>
            </form>
          </Section>
        </div>
      )}

      {/* ── Goal Tab ── */}
      {activeTab === 'goal' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <GoalSettings />
        </div>
      )}

      {/* ── NoFap Tab ── */}
      {activeTab === 'nofap' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <NoFapCounter />
        </div>
      )}

      {/* ── Categories Tab ── */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Section title="Activity Categories" subtitle="Manage the categories you can assign to your tasks" icon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          }>
            {categoriesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#22C55E] border-t-transparent"></div>
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                  {categories.map(c => (
                    <div key={c.id} className="group relative flex flex-col rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02] transition-all hover:shadow-md">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="flex h-4 w-4 flex-shrink-0 rounded-full shadow-sm" style={{ backgroundColor: c.color }}></span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{c.name}</span>
                        </div>
                        <button onClick={() => handleDeleteCategory(c.id)} className="rounded-lg p-1.5 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      {c.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 pl-7">{c.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 dark:border-white/5 pt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4">Add New Category</h4>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex-1 w-full">
                        <label htmlFor="newCat" className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Category Name</label>
                        <Input id="newCat" value={newCatLabel} onChange={e => setNewCatLabel(e.target.value)} placeholder="e.g. Fitness" />
                      </div>
                      <div className="flex-1 w-full">
                        <label htmlFor="newCatDesc" className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Description (Optional)</label>
                        <Input id="newCatDesc" value={newCatDescription} onChange={e => setNewCatDescription(e.target.value)} placeholder="e.g. Physical activities and workouts" />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-end gap-4">
                      <div className="flex-1">
                        <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Color</label>
                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 dark:border-white/10 dark:bg-white/[0.04]">
                          {[
                            '#22C55E', // Green
                            '#3B82F6', // Blue
                            '#A855F7', // Purple
                            '#F59E0B', // Orange
                            '#EC4899', // Pink
                            '#EF4444', // Red
                            '#06B6D4', // Cyan
                          ].map(color => (
                            <button key={color} type="button" onClick={() => setNewCatColor(color)}
                              className={`h-8 w-8 rounded-lg transition-transform ${newCatColor === color ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black' : 'hover:scale-105'}`}
                              style={{ backgroundColor: color, ringColor: color }} 
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <button type="submit" className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 rounded-xl bg-[#22C55E] px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A]">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Category
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </Section>
        </div>
      )}

    </div>
  )
}
