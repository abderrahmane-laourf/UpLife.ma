import { useState } from 'react'

export default function UsersManagement() {
  const [users] = useState([
    { id: 1, name: 'John Doe', phone: '+212600000001', role: 'USER', status: 'Active' },
    { id: 2, name: 'Jane Smith', phone: '+212600000002', role: 'USER', status: 'Active' },
    { id: 3, name: 'Ahmed Ali', phone: '+212600000003', role: 'ADMIN', status: 'Active' },
    { id: 4, name: 'Sara Ben', phone: '+212600000004', role: 'USER', status: 'Inactive' },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Users Management</h2>
          <p className="text-gray-400">Manage all users in the system</p>
        </div>
        <button className="rounded-lg bg-[#22C55E] px-4 py-2 font-medium text-black transition hover:bg-[#16A34A]">
          + Add User
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-[#22C55E] focus:outline-none"
        />
        <button className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white hover:bg-gray-700">
          Filter
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg bg-gray-800 shadow-lg">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-300">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#22C55E] text-lg font-bold text-black">
                      {user.name[0]}
                    </div>
                    <span className="text-sm font-medium text-white">{user.name}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">{user.phone}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-900 text-purple-300' : 'bg-blue-900 text-blue-300'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <button className="text-[#22C55E] hover:text-[#16A34A]">Edit</button>
                  <button className="ml-4 text-red-500 hover:text-red-400">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
