import { useState } from 'react'

/**
 * TaskCard — Reusable task component
 * Props:
 *  - id: unique identifier
 *  - title: task title
 *  - description: task description
 *  - time: deadline or time label (e.g. "Today, 5:00 PM")
 *  - done: boolean — initial completion state
 *  - category: optional category label (e.g. "Fitness", "Work")
 *  - categoryColor: optional hex color for the category badge
 *  - onToggle: optional callback(id, newDoneState)
 */
export default function TaskCard({
  id,
  title,
  description,
  time,
  done: initialDone = false,
  category,
  categoryColor = '#22C55E',
  onToggle,
}) {
  const [done, setDone] = useState(initialDone)

  function handleToggle() {
    const next = !done
    setDone(next)
    onToggle?.(id, next)
  }

  return (
    <div
      className={`group relative flex items-start gap-4 rounded-2xl border p-4 transition-all duration-300 ${
        done
          ? 'border-green-500/20 bg-green-500/5 dark:bg-green-500/5'
          : 'border-gray-200 bg-white hover:border-[#22C55E]/40 hover:shadow-md hover:shadow-[#22C55E]/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#22C55E]/40'
      }`}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={done ? 'Mark as incomplete' : 'Mark as complete'}
        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
          done
            ? 'border-[#22C55E] bg-[#22C55E] shadow-md shadow-[#22C55E]/30'
            : 'border-gray-300 bg-transparent hover:border-[#22C55E] dark:border-white/30'
        }`}
      >
        {done && (
          <svg className="h-3 w-3 text-black" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`text-sm font-semibold transition-all duration-300 ${
              done
                ? 'text-gray-400 line-through dark:text-gray-500'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {title}
          </h3>
          {category && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: `${categoryColor}22`,
                color: categoryColor,
              }}
            >
              {category}
            </span>
          )}
        </div>

        {description && (
          <p
            className={`mt-1 text-xs leading-relaxed transition-all duration-300 ${
              done ? 'text-gray-400/60 line-through dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {description}
          </p>
        )}

        {time && (
          <div className="mt-2.5 flex items-center gap-1.5">
            <svg
              className={`h-3 w-3 flex-shrink-0 ${done ? 'text-gray-400' : 'text-[#22C55E]'}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 6v6l4 2" />
            </svg>
            <span
              className={`text-[11px] font-medium ${
                done ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {time}
            </span>
          </div>
        )}
      </div>

      {/* Done check indicator */}
      {done && (
        <div className="absolute right-4 top-4">
          <svg className="h-4 w-4 text-[#22C55E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      )}
    </div>
  )
}
