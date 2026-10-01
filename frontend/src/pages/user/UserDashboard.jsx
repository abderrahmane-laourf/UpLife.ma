import { useState, useEffect } from 'react'
import { getDashboardStats, getDailyCompletionTrend } from '../../services/activityService'
import * as nofapService from '../../services/nofapService'
import * as goalService from '../../services/goalService'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, Label, Line, LineChart,
} from 'recharts'

// ─── shared task data (same categories as ActivitiesPage) ───────────────────
const categoryData = [
  { name: 'Fitness',   value: 8,  color: '#22C55E' },
  { name: 'Health',    value: 6,  color: '#3B82F6' },
  { name: 'Wellness',  value: 5,  color: '#A855F7' },
  { name: 'Nutrition', value: 7,  color: '#F59E0B' },
  { name: 'Growth',    value: 4,  color: '#EC4899' },
]

const weeklyData = [
  { day: 'Mon', completed: 3, total: 6 },
  { day: 'Tue', completed: 5, total: 6 },
  { day: 'Wed', completed: 4, total: 6 },
  { day: 'Thu', completed: 6, total: 6 },
  { day: 'Fri', completed: 2, total: 6 },
  { day: 'Sat', completed: 5, total: 6 },
  { day: 'Sun', completed: 4, total: 6 },
]

const trendData = [
  { week: 'W1', rate: 55 },
  { week: 'W2', rate: 62 },
  { week: 'W3', rate: 58 },
  { week: 'W4', rate: 71 },
  { week: 'W5', rate: 80 },
  { week: 'W6', rate: 75 },
  { week: 'W7', rate: 88 },
]

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-gray-900/95 px-3 py-2 text-xs shadow-xl dark:bg-gray-900/95">
      <p className="mb-1 font-semibold text-white">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-bold">{p.value}{p.name === 'rate' ? '%' : ''}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Donut center label ──────────────────────────────────────────────────────
