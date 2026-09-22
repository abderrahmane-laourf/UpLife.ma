import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function Profile() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Update profile:', formData)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">My Profile</h2>
        <p className="text-gray-400">Manage your personal information</p>
      </div>

      <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
        {/* Profile Picture */}
        <div className="mb-6 flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#22C55E] text-4xl font-bold text-black">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-medium text-white">{user?.name}</h3>
            <p className="text-sm text-gray-400">{user?.role}</p>
            <button className="mt-2 text-sm text-[#22C55E] hover:text-[#16A34A]">
              Change Photo
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              disabled
              className="w-full rounded-lg border border-gray-700 bg-gray-700 px-4 py-2 text-gray-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">Phone number cannot be changed</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Email (Optional)</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-[#22C55E] focus:outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="rounded-lg bg-[#22C55E] px-6 py-2 font-medium text-black transition hover:bg-[#16A34A]"
            >
              Save Changes
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-700 px-6 py-2 font-medium text-gray-300 transition hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Security Section */}
      <div className="rounded-lg bg-gray-800 p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold text-white">Security</h3>
        <button className="text-[#22C55E] hover:text-[#16A34A]">
          Change Password
        </button>
      </div>
    </div>
  )
}
