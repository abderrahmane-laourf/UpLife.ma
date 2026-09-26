import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import RoleGuard from './guards/RoleGuard.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'
import UserLayout from './layouts/UserLayout.jsx'

// Auth Pages
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import UsersManagement from './pages/admin/UsersManagement.jsx'

// User Pages
import UserDashboard from './pages/user/UserDashboard.jsx'
import SettingsPage from './pages/user/SettingsPage.jsx'
import ActivitiesPage from './pages/user/ActivitiesPage.jsx'
import NotesPage from './pages/user/NotesPage.jsx'
import HistoryPage from './pages/user/HistoryPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ResetPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <AdminLayout />
              </RoleGuard>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="settings" element={<div className="text-white">Settings Page</div>} />
            <Route path="reports" element={<div className="text-white">Reports Page</div>} />
          </Route>

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <RoleGuard allowedRoles={['USER']}>
                <UserLayout />
              </RoleGuard>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="history" element={<HistoryPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
