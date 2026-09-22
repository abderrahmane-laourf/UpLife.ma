export default function AdminDashboard() {
  const stats = [
    { name: 'Total Users', value: '1,234', icon: '👥', change: '+12%', changeType: 'positive' },
    { name: 'Active Today', value: '567', icon: '✅', change: '+5%', changeType: 'positive' },
    { name: 'Revenue', value: '$45,231', icon: '💰', change: '+23%', changeType: 'positive' },
    { name: 'Support Tickets', value: '12', icon: '🎫', change: '-8%', changeType: 'negative' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
        <p className="text-gray-400">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="rounded-lg bg-gray-800 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={`font-medium ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
              <span className="ml-2 text-gray-400">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-white">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b border-gray-700 pb-4 last:border-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22C55E] text-lg font-bold text-black">
                U{i}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">New user registered</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