function DonutLabel({ viewBox, total }) {
  const { cx, cy } = viewBox
  return (
    <>
      <text x={cx} y={cy - 6} textAnchor="middle" className="fill-gray-900 dark:fill-white" fontSize={22} fontWeight={700}>{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fill="#6b7280">tasks</text>
    </>
  )
}

function getCategoryColor(categoryName, categoryColor) {
  // If color is provided from backend, use it
  if (categoryColor) return categoryColor
  
  // Fallback to defaults
  const DEFAULT = { Fitness: '#22C55E', Health: '#3B82F6', Wellness: '#A855F7', Nutrition: '#F59E0B', Growth: '#EC4899' }
  return DEFAULT[categoryName] || '#22C55E'
}

function readGoal() {
  // Deprecated - keeping for backward compatibility
  try { return JSON.parse(localStorage.getItem('uplife-goal') || 'null') } catch { return null }
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function UserDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [dailyTrend, setDailyTrend] = useState([])
  const [noFapCounter, setNoFapCounter] = useState(null)
  const [noFapLoading, setNoFapLoading] = useState(true)
  const [goal, setGoal] = useState(null)
  const [goalLoading, setGoalLoading] = useState(true)

  // Fetch dashboard stats
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching dashboard stats...')
        
        const [dashboardData, trendData] = await Promise.all([
          getDashboardStats(),
          getDailyCompletionTrend(),
        ])
        
        console.log('Dashboard data received:', dashboardData)
        console.log('Trend data received:', trendData)
        
        setStats(dashboardData.stats)
        setDailyTrend(trendData.data)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
        })
        setError(err.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch NoFap counter
  useEffect(() => {
    async function fetchNoFap() {
      try {
        setNoFapLoading(true)
        const data = await nofapService.getCounter()
        setNoFapCounter(data.counter)
      } catch (err) {
        console.error('Failed to fetch NoFap counter:', err)
        // Don't show error, just don't display the card
        setNoFapCounter(null)
      } finally {
        setNoFapLoading(false)
      }
    }

    fetchNoFap()
  }, [])

  // Fetch Goal from backend
  useEffect(() => {
    async function fetchGoal() {
      try {
        setGoalLoading(true)
        const data = await goalService.getActiveGoal()
        console.log('Goal data received:', data)
        setGoal(data.goal)
      } catch (err) {
        console.error('Failed to fetch goal:', err)
        // Don't show error, just don't display the goal card
        setGoal(null)
      } finally {
        setGoalLoading(false)
      }
    }

    fetchGoal()
  }, [])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-[#22C55E]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  const retryFetch = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [dashboardData, trendData] = await Promise.all([
        getDashboardStats(),
        getDailyCompletionTrend(),
      ])
      
      setStats(dashboardData.stats)
      setDailyTrend(trendData.data)
    } catch (err) {
      console.error('Retry failed:', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-900/10">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">Failed to load dashboard</h3>
            <p className="mt-1 text-sm text-red-800 dark:text-red-300">{error}</p>
            <p className="mt-2 text-xs text-red-700 dark:text-red-400">
              Make sure the backend server is running on <code className="rounded bg-red-100 px-1 py-0.5 dark:bg-red-900/40">http://localhost:3000</code>
            </p>
            <button
              onClick={retryFetch}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const weeklyData = stats?.weeklyData || []
  const categoryData = stats?.categoryData || []
  const trendData = stats?.trendData || []
  const totalTasks = categoryData.reduce((s, c) => s + c.value, 0)

  // Use goal from backend API state (not localStorage)
  const goalColor = goal ? getCategoryColor(goal.category?.label, goal.category?.color) : '#22C55E'
  const daysLeft = goal?.deadline ? daysUntil(goal.deadline) : null

  return (
    <div className="space-y-6">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your wellness overview — week of Sep 25</p>
      </div>

      {/* ── Global Goal Card ── */}
      {goal?.title ? (
        <div
          className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: `linear-gradient(135deg, ${goalColor}18 0%, ${goalColor}08 100%)`, border: `1px solid ${goalColor}30` }}
        >
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20" style={{ background: goalColor }} />
          <div className="pointer-events-none absolute -bottom-6 right-24 h-20 w-20 rounded-full opacity-10" style={{ background: goalColor }} />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Pulsing target icon */}
              <div className="relative flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${goalColor}22` }}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: goalColor }}>
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full" style={{ background: goalColor, animation: 'pulse 2s infinite', boxShadow: `0 0 0 0 ${goalColor}` }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: goalColor }}>My Global Goal</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: `${goalColor}20`, color: goalColor }}>
                    {goal.category}
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-snug">{goal.title}</h2>
                {goal.description && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{goal.description}</p>
                )}
                
                {/* Action buttons - below description */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href="/settings?tab=goal"
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:scale-105"
                    style={{ borderColor: `${goalColor}40`, background: `${goalColor}10`, color: goalColor }}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Goal
                  </a>
                  <a
                    href="/settings?tab=goal"
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white/50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:scale-105 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Manage Steps
                  </a>
                </div>
              </div>
            </div>

            {/* Days counter */}
            {daysLeft !== null && (
              <div className="flex-shrink-0 text-right">
                <p className="text-2xl font-extrabold" style={{ color: daysLeft < 14 ? '#EF4444' : goalColor }}>
                  {daysLeft > 0 ? daysLeft : 0}
                </p>
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">
                  {daysLeft > 0 ? 'days left' : 'due today'}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-600">
                  {new Date(goal.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-2xl border border-dashed border-gray-300 px-5 py-4 dark:border-white/10">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#22C55E]/10">
            <svg className="h-5 w-5 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No global goal set yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Go to <span className="font-semibold text-[#22C55E]">Settings → My Goal</span> to set your main objective.</p>
          </div>
          <a
            href="/settings?tab=goal"
            className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-[#22C55E] px-4 py-2 text-xs font-bold text-black shadow-lg shadow-[#22C55E]/25 transition hover:-translate-y-0.5 hover:bg-[#16A34A]"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Set Goal
          </a>
        </div>
      )}

      {/* ── NoFap Counter Card ── */}
      {!noFapLoading && noFapCounter && noFapCounter.isActive && (
        <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-5 dark:border-purple-500/20 dark:from-purple-500/5 dark:via-pink-500/5 dark:to-purple-500/5">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 opacity-10" />
          <div className="pointer-events-none absolute -bottom-6 right-24 h-20 w-20 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 opacity-10" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ animation: 'pulse 2s infinite' }} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    NoFap Challenge
                  </span>
                  <span className="rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    {noFapCounter.currentStreak === 1 ? '1 Day' : `${noFapCounter.currentStreak} Days`}
                  </span>
                </div>
                <h2 className="text-base font-extrabold text-gray-900 dark:text-white leading-snug">
                  {noFapCounter.currentStreak === 0 ? 'Stay Strong! Start Fresh!' : 
                   noFapCounter.currentStreak < 7 ? 'Keep Going! 💪' :
                   noFapCounter.currentStreak < 30 ? 'Great Progress! 🔥' :
                   noFapCounter.currentStreak < 90 ? 'Amazing Streak! 🌟' :
                   'Legendary! 🏆'}
                </h2>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {noFapCounter.longestStreak > noFapCounter.currentStreak && (
                    <>Personal best: {noFapCounter.longestStreak} days • </>
                  )}
                  Started {new Date(noFapCounter.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>

            {/* Days counter */}
            <div className="flex-shrink-0 text-right">
              <p className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {noFapCounter.currentStreak}
              </p>
              <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                {noFapCounter.currentStreak === 1 ? 'day clean' : 'days clean'}
              </p>
              {noFapCounter.currentStreak >= 7 && (
                <p className="mt-0.5 text-[10px] text-purple-600 dark:text-purple-400">
                  🔥 {Math.floor(noFapCounter.currentStreak / 7)} {Math.floor(noFapCounter.currentStreak / 7) === 1 ? 'week' : 'weeks'}!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Row 1: Bar Chart + Donut ── */}
      <div className="grid gap-4 lg:grid-cols-5">

        {/* Weekly Completed Bar Chart (3/5) */}
        <div className="col-span-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Task Completion</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed vs total per day</p>
            </div>
            <span className="rounded-full bg-[#22C55E]/10 px-3 py-1 text-[11px] font-semibold text-[#22C55E]">Last 7 days</span>
          </div>
          
          {weeklyData.length === 0 || weeklyData.every(d => d.total === 0) ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">No activities this week</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Start creating activities to see your progress</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="total"     name="Total"     fill="rgba(255,255,255,0.07)" radius={[6,6,0,0]} />
                <Bar dataKey="completed" name="Completed" fill="#22C55E"                radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut by Category (2/5) */}
        <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Tasks by Category</h2>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">All time breakdown</p>
          
          {categoryData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
                <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">No activities yet</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Create your first activity to see stats</p>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                  >
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                    ))}
                    <Label content={<DonutLabel total={totalTasks} />} position="center" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="mt-2 space-y-1.5">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{c.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Row 2: Daily Completion Rate Trend (Last 30 Days) ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Daily Completion Rate Trend</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Daily % of tasks completed — past 30 days</p>
          </div>
          <span className="rounded-full bg-[#22C55E]/10 px-3 py-1 text-[11px] font-semibold text-[#22C55E]">Last 30 days</span>
        </div>
        
        {dailyTrend.length === 0 || dailyTrend.every(d => d.total === 0) ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">No activity data yet</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Complete some activities to see your trends</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyTrend}>
              <defs>
                <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 11, fill: '#9ca3af' }} 
                axisLine={false} 
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#9ca3af' }} 
                axisLine={false} 
                tickLine={false} 
                width={32} 
                domain={[0, 100]} 
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22C55E', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                name="Completion Rate" 
                stroke="#22C55E" 
                strokeWidth={2.5} 
                dot={false}
                activeDot={{ r: 5, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Row 3: Weekly Area Trend Chart ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Completion Rate Trend</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Weekly % of tasks completed — past 7 weeks</p>
          </div>
          {trendData.length > 0 && trendData[0].rate !== undefined && (
            <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-purple-500">
              {trendData[trendData.length-1].rate >= trendData[0].rate ? '+' : ''}{trendData[trendData.length-1].rate - trendData[0].rate}% overall
            </span>
          )}
        </div>
        
        {trendData.length === 0 || trendData.every(d => d.rate === 0) ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">No trend data available</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Keep completing activities to build your trend</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22C55E', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="rate" name="rate" stroke="#22C55E" strokeWidth={2.5} fill="url(#rateGrad)" dot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

    </div>
  )
}
