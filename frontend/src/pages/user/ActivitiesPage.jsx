import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Reorder } from 'framer-motion'
import * as activityService from '../../services/activityService'
import * as categoryService from '../../services/categoryService'

// ─── Categories config ────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { label: 'Fitness',   color: '#22C55E' },
  { label: 'Health',    color: '#3B82F6' },
  { label: 'Wellness',  color: '#A855F7' },
  { label: 'Nutrition', color: '#F59E0B' },
  { label: 'Growth',    color: '#EC4899' },
]

const getCat = (categoryName, categories) => {
  const cat = categories.find(c => c.name === categoryName)
  return cat ? { label: cat.name, color: cat.color } : { label: categoryName, color: '#9ca3af' }
}

// ─── Local Storage Helper for Date Tracking ────────────────────────────────
const STORAGE_KEYS = {
  DATE: 'uplife-date',
}

function readStorage(key, defaultVal) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : defaultVal
  } catch {
    return defaultVal
  }
}

function writeStorage(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function TaskModal({ mode, initial, onSave, onClose, categories: categoriesProp }) {
  const [title,       setTitle]       = useState(initial?.title       || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [time,        setTime]        = useState(initial?.time        || '')
  const [category,    setCategory]    = useState(initial?.categoryId ? String(initial.categoryId) : '')
  const [reason,      setReason]      = useState(initial?.reason      || '')
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  const isMissedEdit = mode === 'edit-missed'

  useEffect(() => {
    ref.current?.focus()
    // Set default category if not set and categories are available
    if (!category && categoriesProp && categoriesProp.length > 0 && !isMissedEdit) {
      setCategory(String(categoriesProp[0].id))
    }
  }, [categoriesProp, isMissedEdit])

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    
    if (isMissedEdit) {
      // For missed activities, we only edit title, description, time, and reason
      onSave({ 
        title: title.trim(), 
        description: description.trim(), 
        time: time.trim(),
        reason: reason.trim()
      })
    } else {
      // For regular activities, we need category
      if (!category) return
      const selectedCat = categoriesProp.find(c => String(c.id) === category)
      onSave({ 
        title: title.trim(), 
        description: description.trim(), 
        time: time.trim(), 
        categoryId: parseInt(category),
        category: selectedCat?.name || '',
        categoryColor: selectedCat?.color || '#9ca3af'
      })
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111]"
        style={{ animation: 'modalIn 0.18s ease' }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {mode === 'add' ? 'New Activity' : mode === 'edit-missed' ? 'Edit Missed Activity' : 'Edit Activity'}
          </h3>
          <button onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Title</label>
            <input ref={ref} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Morning Run"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Description</label>
            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Time / Schedule</label>
            <input value={time} onChange={e => setTime(e.target.value)} placeholder="e.g. Today, 7:00 AM"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500" />
          </div>

          {isMissedEdit && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Reason</label>
              <textarea rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="Why was this missed?"
                className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500" />
            </div>
          )}

          {!isMissedEdit && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Category</label>
              {!categoriesProp || categoriesProp.length === 0 ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#22C55E] border-t-transparent"></div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categoriesProp.map(c => (
                    <button key={c.id} type="button" onClick={() => setCategory(String(c.id))}
                      className="rounded-xl border px-3 py-1.5 text-xs font-semibold transition"
                      style={{
                        borderColor: category === String(c.id) ? c.color : 'transparent',
                        background:  category === String(c.id) ? `${c.color}18` : 'rgba(128,128,128,0.08)',
                        color:       category === String(c.id) ? c.color : '#9ca3af',
                      }}>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 rounded-xl bg-[#22C55E] py-2.5 text-sm font-bold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Saving...' : mode === 'add' ? 'Add Activity' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onEdit, onDelete, categories }) {
  const cat = getCat(task.category, categories)
  return (
    <div className={`group relative flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 ${
      task.done
        ? 'border-green-500/20 bg-green-500/5 dark:bg-green-500/5'
        : 'border-gray-200 bg-white hover:border-[#22C55E]/40 hover:shadow-md hover:shadow-[#22C55E]/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#22C55E]/40'
    }`}>
      <button type="button" onClick={() => onToggle(task.id)}
        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
          task.done ? 'border-[#22C55E] bg-[#22C55E] shadow-md shadow-[#22C55E]/30' : 'border-gray-300 bg-transparent hover:border-[#22C55E] dark:border-white/30'
        }`}>
        {task.done && (
          <svg className="h-3 w-3 text-black" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`text-sm font-semibold transition-all duration-300 ${task.done ? 'text-gray-400 line-through dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {task.title}
          </h3>
          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>
            {cat.label}
          </span>
        </div>
        {task.description && (
          <p className={`mt-1 text-xs leading-relaxed ${task.done ? 'text-gray-400/60 line-through dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
            {task.description}
          </p>
        )}
        {task.time && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <svg className={`h-3 w-3 flex-shrink-0 ${task.done ? 'text-gray-400' : 'text-[#22C55E]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            <span className={`text-[11px] font-medium ${task.done ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
              {task.time}
            </span>
          </div>
        )}

      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={() => onEdit(task)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-500/10 hover:text-blue-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button onClick={() => onDelete(task.id)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {task.done && (
        <div className="absolute right-4 top-4">
          <svg className="h-4 w-4 text-[#22C55E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── Missed Task Card ────────────────────────────────────────────────────────
function MissedTaskCard({ task, onSubmitReason, onRestore, onEdit, onDelete, categories }) {
  const cat = getCat(task.category, categories)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!reason.trim()) return
    setLoading(true)
    try {
      await onSubmitReason(task.id, reason.trim())
      setReason('')
    } catch (error) {
      console.error('Failed to submit reason:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 transition-all duration-300 dark:bg-red-500/5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {task.title}
              </h3>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>
                {cat.label}
              </span>
            </div>
            {task.description && (
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {task.description}
              </p>
            )}
            {task.missedDate && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Missed on: {new Date(task.missedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onRestore(task.id)}
            title="Restore as completed"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-green-500/10 hover:text-green-500">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(task)}
            title="Edit"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-500/10 hover:text-blue-500">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            title="Delete"
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-500">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.reason !== undefined && task.reason !== '' && task.reason !== null ? (
        <div className="mt-2 rounded-xl bg-white/50 p-3 text-sm text-gray-700 dark:bg-black/20 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-white">Reason: </span>
          {task.reason}
        </div>
      ) : (
        <div className="mt-2 flex items-start gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why was this missed? (Sabab)"
            rows={2}
            className="w-full resize-none rounded-xl border border-red-500/20 bg-white/50 px-3 py-2 text-sm text-gray-900 placeholder-red-500/50 outline-none transition focus:border-red-500/50 focus:bg-white focus:ring-2 focus:ring-red-500/20 dark:bg-black/20 dark:text-white dark:focus:bg-black/40"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="flex-shrink-0 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:-translate-y-0.5 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? '...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── End Day Modal ────────────────────────────────────────────────────────────
function EndDayModal({ pendingCount, onConfirm, onClose }) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111]"
        style={{ animation: 'modalIn 0.18s ease' }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Slit Nhar (End of Day)
          </h3>
          <button onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl bg-orange-500/10 p-4 text-center">
            <div className="text-4xl mb-2">⚠️</div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {pendingCount} task{pendingCount !== 1 ? 's' : ''} mazal ma kmlti
            </p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Ghadi nmchiwhom l "Missed Activities" bach tzid sabab
            </p>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Ila clickiti "Slit Nhar":</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Les tasks li ma kmltihoumch ghadi ymchiw l "Missed"</li>
              <li>Khassek tzid sabab 3lach ma drtihomch</li>
              <li>Nhar jdid ghadi ytfat</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
              Mazal (Cancel)
            </button>
            <button type="button" onClick={onConfirm}
              className="flex-1 rounded-xl bg-[#22C55E] py-2.5 text-sm font-bold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A]">
              Iyeh, Slit Nhar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ActivitiesPage() {
  const [tasks,  setTasks]  = useState([])
  const [missedTasks, setMissedTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('all') // 'all' | 'pending' | 'done' | 'missed'
  const [modal,  setModal]  = useState(null)
  const [showEndDayModal, setShowEndDayModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0] // Format: YYYY-MM-DD
  })

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoryService.getAllCategories()
        setCategories(data.categories || [])
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        setError('Failed to load categories')
      }
    }
    fetchCategories()
  }, [])

  // Fetch activities when date changes
  useEffect(() => {
    fetchActivities()
  }, [selectedDate])

  // Fetch missed activities on mount
  useEffect(() => {
    fetchMissedActivities()
  }, [])

  async function fetchActivities() {
    try {
      setLoading(true)
      const data = await activityService.getAllActivities(selectedDate)
      setTasks(data.activities || [])
      setError(null)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      setError('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  async function fetchMissedActivities() {
    try {
      const data = await activityService.getMissedActivities()
      setMissedTasks(data.missedActivities || [])
    } catch (err) {
      console.error('Failed to fetch missed activities:', err)
    }
  }

  // Daily Reset Check - move to missed if it's a new day
  useEffect(() => {
    const today = new Date().toDateString()
    const lastDate = readStorage(STORAGE_KEYS.DATE, null)

    if (lastDate && lastDate !== today) {
      // It's a new day! Call API to move yesterday's unfinished activities
      async function moveToMissed() {
        try {
          const yesterday = new Date(lastDate)
          // Pass yesterday's date to move those specific activities
          await activityService.moveUnfinishedToMissed(yesterday.toISOString())
          // Refresh both lists
          await fetchActivities()
          await fetchMissedActivities()
        } catch (err) {
          console.error('Failed to move activities to missed:', err)
        }
      }
      moveToMissed()
    }
    
    writeStorage(STORAGE_KEYS.DATE, today)
  }, [])

  const completed = tasks.filter(t => t.done).length
  const total     = tasks.length
  const pending   = total - completed
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100)

  async function handleAdd(data) {
    try {
      const result = await activityService.createActivity({
        title: data.title,
        description: data.description,
        time: data.time,
        categoryId: data.categoryId
      })
      setTasks(p => [result.activity, ...p])
      setModal(null)
    } catch (err) {
      console.error('Failed to create activity:', err)
      alert('Failed to create activity: ' + err.message)
    }
  }

  async function handleEdit(data) {
    try {
      const result = await activityService.updateActivity(modal.task.id, {
        title: data.title,
        description: data.description,
        time: data.time,
        categoryId: data.categoryId
      })
      setTasks(p => p.map(t => t.id === modal.task.id ? result.activity : t))
      setModal(null)
    } catch (err) {
      console.error('Failed to update activity:', err)
      alert('Failed to update activity: ' + err.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this activity?')) return
    
    try {
      await activityService.deleteActivity(id)
      setTasks(p => p.filter(t => t.id !== id))
    } catch (err) {
      console.error('Failed to delete activity:', err)
      alert('Failed to delete activity: ' + err.message)
    }
  }

  async function handleToggle(id) {
    try {
      const result = await activityService.toggleActivityDone(id)
      setTasks(p => p.map(t => t.id === id ? result.activity : t))
    } catch (err) {
      console.error('Failed to toggle activity:', err)
      alert('Failed to toggle activity: ' + err.message)
    }
  }

  async function handleSubmitReason(id, reason) {
    try {
      const result = await activityService.updateMissedActivityReason(id, reason)
      setMissedTasks(p => p.map(t => t.id === id ? result.missedActivity : t))
    } catch (err) {
      console.error('Failed to update reason:', err)
      alert('Failed to update reason: ' + err.message)
    }
  }

  async function handleRestoreMissed(id) {
    if (!confirm('Restore this activity as completed? It will be moved back to activities.')) return
    
    try {
      await activityService.restoreMissedActivity(id)
      setMissedTasks(p => p.filter(t => t.id !== id))
      // Refresh activities in case the restored date is currently selected
      await fetchActivities()
      alert('Activity restored as completed! ✅')
    } catch (err) {
      console.error('Failed to restore activity:', err)
      alert('Failed to restore activity: ' + err.message)
    }
  }

  async function handleEditMissed(task) {
    setModal({ mode: 'edit-missed', task })
  }

  async function handleDeleteMissed(id) {
    if (!confirm('Are you sure you want to delete this missed activity?')) return
    
    try {
      await activityService.deleteMissedActivity(id)
      setMissedTasks(p => p.filter(t => t.id !== id))
    } catch (err) {
      console.error('Failed to delete missed activity:', err)
      alert('Failed to delete missed activity: ' + err.message)
    }
  }

  async function handleUpdateMissed(data) {
    try {
      const result = await activityService.updateMissedActivity(modal.task.id, {
        title: data.title,
        description: data.description,
        time: data.time,
        reason: data.reason
      })
      setMissedTasks(p => p.map(t => t.id === modal.task.id ? result.missedActivity : t))
      setModal(null)
    } catch (err) {
      console.error('Failed to update missed activity:', err)
      alert('Failed to update missed activity: ' + err.message)
    }
  }

  function handleDateChange(direction) {
    const date = new Date(selectedDate)
    date.setDate(date.getDate() + direction)
    setSelectedDate(date.toISOString().split('T')[0])
  }

  function goToToday() {
    const today = new Date()
    setSelectedDate(today.toISOString().split('T')[0])
  }

  const isToday = selectedDate === new Date().toISOString().split('T')[0]

  async function handleEndDay() {
    const pendingTasks = tasks.filter(t => !t.done)
    if (pendingTasks.length === 0) {
      alert('Makayn ta task pending! Kolchi kaml 🎉')
      return
    }
    setShowEndDayModal(true)
  }

  async function handleConfirmEndDay() {
    try {
      // Move unfinished to missed
      await activityService.moveUnfinishedToMissed()
      
      // Mark day as complete
      await activityService.markDayComplete()
      
      // Refresh both lists
      await fetchActivities()
      await fetchMissedActivities()
      
      setShowEndDayModal(false)
      setFilter('missed') // Switch to missed tab to add reasons
    } catch (err) {
      console.error('Failed to end day:', err)
      alert('Failed to end day: ' + err.message)
    }
  }

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.done
    if (filter === 'done')    return  t.done
    return true
  })

  if (loading && tasks.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto animate-spin rounded-full border-4 border-[#22C55E] border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>

      <div className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Activities</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track your daily activities and wellness goals.</p>
            </div>
            <div className="flex items-center gap-2">
              {isToday && (
                <button onClick={handleEndDay}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-orange-600">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  Slit Nhar
                </button>
              )}
              <button onClick={() => setModal({ mode: 'add' })}
                className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Activity
              </button>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <button
              onClick={() => handleDateChange(-1)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              {!isToday && (
                <button
                  onClick={goToToday}
                  className="ml-2 rounded-lg bg-[#22C55E] px-2.5 py-1 text-xs font-bold text-black transition hover:bg-[#16A34A]">
                  Today
                </button>
              )}
            </div>

            <button
              onClick={() => handleDateChange(1)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10">
              Next
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Progress Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-6 text-black shadow-lg shadow-[#22C55E]/20">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 right-16 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">Today's Progress</p>
              <p className="mt-1 text-4xl font-bold">{progress}%</p>
              <p className="mt-1 text-sm opacity-70">{completed} of {total} activities completed</p>
              
              {/* Day Completed Badge */}
              {completed > 0 && completed === total && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-bold">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Day Completed! 🎉
                </div>
              )}
              
              {/* Tasks Left */}
              {pending > 0 && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1.5 text-xs font-bold">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {pending} task{pending !== 1 ? 's' : ''} left
                </div>
              )}
            </div>
            <div className="relative flex h-20 w-20 items-center justify-center">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="black" strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                  className="transition-all duration-700" />
              </svg>
              <span className="absolute text-sm font-bold">{completed}/{total}</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all',     label: 'All',     count: total, badgeColor: 'bg-black/20 text-black', bg: 'bg-[#22C55E]' },
            { key: 'pending', label: 'Pending', count: tasks.filter(t => !t.done).length, badgeColor: 'bg-black/20 text-black', bg: 'bg-[#22C55E]' },
            { key: 'done',    label: 'Done',    count: completed, badgeColor: 'bg-black/20 text-black', bg: 'bg-[#22C55E]' },
            { key: 'missed',  label: 'Missed',  count: missedTasks.length, badgeColor: 'bg-white/20 text-white', bg: 'bg-red-500 text-white shadow-red-500/30' },
          ].map(tab => (
            <button key={tab.key} type="button" onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                filter === tab.key
                  ? `${tab.bg} shadow-md`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-gray-400 dark:hover:bg-white/10'
              }`}>
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                filter === tab.key ? tab.badgeColor : 'bg-gray-200 text-gray-500 dark:bg-white/10 dark:text-gray-400'
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Task List */}
        <div className="space-y-3">
          {filter === 'missed' ? (
            missedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 dark:border-white/10">
                <div className="text-4xl">🌟</div>
                <p className="mt-3 font-semibold text-gray-700 dark:text-gray-300">No missed activities</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">You are completely caught up!</p>
              </div>
            ) : (
              missedTasks.map(task => (
                <MissedTaskCard
                  key={task.id}
                  task={task}
                  onSubmitReason={handleSubmitReason}
                  onRestore={handleRestoreMissed}
                  onEdit={handleEditMissed}
                  onDelete={handleDeleteMissed}
                  categories={categories}
                />
              ))
            )
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 dark:border-white/10">
              <div className="text-4xl">{filter === 'done' ? '🎯' : '📝'}</div>
              <p className="mt-3 font-semibold text-gray-700 dark:text-gray-300">
                {filter === 'done' ? 'No completed activities yet' : 'Your list is empty!'}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                {filter === 'done' ? 'Complete an activity to see it here.' : 'Add new activities for today.'}
              </p>
            </div>
          ) : (
            <Reorder.Group axis="y" values={filtered} onReorder={(newOrder) => {
              const hidden = tasks.filter(t => !newOrder.find(n => n.id === t.id))
              setTasks([...newOrder, ...hidden])
            }} className="space-y-3 outline-none">
              {filtered.map(task => (
                <Reorder.Item key={task.id} value={task} className="relative z-0 outline-none hover:z-10 cursor-grab active:cursor-grabbing">
                  <TaskCard task={task}
                    onToggle={handleToggle}
                    onEdit={t => setModal({ mode: 'edit', task: t })}
                    onDelete={handleDelete}
                    categories={categories} />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>

      {modal && (
        <TaskModal
          mode={modal.mode}
          initial={modal.task}
          onSave={modal.mode === 'add' ? handleAdd : modal.mode === 'edit-missed' ? handleUpdateMissed : handleEdit}
          onClose={() => setModal(null)}
          categories={categories}
        />
      )}

      {showEndDayModal && (
        <EndDayModal
          pendingCount={tasks.filter(t => !t.done).length}
          onConfirm={handleConfirmEndDay}
          onClose={() => setShowEndDayModal(false)}
        />
      )}
    </>
  )
}
