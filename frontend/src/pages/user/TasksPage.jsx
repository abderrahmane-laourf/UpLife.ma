import { useState, useRef, useEffect } from 'react'

// ─── Priority config ──────────────────────────────────────────────────────────
const PRIORITIES = [
  { value: 'high',   label: 'High',   color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  { value: 'medium', label: 'Medium', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  { value: 'low',    label: 'Low',    color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
]

const getPriority = (v) => PRIORITIES.find(p => p.value === v) || PRIORITIES[1]

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
  check: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  plus: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  trash: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  edit: (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  flag: (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V5a2 2 0 012-2h10l-2 4 2 4H5v10" />
    </svg>
  ),
  target: (
    <svg className="h-4.5 w-4.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  calendar: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  close: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

// ─── Task Form Modal ──────────────────────────────────────────────────────────
function TaskModal({ mode, initial, onSave, onClose, type }) {
  const [text, setText] = useState(initial?.text || '')
  const [priority, setPriority] = useState(initial?.priority || 'medium')
  const [deadline, setDeadline] = useState(initial?.deadline || '')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    onSave({ text: text.trim(), priority, deadline })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#111]"
        style={{ animation: 'modalIn 0.18s ease' }}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {mode === 'add' ? `Add ${type === 'day' ? 'Daily Task' : 'Global Goal'}` : 'Edit Task'}
          </h3>
          <button onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white">
            {Icon.close}
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5">
          {/* Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
              {type === 'day' ? 'Task' : 'Goal'}
            </label>
            <input
              ref={inputRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={type === 'day' ? 'e.g. Run 30 minutes' : 'e.g. Lose 5kg in 3 months'}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500"
            />
          </div>

          {/* Priority */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button key={p.value} type="button"
                  onClick={() => setPriority(p.value)}
                  className="flex-1 rounded-xl border py-2 text-xs font-semibold transition"
                  style={{
                    borderColor: priority === p.value ? p.color : 'transparent',
                    background: priority === p.value ? p.bg : 'rgba(128,128,128,0.07)',
                    color: priority === p.value ? p.color : '#9ca3af',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline (only for global goals) */}
          {type === 'goal' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Deadline (optional)</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              />
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 rounded-xl bg-[#22C55E] py-2.5 text-sm font-bold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A]">
              {mode === 'add' ? 'Add' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Task Item ────────────────────────────────────────────────────────────────
function TaskItem({ task, onToggle, onEdit, onDelete, type }) {
  const pri = getPriority(task.priority)

  return (
    <div className={`group flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-all duration-200 ${
      task.done
        ? 'border-gray-100 bg-gray-50/50 dark:border-white/5 dark:bg-white/[0.01]'
        : 'border-gray-200 bg-white hover:border-[#22C55E]/30 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#22C55E]/30'
    }`}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200"
        style={{
          borderColor: task.done ? '#22C55E' : pri.color,
          background: task.done ? '#22C55E' : 'transparent',
        }}>
        {task.done && <span className="text-black">{Icon.check}</span>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug transition-all ${
          task.done ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-900 dark:text-white'
        }`}>{task.text}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {/* Priority badge */}
          <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: pri.bg, color: pri.color }}>
            {Icon.flag} {pri.label}
          </span>
          {/* Deadline badge */}
          {task.deadline && type === 'goal' && (
            <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
              {Icon.calendar}
              {new Date(task.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={() => onEdit(task)}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-500/10 hover:text-blue-500">
          {Icon.edit}
        </button>
        <button onClick={() => onDelete(task.id)}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-500">
          {Icon.trash}
        </button>
      </div>
    </div>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function Progress({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-500 dark:text-gray-400">{done}/{total} completed</span>
        <span className="font-bold" style={{ color: pct === 100 ? '#22C55E' : pct > 50 ? '#F59E0B' : '#EF4444' }}>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? '#22C55E' : pct > 50 ? '#F59E0B' : '#EF4444',
          }}
        />
      </div>
    </div>
  )
}

// ─── Section Panel ────────────────────────────────────────────────────────────
function TaskSection({ title, subtitle, icon, accentColor, tasks, onAdd, onToggle, onEdit, onDelete, type }) {
  const done = tasks.filter(t => t.done).length

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="border-b border-gray-100 p-5 dark:border-white/10">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${accentColor}18`, color: accentColor }}>
              {icon}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-md transition hover:-translate-y-0.5"
            style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}40` }}>
            {Icon.plus} Add
          </button>
        </div>
        <Progress done={done} total={tasks.length} />
      </div>

      {/* List */}
      <div className="flex-1 space-y-2 overflow-y-auto p-4" style={{ maxHeight: '420px' }}>
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: `${accentColor}14` }}>
              <span style={{ color: accentColor }}>{icon}</span>
            </div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No tasks yet</p>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-600">Click "Add" to create your first one</p>
          </div>
        ) : (
          <>
            {/* Pending first */}
            {tasks.filter(t => !t.done).map(task => (
              <TaskItem key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} type={type} />
            ))}
            {/* Done at bottom */}
            {tasks.filter(t => t.done).length > 0 && (
              <>
                <p className="pt-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">Completed</p>
                {tasks.filter(t => t.done).map(task => (
                  <TaskItem key={task.id} task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} type={type} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
let _id = 100
const uid = () => ++_id

const TODAY_INIT = [
  { id: uid(), text: 'Morning run — 30 min', priority: 'high',   done: false },
  { id: uid(), text: 'Drink 2L of water',    priority: 'medium', done: true  },
  { id: uid(), text: 'Meditate 10 min',      priority: 'low',    done: false },
]

const GOALS_INIT = [
  { id: uid(), text: 'Lose 5 kg',                  priority: 'high',   done: false, deadline: '2026-12-31' },
  { id: uid(), text: 'Run a 5K race',              priority: 'medium', done: false, deadline: '2027-03-01' },
  { id: uid(), text: 'Read 12 books this year',    priority: 'low',    done: false, deadline: '' },
]

export default function TasksPage() {
  const [dayTasks,   setDayTasks]   = useState(TODAY_INIT)
  const [goalTasks,  setGoalTasks]  = useState(GOALS_INIT)
  const [modal, setModal] = useState(null) // { type: 'day'|'goal', mode: 'add'|'edit', task?: {} }

  // ── CRUD helpers ──
  function addTask(type, data) {
    const item = { id: uid(), done: false, deadline: '', ...data }
    type === 'day' ? setDayTasks(p => [item, ...p]) : setGoalTasks(p => [item, ...p])
  }

  function editTask(type, id, data) {
    const up = list => list.map(t => t.id === id ? { ...t, ...data } : t)
    type === 'day' ? setDayTasks(up) : setGoalTasks(up)
  }

  function deleteTask(type, id) {
    const rm = list => list.filter(t => t.id !== id)
    type === 'day' ? setDayTasks(rm) : setGoalTasks(rm)
  }

  function toggleTask(type, id) {
    const tg = list => list.map(t => t.id === id ? { ...t, done: !t.done } : t)
    type === 'day' ? setDayTasks(tg) : setGoalTasks(tg)
  }

  function handleSave(data) {
    if (modal.mode === 'add') addTask(modal.type, data)
    else editTask(modal.type, modal.task.id, data)
    setModal(null)
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>

      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
        </div>

        {/* Summary pills */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Today's tasks",   value: dayTasks.length,                color: '#22C55E' },
            { label: 'Done today',      value: dayTasks.filter(t=>t.done).length,  color: '#3B82F6' },
            { label: 'Global goals',    value: goalTasks.length,               color: '#A855F7' },
            { label: 'Goals achieved',  value: goalTasks.filter(t=>t.done).length, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2.5 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 dark:border-white/5 dark:bg-white/[0.03]">
              <span className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── Tasks of the Day ── */}
          <TaskSection
            type="day"
            title="Tasks of the Day"
            subtitle="Your daily wellness checklist"
            accentColor="#22C55E"
            icon={Icon.calendar}
            tasks={dayTasks}
            onAdd={() => setModal({ type: 'day', mode: 'add' })}
            onToggle={id => toggleTask('day', id)}
            onEdit={task => setModal({ type: 'day', mode: 'edit', task })}
            onDelete={id => deleteTask('day', id)}
          />

          {/* ── Global Goals ── */}
          <TaskSection
            type="goal"
            title="Global Goals"
            subtitle="Long-term objectives you're working toward"
            accentColor="#A855F7"
            icon={Icon.target}
            tasks={goalTasks}
            onAdd={() => setModal({ type: 'goal', mode: 'add' })}
            onToggle={id => toggleTask('goal', id)}
            onEdit={task => setModal({ type: 'goal', mode: 'edit', task })}
            onDelete={id => deleteTask('goal', id)}
          />
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <TaskModal
          mode={modal.mode}
          type={modal.type}
          initial={modal.task}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
