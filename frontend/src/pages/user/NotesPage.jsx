import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { getAllNotes, createNote, updateNote, deleteNote } from '../../services/noteService'

// ─── Note Colors ──────────────────────────────────────────────────────────────
const NOTE_COLORS = [
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#A855F7', // Purple
  '#F59E0B', // Orange
  '#EC4899', // Pink
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#9CA3AF', // Gray
]

// ─── Modal ────────────────────────────────────────────────────────────────────
function NoteModal({ mode, initial, onSave, onClose }) {
  const [title,   setTitle]   = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [color,   setColor]   = useState(initial?.color || NOTE_COLORS[0])
  const ref = useRef(null)
  
  useEffect(() => ref.current?.focus(), [])

  function submit(e) {
    e.preventDefault()
    if (!title.trim() && !content.trim()) return
    onSave({ 
      title: title.trim(), 
      content: content.trim(), 
      color, 
      updatedAt: new Date().toISOString() 
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl dark:bg-[#111]"
        style={{ animation: 'modalIn 0.18s ease', border: `1px solid ${color}40` }}
      >
        {/* Header Ribbon */}
        <div className="h-3 rounded-t-3xl" style={{ backgroundColor: color }} />
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            {mode === 'add' ? 'New Note' : 'Edit Note'}
          </h3>
          <button onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-5">
          <div>
            <input 
              ref={ref} 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Note Title"
              className="w-full bg-transparent text-xl font-bold text-gray-900 placeholder-gray-400 outline-none dark:text-white dark:placeholder-gray-500" 
            />
          </div>

          <div>
            <textarea 
              rows={6} 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Start writing..."
              className="w-full resize-none bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none dark:text-gray-300 dark:placeholder-gray-600" 
            />
          </div>

          <div className="pt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Color Label</p>
            <div className="flex flex-wrap gap-2">
              {NOTE_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full transition-all ${color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#111] shadow-md' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c, ringColor: c }} 
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5"
              style={{ backgroundColor: color, boxShadow: `0 4px 14px 0 ${color}40` }}>
              {mode === 'add' ? 'Save Note' : 'Update Note'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

// ─── Note Card ────────────────────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete, deleting }) {
  return (
    <div 
      className="group relative mb-4 break-inside-avoid rounded-2xl p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
      style={{ backgroundColor: `${note.color}15`, border: `1px solid ${note.color}30` }}
    >
      <div className="mb-2 flex items-start justify-between gap-4">
        {note.title && (
          <h3 className="font-bold text-gray-900 dark:text-white" style={{ color: note.color }}>
            {note.title}
          </h3>
        )}
        <div className="flex opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0 bg-white/50 dark:bg-black/20 rounded-lg p-0.5 backdrop-blur-sm">
          <button 
            onClick={() => onEdit(note)} 
            disabled={deleting}
            className="rounded p-1 text-gray-500 hover:bg-black/5 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white transition disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(note.id)} 
            disabled={deleting}
            className="rounded p-1 text-gray-500 hover:bg-red-500/10 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-500/20 transition disabled:opacity-50"
          >
            {deleting ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {note.content && (
        <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {note.content}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        <span>{new Date(note.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(null)

  // Fetch notes on mount and when search changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes()
    }, search ? 300 : 0) // Debounce search

    return () => clearTimeout(timer)
  }, [search])

  async function fetchNotes() {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllNotes(search)
      setNotes(data.notes)
    } catch (err) {
      console.error('Failed to fetch notes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(data) { 
    try {
      const result = await createNote(data)
      setNotes(prev => [result.note, ...prev])
      setModal(null)
    } catch (err) {
      console.error('Failed to create note:', err)
      alert('Failed to create note: ' + err.message)
    }
  }
  
  async function handleEdit(data) { 
    try {
      const result = await updateNote(modal.note.id, data)
      setNotes(prev => prev.map(n => n.id === modal.note.id ? result.note : n))
      setModal(null)
    } catch (err) {
      console.error('Failed to update note:', err)
      alert('Failed to update note: ' + err.message)
    }
  }
  
  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this note?')) return
    
    try {
      setDeleting(id)
      await deleteNote(id)
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to delete note:', err)
      alert('Failed to delete note: ' + err.message)
    } finally {
      setDeleting(null)
    }
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
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mdawanat</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Capture your thoughts and ideas.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full sm:w-64 pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 outline-none transition focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500"
              />
            </div>
            
            <button onClick={() => setModal({ mode: 'add' })}
              className="flex-shrink-0 flex items-center gap-2 rounded-xl bg-[#22C55E] px-4 py-2.5 text-sm font-bold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Note
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 py-24 dark:border-white/10">
            <svg className="h-8 w-8 animate-spin text-[#22C55E]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading notes...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-24 dark:border-white/10">
            <div className="text-5xl mb-4">📓</div>
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              {search ? 'No notes found' : 'No notes yet'}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              {search ? 'Try a different search term.' : 'Click "New Note" to capture a thought.'}
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 pb-12">
            {notes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note}
                deleting={deleting === note.id}
                onEdit={n => setModal({ mode: 'edit', note: n })}
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <NoteModal
          mode={modal.mode}
          initial={modal.note}
          onSave={modal.mode === 'add' ? handleAdd : handleEdit}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}
