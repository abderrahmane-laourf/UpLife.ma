import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Reorder } from 'framer-motion'

// ─── Categories config ────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { label: 'Fitness',   color: '#22C55E' },
  { label: 'Health',    color: '#3B82F6' },
  { label: 'Wellness',  color: '#A855F7' },
  { label: 'Nutrition', color: '#F59E0B' },
  { label: 'Growth',    color: '#EC4899' },
]

function getCategories() {
  try {
    const val = localStorage.getItem('uplife-categories')
    return val ? JSON.parse(val) : DEFAULT_CATEGORIES
  } catch {
    return DEFAULT_CATEGORIES
  }
}
const getCat = (label) => getCategories().find(c => c.label === label) || { label, color: '#9ca3af' }

// ─── Local Storage Helpers ──────────────────────────────────────────────────
const STORAGE_KEYS = {
  DATE: 'uplife-date',
  TASKS: 'uplife-tasks',
  MISSED: 'uplife-missed-tasks'
}

let _uid = Date.now()
const uid = () => ++_uid

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
function TaskModal({ mode, initial, onSave, onClose }) {
  const [title,       setTitle]       = useState(initial?.title       || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [time,        setTime]        = useState(initial?.time        || '')
  const [category,    setCategory]    = useState(initial?.category    || 'Fitness')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)

  // Fetch categories from API
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('http://localhost:3000/api/categories', {
          credentials: 'include',
        })
        const data = await response.json()
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories)
          // If no category is set, use the first one
          if (!category && data.categories.length > 0) {
            setCategory(data.categories[0].name)
          }
        } else {
          // Fallback to default categories
          setCategories(DEFAULT_CATEGORIES)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        // Fallback to default categories
        setCategories(DEFAULT_CATEGORIES)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategories()
    ref.current?.focus()
  }, [])

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    const selectedCat = categories.find(c => c.name === category)
    const cat = selectedCat || { name: category, color: '#9ca3af' }
    onSave({ title: title.trim(), description: description.trim(), time: time.trim(), category, categoryColor: cat.color })
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
            {mode === 'add' ? 'New Activity' : 'Edit Activity'}
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

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Category</label>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#22C55E] border-t-transparent"></div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categories.map(c => (
                  <button key={c.id || c.label} type="button" onClick={() => setCategory(c.name || c.label)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-semibold transition"
                    style={{
                      borderColor: category === (c.name || c.label) ? c.color : 'transparent',
                      background:  category === (c.name || c.label) ? `${c.color}18` : 'rgba(128,128,128,0.08)',
                      color:       category === (c.name || c.label) ? c.color : '#9ca3af',
                    }}>
                    {c.name || c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 rounded-xl bg-[#22C55E] py-2.5 text-sm font-bold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A]">
              {mode === 'add' ? 'Add Activity' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const cat = getCat(task.category)
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
            {task.category}
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
function MissedTaskCard({ task, onSubmitReason }) {
  const cat = getCat(task.category)
  const [reason, setReason] = useState('')

  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 transition-all duration-300 dark:bg-red-500/5">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
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
                {task.category}
              </span>
            </div>
            {task.missedDate && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Missed on: {new Date(task.missedDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {task.reason !== undefined && task.reason !== '' ? (
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
            onClick={() => {
              if (reason.trim()) onSubmitReason(task.id, reason.trim());
            }}
            className="flex-shrink-0 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-red-500/20 transition hover:-translate-y-0.5 hover:bg-red-600"
          >
            Save
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ActivitiesPage() {
  const [tasks,  setTasks]  = useState(() => readStorage(STORAGE_KEYS.TASKS, []))
  const [missedTasks, setMissedTasks] = useState(() => readStorage(STORAGE_KEYS.MISSED, []))
  const [filter, setFilter] = useState('all') // 'all' | 'pending' | 'done' | 'missed'
  const [modal,  setModal]  = useState(null)

  // Daily Reset Check
  useEffect(() => {
    const today = new Date().toDateString()
    const lastDate = readStorage(STORAGE_KEYS.DATE, null)

    if (lastDate && lastDate !== today) {
      // It's a new day!
      const unfinished = tasks.filter(t => !t.done).map(t => ({
        ...t,
        reason: '',
        missedDate: lastDate
      }))

      if (unfinished.length > 0) {
        setMissedTasks(prev => {
          const newMissed = [...unfinished, ...prev]
          writeStorage(STORAGE_KEYS.MISSED, newMissed)
          return newMissed
        })
      }

      // Reset today's tasks (empty them so user has to fill them again)
      setTasks([])
      writeStorage(STORAGE_KEYS.TASKS, [])
    }
    
    writeStorage(STORAGE_KEYS.DATE, today)
  }, []) // Runs once on mount

  // Sync tasks to local storage whenever they change
  useEffect(() => {
    writeStorage(STORAGE_KEYS.TASKS, tasks)
  }, [tasks])

  const completed = tasks.filter(t => t.done).length
  const total     = tasks.length
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100)

  function handleAdd(data)  { setTasks(p => [{ id: uid(), done: false, ...data }, ...p]); setModal(null) }
  function handleEdit(data) { setTasks(p => p.map(t => t.id === modal.task.id ? { ...t, ...data } : t)); setModal(null) }
  function handleDelete(id) { setTasks(p => p.filter(t => t.id !== id)) }
  function handleToggle(id) { setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t)) }

  function handleSubmitReason(id, reason) {
    setMissedTasks(p => {
      const updated = p.map(t => t.id === id ? { ...t, reason } : t)
      writeStorage(STORAGE_KEYS.MISSED, updated)
      return updated
    })
  }

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.done
    if (filter === 'done')    return  t.done
    return true
  })

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Activities</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your daily activities and wellness goals.</p>
          </div>
          <button onClick={() => setModal({ mode: 'add' })}
            className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Activity
          </button>
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
                <MissedTaskCard key={task.id} task={task} onSubmitReason={handleSubmitReason} />
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
                    onDelete={handleDelete} />
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
          onSave={modal.mode === 'add' ? handleAdd : handleEdit}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
