import { useState, useEffect } from 'react'
import { getAllReviews, createReview, updateReview, deleteReview } from '../../services/reviewService'

// ─── Mood options ─────────────────────────────────────────────────────────────
const MOODS = [
  { value: 5, label: 'Amazing',  emoji: '🤩', color: '#22C55E' },
  { value: 4, label: 'Good',     emoji: '😊', color: '#86EFAC' },
  { value: 3, label: 'Okay',     emoji: '😐', color: '#F59E0B' },
  { value: 2, label: 'Bad',      emoji: '😔', color: '#F97316' },
  { value: 1, label: 'Terrible', emoji: '😤', color: '#EF4444' },
]

// ─── Reusable textarea field ──────────────────────────────────────────────────
function ReviewField({ id, label, icon, placeholder, value, onChange, rows = 3, required = false }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
          {icon}
        </span>
        {label}
        {required && <span className="text-[#22C55E]">*</span>}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-[#22C55E] focus:bg-white focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder-gray-500 dark:focus:border-[#22C55E] dark:focus:bg-white/[0.07]"
      />
    </div>
  )
}

// ─── Past review card ─────────────────────────────────────────────────────────
function ReviewCard({ review, onDelete, onEdit }) {
  const mood = MOODS.find(m => m.value === review.mood)
  const [showActions, setShowActions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    try {
      setIsDeleting(true)
      await onDelete(review.id)
    } catch (error) {
      console.error('Failed to delete review:', error)
      alert('Failed to delete review')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div 
      className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Action buttons */}
      <div className={`absolute top-3 right-3 flex gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => onEdit(review)}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 transition-all hover:bg-blue-500/20 dark:text-blue-400"
          title="Edit review"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-600 transition-all hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
          title="Delete review"
        >
          {isDeleting ? (
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

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{mood?.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{review.date}</p>
            <p className="text-xs" style={{ color: mood?.color }}>{mood?.label} day</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map(s => (
            <div key={s} className="h-1.5 w-4 rounded-full" style={{ backgroundColor: s <= review.mood ? mood?.color : '#e5e7eb' }} />
          ))}
        </div>
      </div>
      {review.learned && (
        <div className="mb-2">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Learned</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{review.learned}</p>
        </div>
      )}
      {review.tomorrow && (
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Tomorrow's goal</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{review.tomorrow}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const [reviews, setReviews] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [editingReview, setEditingReview] = useState(null)

  const [mood, setMood] = useState(null)
  const [learned, setLearned] = useState('')
  const [tomorrow, setTomorrow] = useState('')
  const [highlight, setHighlight] = useState('')
  const [challenge, setChallenge] = useState('')

  // Fetch reviews on component mount
  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoading(true)
        setError(null)
        const data = await getAllReviews()
        
        // Format dates for display
        const formattedReviews = data.reviews.map(review => ({
          ...review,
          date: new Date(review.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        }))
        
        setReviews(formattedReviews)
      } catch (err) {
        console.error('Failed to fetch reviews:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!mood || !learned.trim() || !tomorrow.trim()) return

    try {
      setSubmitting(true)
      setError(null)

      const reviewData = {
        mood,
        learned: learned.trim(),
        tomorrow: tomorrow.trim(),
        highlight: highlight.trim() || undefined,
        challenge: challenge.trim() || undefined,
      }

      if (editingReview) {
        // Update existing review
        const result = await updateReview(editingReview.id, reviewData)
        
        const updatedReview = {
          ...result.review,
          date: new Date(result.review.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        }
        
        setReviews(prev => prev.map(r => r.id === editingReview.id ? updatedReview : r))
        setEditingReview(null)
      } else {
        // Create new review
        const result = await createReview(reviewData)
        
        const newReview = {
          ...result.review,
          date: new Date(result.review.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        }
        
        setReviews(prev => [newReview, ...prev])
      }
      
      setSubmitted(true)
      
      // Reset form
      setMood(null)
      setLearned('')
      setTomorrow('')
      setHighlight('')
      setChallenge('')

      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      console.error('Failed to save review:', err)
      setError(err.message)
      setSubmitting(false)
    } finally {
      if (!error) {
        setSubmitting(false)
      }
    }
  }

  function handleEdit(review) {
    setEditingReview(review)
    setMood(review.mood)
    setLearned(review.learned || '')
    setTomorrow(review.tomorrow || '')
    setHighlight(review.highlight || '')
    setChallenge(review.challenge || '')
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancelEdit() {
    setEditingReview(null)
    setMood(null)
    setLearned('')
    setTomorrow('')
    setHighlight('')
    setChallenge('')
  }

  async function handleDelete(id) {
    try {
      await deleteReview(id)
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error('Failed to delete review:', err)
      throw err
    }
  }

  const isValid = mood !== null && learned.trim() && tomorrow.trim()

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Review</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Reflect on your day and plan tomorrow — {today}</p>
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

      {/* ── Today's Review Form ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        {/* Form header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] shadow-md shadow-[#22C55E]/30">
              <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {editingReview ? 'Edit Review' : 'Tonight\'s Entry'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {editingReview ? `Editing ${editingReview.date}` : `How was your day, ${today}?`}
              </p>
            </div>
          </div>
          {editingReview && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Mood Selector */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#22C55E]/10 text-[#22C55E]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              How do you feel today? <span className="text-[#22C55E]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    mood === m.value
                      ? 'border-transparent shadow-lg scale-105'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300'
                  }`}
                  style={mood === m.value ? { backgroundColor: `${m.color}22`, color: m.color, borderColor: `${m.color}66` } : {}}
                >
                  <span className="text-lg">{m.emoji}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-white/5" />

          {/* Text fields */}
          <div className="grid gap-5 md:grid-cols-2">
            <ReviewField
              id="learned"
              label="What did you learn today?"
              icon={
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m1.636 6.364l.707-.707M12 20v1M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              placeholder="Share a lesson, insight, or skill you practiced today..."
              value={learned}
              onChange={setLearned}
              rows={4}
              required
            />
            <ReviewField
              id="tomorrow"
              label="What's your goal for tomorrow?"
              icon={
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              placeholder="Set one clear intention for tomorrow..."
              value={tomorrow}
              onChange={setTomorrow}
              rows={4}
              required
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <ReviewField
              id="highlight"
              label="Best moment of the day"
              icon={
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
              placeholder="What made you smile or feel proud today?"
              value={highlight}
              onChange={setHighlight}
              rows={2}
            />
            <ReviewField
              id="challenge"
              label="What was challenging?"
              icon={
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              placeholder="What obstacle did you face? How did you handle it?"
              value={challenge}
              onChange={setChallenge}
              rows={2}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            {submitted && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-[#22C55E]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Review saved!
              </span>
            )}
            {!submitted && <div />}
            <button
              type="submit"
              disabled={!isValid || submitting}
              className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-[#22C55E]/30 transition-all hover:-translate-y-0.5 hover:bg-[#16A34A] hover:shadow-[#22C55E]/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
            >
              {submitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {editingReview ? 'Update Review' : 'Save Review'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Past Reviews ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Past Reviews</h2>
          <span className="rounded-full bg-[#22C55E]/10 px-2.5 py-0.5 text-xs font-semibold text-[#22C55E]">{reviews.length}</span>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 py-16 dark:border-white/10">
            <svg className="h-8 w-8 animate-spin text-[#22C55E]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 dark:border-white/10">
            <span className="text-4xl">📖</span>
            <p className="mt-3 font-semibold text-gray-700 dark:text-gray-300">No reviews yet</p>
            <p className="mt-1 text-sm text-gray-500">Write your first daily review above!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map(r => <ReviewCard key={r.id} review={r} onDelete={handleDelete} onEdit={handleEdit} />)}
          </div>
        )}
      </div>
    </div>
  )
}
