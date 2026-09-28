import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────
const MODES = {
  STOPWATCH: 'stopwatch',
  COUNTDOWN: 'countdown',
  POMODORO:  'pomodoro',
}

const POMODORO_PRESETS = [
  { label: 'Focus',        seconds: 25 * 60, color: '#22C55E' },
  { label: 'Short Break',  seconds:  5 * 60, color: '#3B82F6' },
  { label: 'Long Break',   seconds: 15 * 60, color: '#A855F7' },
]

const COUNTDOWN_PRESETS = [
  { label: '1 min',  seconds:  1 * 60 },
  { label: '5 min',  seconds:  5 * 60 },
  { label: '10 min', seconds: 10 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '20 min', seconds: 20 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '60 min', seconds: 60 * 60 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pad(n) { return String(Math.floor(n)).padStart(2, '0') }

function formatTime(ms, showMs = true) {
  const totalSeconds = Math.floor(ms / 1000)
  const h  = Math.floor(totalSeconds / 3600)
  const m  = Math.floor((totalSeconds % 3600) / 60)
  const s  = totalSeconds % 60
  const ms_ = Math.floor((ms % 1000) / 10)
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  if (showMs) return `${pad(m)}:${pad(s)}.${pad(ms_)}`
  return `${pad(m)}:${pad(s)}`
}

function formatCountdown(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`
  return `${pad(m)}:${pad(s)}`
}

// ─── SVG Ring ────────────────────────────────────────────────────────────────
function RingProgress({ pct = 1, color = '#22C55E', size = 260, stroke = 10 }) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const off  = circ * (1 - Math.max(0, Math.min(1, pct)))
  return (
    <svg width={size} height={size} className="absolute inset-0 -rotate-90" viewBox={`0 0 ${size} ${size}`}>
      {/* track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-gray-200 dark:text-white/10"
      />
      {/* progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={off}
        style={{ transition: 'stroke-dashoffset 0.25s linear, stroke 0.4s ease' }}
      />
    </svg>
  )
}

// ─── Lap Row ─────────────────────────────────────────────────────────────────
function LapRow({ lap, index, isFastest, isSlowest }) {
  return (
    <div className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm transition-all ${
      isFastest ? 'bg-[#22C55E]/10 text-[#22C55E]' :
      isSlowest ? 'bg-red-500/10 text-red-400' :
      'bg-gray-100/60 text-gray-700 dark:bg-white/[0.04] dark:text-gray-300'
    }`}>
      <span className="font-medium w-16">Lap {lap.number}</span>
      <span className="font-mono tabular-nums">{formatTime(lap.split, false)}</span>
      <span className="font-mono tabular-nums text-right w-28 text-gray-400 dark:text-gray-500">{formatTime(lap.total, false)}</span>
      {isFastest && <span className="text-xs font-bold ml-1">Best</span>}
      {isSlowest && <span className="text-xs font-bold ml-1 text-red-400">Slow</span>}
    </div>
  )
}

