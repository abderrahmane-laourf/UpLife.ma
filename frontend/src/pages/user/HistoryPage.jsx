import { useState } from 'react'

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
function ReviewCard({ review }) {
  const mood = MOODS.find(m => m.value === review.mood)
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]">
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

// ─── Initial mock reviews ─────────────────────────────────────────────────────
const mockReviews = [
  {
    id: 1,
    date: 'Sep 24, 2026',
    mood: 4,
    learned: 'Completed my morning run and stayed consistent with hydration. Learned that small habits compound over time.',
    tomorrow: 'Wake up at 6 AM and do a 20-min meditation before checking my phone.',
    highlight: 'Finished reading chapter 5 of Atomic Habits',
    challenge: 'Had trouble avoiding junk food at lunch',
  },
  {
    id: 2,
    date: 'Sep 23, 2026',
    mood: 3,
    learned: 'Yoga session was tough but I pushed through. Realized I need to sleep earlier to have more energy.',
    tomorrow: 'Sleep by 10 PM and prepare healthy lunch the night before.',
    highlight: '',
    challenge: 'Low energy all afternoon',
  },
  {
    id: 3,
    date: 'Sep 22, 2026',
    mood: 5,
    learned: 'Best day this week! Hit all my targets — workout, nutrition, reading, and meditation.',
    tomorrow: 'Replicate today\'s schedule and add 5 mins of journaling.',
    highlight: 'Personal best on morning run — 5km in 27 min!',
    challenge: 'None today 🎉',
  },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HistoryPage() {
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const [reviews, setReviews] = useState(mockReviews)
  const [submitted, setSubmitted] = useState(false)

  const [mood, setMood] = useState(null)
  const [learned, setLearned] = useState('')
  const [tomorrow, setTomorrow] = useState('')
  const [highlight, setHighlight] = useState('')
  const [challenge, setChallenge] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!mood || !learned.trim() || !tomorrow.trim()) return

    const newReview = {
      id: Date.now(),
      date: today,
      mood,
      learned,
      tomorrow,
      highlight,
      challenge,
    }
    setReviews(prev => [newReview, ...prev])
    setSubmitted(true)
    setMood(null)
    setLearned('')
    setTomorrow('')
    setHighlight('')
    setChallenge('')

    setTimeout(() => setSubmitted(false), 3000)
  }

  const isValid = mood !== null && learned.trim() && tomorrow.trim()

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Review</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Reflect on your day and plan tomorrow — {today}</p>
      </div>

      {/* ── Today's Review Form ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        {/* Form header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] shadow-md shadow-[#22C55E]/30">
            <svg className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Tonight's Entry</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">How was your day, {today}?</p>
          </div>
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
              disabled={!isValid}
              className="flex items-center gap-2 rounded-xl bg-[#22C55E] px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-[#22C55E]/30 transition-all hover:-translate-y-0.5 hover:bg-[#16A34A] hover:shadow-[#22C55E]/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:translate-y-0"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Save Review
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
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16 dark:border-white/10">
            <span className="text-4xl">📖</span>
            <p className="mt-3 font-semibold text-gray-700 dark:text-gray-300">No reviews yet</p>
            <p className="mt-1 text-sm text-gray-500">Write your first daily review above!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}
      </div>
    </div>
  )
}
