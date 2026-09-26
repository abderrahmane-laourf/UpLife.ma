import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart, Label,
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

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, accent = '#22C55E', trend }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]">
      {/* accent blob */}
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10" style={{ backgroundColor: accent }} />
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
          style={{ backgroundColor: `${accent}22` }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${trend >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-600">{sub}</p>}
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

function getCategoryColor(label) {
  try {
    const cats = JSON.parse(localStorage.getItem('uplife-categories') || '[]')
    const match = cats.find(c => c.label === label)
    if (match) return match.color
  } catch {}
  
  const DEFAULT = { Fitness: '#22C55E', Health: '#3B82F6', Wellness: '#A855F7', Nutrition: '#F59E0B', Growth: '#EC4899' }
  return DEFAULT[label] || '#22C55E'
}

function readGoal() {
  try { return JSON.parse(localStorage.getItem('uplife-goal') || 'null') } catch { return null }
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function UserDashboard() {
  const totalTasks = categoryData.reduce((s, c) => s + c.value, 0)
  const completedToday = 2
  const pendingToday = 4
  const streak = 7
  const rate = Math.round((completedToday / 6) * 100)

  const goal = readGoal()
  const goalColor = goal ? getCategoryColor(goal.category) : '#22C55E'
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
            <div className="flex items-start gap-4">
              {/* Pulsing target icon */}
              <div className="relative flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${goalColor}22` }}>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: goalColor }}>
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full" style={{ background: goalColor, animation: 'pulse 2s infinite', boxShadow: `0 0 0 0 ${goalColor}` }} />
              </div>

              <div>
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
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No global goal set yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Go to <span className="font-semibold text-[#22C55E]">Profile → My Global Goal</span> to set your main objective.</p>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          label="Completed Today" value={completedToday} sub="out of 6 tasks" accent="#22C55E" trend={12}
        />
        <StatCard
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>}
          label="Pending Today" value={pendingToday} sub="due before midnight" accent="#F59E0B" trend={-8}
        />
        <StatCard
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/></svg>}
          label="Day Streak" value={`${streak} days`} sub="keep going!" accent="#EF4444" trend={16}
        />
        <StatCard
          icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>}
          label="Completion Rate" value={`${rate}%`} sub="today vs yesterday" accent="#A855F7" trend={5}
        />
      </div>

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
        </div>

        {/* Donut by Category (2/5) */}
        <div className="col-span-2 rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">Tasks by Category</h2>
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">All time breakdown</p>
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
        </div>
      </div>

      {/* ── Row 2: Area Trend Chart ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Completion Rate Trend</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Weekly % of tasks completed — past 7 weeks</p>
          </div>
          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[11px] font-semibold text-purple-500">+{trendData[trendData.length-1].rate - trendData[0].rate}% overall</span>
        </div>
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
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} domain={[40, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22C55E', strokeWidth: 1, strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="rate" name="rate" stroke="#22C55E" strokeWidth={2.5} fill="url(#rateGrad)" dot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