// ─── Stopwatch ───────────────────────────────────────────────────────────────
function Stopwatch() {
  const [elapsed, setElapsed]   = useState(0)
  const [running, setRunning]   = useState(false)
  const [laps, setLaps]         = useState([])
  const startRef  = useRef(null)
  const rafRef    = useRef(null)
  const lastRef   = useRef(0)

  const tick = useCallback(() => {
    const now  = performance.now()
    const delta = now - (startRef.current ?? now)
    setElapsed(lastRef.current + delta)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = () => {
    startRef.current = performance.now()
    setRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }
  const pause = () => {
    cancelAnimationFrame(rafRef.current)
    lastRef.current = elapsed
    setRunning(false)
  }
  const reset = () => {
    cancelAnimationFrame(rafRef.current)
    setRunning(false)
    setElapsed(0)
    setLaps([])
    lastRef.current = 0
  }
  const lap = () => {
    const lapTotal = elapsed
    const prev = laps[0]?.total ?? 0
    setLaps(p => [{ number: p.length + 1, total: lapTotal, split: lapTotal - prev }, ...p])
  }

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  const fastestSplit = laps.length > 1 ? Math.min(...laps.map(l => l.split)) : null
  const slowestSplit = laps.length > 1 ? Math.max(...laps.map(l => l.split)) : null

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Clock Face */}
      <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
        <RingProgress pct={1} color="#22C55E" />
        <div className="relative z-10 flex flex-col items-center gap-1 select-none">
          <span className="font-mono text-5xl font-bold tracking-tight text-gray-900 dark:text-white tabular-nums">
            {formatTime(elapsed)}
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
            {running ? 'Running' : elapsed > 0 ? 'Paused' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Lap / Reset */}
        <button
          onClick={running ? lap : reset}
          disabled={elapsed === 0}
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all disabled:opacity-30 ${
            running
              ? 'border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/10'
              : 'border-red-400/60 text-red-400 hover:bg-red-400/10'
          }`}
        >
          {running ? 'Lap' : 'Reset'}
        </button>

        {/* Play / Pause */}
        <button
          onClick={running ? pause : start}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 ${
            running
              ? 'bg-yellow-400 shadow-yellow-400/30 text-black hover:bg-yellow-300'
              : 'bg-[#22C55E] shadow-[#22C55E]/30 text-black hover:bg-[#16A34A]'
          }`}
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? (
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="h-7 w-7 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Spacer to balance layout */}
        <div className="h-14 w-14" />
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="w-full max-w-sm space-y-1.5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Laps</p>
            <div className="flex gap-3 text-xs text-gray-400">
              <span className="w-28 text-right font-medium">Split</span>
              <span className="w-28 text-right font-medium">Total</span>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {laps.map(l => (
              <LapRow
                key={l.number}
                lap={l}
                index={l.number}
                isFastest={l.split === fastestSplit}
                isSlowest={l.split === slowestSplit}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Countdown ───────────────────────────────────────────────────────────────
function Countdown() {
  const [totalSecs, setTotalSecs]  = useState(5 * 60)
  const [remaining, setRemaining]  = useState(5 * 60)
  const [running, setRunning]      = useState(false)
  const [finished, setFinished]    = useState(false)
  const [inputH, setInputH]        = useState('00')
  const [inputM, setInputM]        = useState('05')
  const [inputS, setInputS]        = useState('00')

  const intervalRef = useRef(null)

  const clearTimer = () => { clearInterval(intervalRef.current); intervalRef.current = null }

  const applyCustom = () => {
    const secs = (parseInt(inputH) || 0) * 3600 + (parseInt(inputM) || 0) * 60 + (parseInt(inputS) || 0)
    if (secs <= 0) return
    clearTimer()
    setRunning(false)
    setFinished(false)
    setTotalSecs(secs)
    setRemaining(secs)
  }

  const start = () => {
    if (remaining <= 0) return
    setFinished(false)
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          setFinished(true)
          return 0
        }
        return r - 1
      })
    }, 1000)
  }

  const pause = () => { clearTimer(); setRunning(false) }
  const reset = () => {
    clearTimer()
    setRunning(false)
    setFinished(false)
    setRemaining(totalSecs)
  }

  useEffect(() => () => clearTimer(), [])

  const pct = totalSecs > 0 ? remaining / totalSecs : 0
  const color = finished ? '#EF4444' : pct > 0.5 ? '#22C55E' : pct > 0.2 ? '#F59E0B' : '#EF4444'

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Clock Face */}
      <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
        <RingProgress pct={pct} color={color} />
        <div className="relative z-10 flex flex-col items-center gap-1 select-none">
          <span className={`font-mono text-5xl font-bold tracking-tight tabular-nums transition-colors ${
            finished ? 'text-red-400 animate-pulse' : 'text-gray-900 dark:text-white'
          }`}>
            {formatCountdown(remaining)}
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
            {finished ? '🎉 Done!' : running ? 'Counting down' : remaining < totalSecs ? 'Paused' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap justify-center gap-2">
        {COUNTDOWN_PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => {
              clearTimer(); setRunning(false); setFinished(false)
              setTotalSecs(p.seconds); setRemaining(p.seconds)
            }}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
              totalSecs === p.seconds
                ? 'bg-[#22C55E] text-black shadow-md shadow-[#22C55E]/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-gray-400 dark:hover:bg-white/10'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Time Input */}
      <div className="flex items-center gap-2">
        {[
          { val: inputH, set: setInputH, label: 'H' },
          { val: inputM, set: setInputM, label: 'M' },
          { val: inputS, set: setInputS, label: 'S' },
        ].map(({ val, set, label }, i) => (
          <span key={label} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-400 font-bold text-lg">:</span>}
            <div className="flex flex-col items-center gap-0.5">
              <input
                type="number" min="0" max={label === 'H' ? 23 : 59}
                value={val}
                onChange={e => set(e.target.value.padStart(2, '0'))}
                className="w-14 rounded-xl border border-gray-200 bg-white px-2 py-2 text-center font-mono text-sm font-semibold text-gray-900 outline-none focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              />
              <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">{label}</span>
            </div>
          </span>
        ))}
        <button
          onClick={applyCustom}
          className="ml-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-200 dark:bg-white/[0.06] dark:text-gray-300 dark:hover:bg-white/10"
        >
          Set
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-400/60 text-red-400 text-sm font-semibold transition hover:bg-red-400/10"
        >
          Reset
        </button>
        <button
          onClick={running ? pause : start}
          disabled={remaining === 0 && !finished}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-30 ${
            running
              ? 'bg-yellow-400 shadow-yellow-400/30 text-black hover:bg-yellow-300'
              : 'bg-[#22C55E] shadow-[#22C55E]/30 text-black hover:bg-[#16A34A]'
          }`}
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? (
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="h-7 w-7 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="h-14 w-14" />
      </div>
    </div>
  )
}

// ─── Pomodoro ─────────────────────────────────────────────────────────────────
function Pomodoro() {
  const [phaseIdx, setPhaseIdx]    = useState(0)
  const [remaining, setRemaining]  = useState(POMODORO_PRESETS[0].seconds)
  const [running, setRunning]      = useState(false)
  const [finished, setFinished]    = useState(false)
  const [cycles, setCycles]        = useState(0)
  const intervalRef = useRef(null)

  const phase   = POMODORO_PRESETS[phaseIdx]
  const total   = phase.seconds
  const pct     = total > 0 ? remaining / total : 0

  const clearTimer = () => { clearInterval(intervalRef.current); intervalRef.current = null }

  const selectPhase = (i) => {
    clearTimer()
    setRunning(false)
    setFinished(false)
    setPhaseIdx(i)
    setRemaining(POMODORO_PRESETS[i].seconds)
  }

  const start = () => {
    setFinished(false)
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          setFinished(true)
          if (phaseIdx === 0) setCycles(c => c + 1)
          return 0
        }
        return r - 1
      })
    }, 1000)
  }
  const pause = () => { clearTimer(); setRunning(false) }
  const reset = () => { clearTimer(); setRunning(false); setFinished(false); setRemaining(total) }

  useEffect(() => () => clearTimer(), [])

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Phase Tabs */}
      <div className="flex gap-2 rounded-2xl bg-gray-100/80 p-1 dark:bg-white/[0.06]">
        {POMODORO_PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => selectPhase(i)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              phaseIdx === i
                ? 'text-black shadow-md'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            style={phaseIdx === i ? { background: p.color } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Clock Face */}
      <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
        <RingProgress pct={pct} color={phase.color} />
        <div className="relative z-10 flex flex-col items-center gap-1 select-none">
          <span className={`font-mono text-5xl font-bold tracking-tight tabular-nums transition-colors ${
            finished ? 'animate-pulse' : 'text-gray-900 dark:text-white'
          }`} style={finished ? { color: phase.color } : {}}>
            {formatCountdown(remaining)}
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-gray-400">
            {finished ? '✅ Complete!' : running ? phase.label : 'Ready'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-400/60 text-red-400 text-sm font-semibold transition hover:bg-red-400/10"
        >
          Reset
        </button>
        <button
          onClick={running ? pause : start}
          disabled={remaining === 0 && !finished}
          className="flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-30"
          style={{ background: phase.color, boxShadow: `0 8px 24px ${phase.color}40` }}
          aria-label={running ? 'Pause' : 'Start'}
        >
          {running ? (
            <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="h-7 w-7 translate-x-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="h-14 w-14" />
      </div>

      {/* Cycle counter */}
      <div className="flex flex-col items-center gap-1">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Focus cycles completed</p>
        <div className="flex gap-2 mt-1">
          {Array.from({ length: Math.max(4, cycles) }).map((_, i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-full transition-all"
              style={{
                background: i < cycles ? POMODORO_PRESETS[0].color : undefined,
                opacity: i < cycles ? 1 : 0.2,
                border: i < cycles ? 'none' : '2px solid #9ca3af',
              }}
            />
          ))}
          {cycles > 4 && (
            <span className="text-xs font-bold text-[#22C55E] ml-1">+{cycles - 4}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TimerPage() {
  const [mode, setMode] = useState(MODES.STOPWATCH)

  const tabs = [
    {
      id: MODES.STOPWATCH,
      label: 'Stopwatch',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="13" r="8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4l2.5 2.5M9 3h6M12 3v2" />
        </svg>
      ),
    },
    {
      id: MODES.COUNTDOWN,
      label: 'Countdown',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: MODES.POMODORO,
      label: 'Pomodoro',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.047 8.287 8.287 0 009 9.618a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.463z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timer</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Stopwatch, countdown, and Pomodoro in one place.</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
              mode === tab.id
                ? 'bg-[#22C55E] text-black shadow-lg shadow-[#22C55E]/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.06] dark:text-gray-400 dark:hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timer Card */}
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        {mode === MODES.STOPWATCH && <Stopwatch />}
        {mode === MODES.COUNTDOWN && <Countdown />}
        {mode === MODES.POMODORO  && <Pomodoro  />}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { emoji: '⏱', title: 'Stopwatch', desc: 'Track elapsed time and record lap splits.' },
          { emoji: '⏳', title: 'Countdown', desc: 'Set a custom time and get notified when done.' },
          { emoji: '🍅', title: 'Pomodoro',  desc: '25 min focus + 5 min break for deep work.' },
        ].map(card => (
          <div
            key={card.title}
            className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <span className="text-2xl">{card.emoji}</span>
            <p className="mt-2 text-sm font-semibold text-gray-800 dark:text-white">{card.title}</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
