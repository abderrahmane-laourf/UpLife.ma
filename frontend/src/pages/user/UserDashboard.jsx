import { useAuth } from '../../hooks/useAuth.jsx'

export default function UserDashboard() {
  const { user } = useAuth()

  const activities = [
    { id: 1, title: 'Welcome to UpLife!', description: 'Complete your profile to get started', icon: '👋', time: 'Just now' },
    { id: 2, title: 'Daily Goal', description: 'Set your daily wellness goal', icon: '🎯', time: '1 hour ago' },
    { id: 3, title: 'Track Progress', description: 'Log your first activity', icon: '📊', time: '2 hours ago' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="rounded-lg bg-gradient-to-r from-[#22C55E] to-[#16A34A] p-8 text-black shadow-lg">
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}! 👋</h1>
        <p className="mt-2 text-lg opacity-90">Let's continue your wellness journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <div className="text-4xl">🔥</div>
          <p className="mt-2 text-sm text-gray-400">Streak</p>
          <p className="mt-1 text-2xl font-bold text-white">7 days</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <div className="text-4xl">⭐</div>
          <p className="mt-2 text-sm text-gray-400">Points</p>
          <p className="mt-1 text-2xl font-bold text-white">1,234</p>
        </div>
        <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
          <div className="text-4xl">🏆</div>
          <p className="mt-2 text-sm text-gray-400">Level</p>
          <p className="mt-1 text-2xl font-bold text-white">Level 5</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-white">Your Activities</h3>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 rounded-lg bg-gray-700 p-4">
              <div className="text-3xl">{activity.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{activity.title}</h4>
                <p className="mt-1 text-sm text-gray-400">{activity.description}</p>
                <p className="mt-2 text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
