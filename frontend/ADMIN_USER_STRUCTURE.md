# 🎯 Admin & User Dashboard Structure

## 📁 Complete Frontend Structure

```
frontend/src/
├── hooks/
│   └── useAuth.js              ✅ Authentication hook (login, logout, user state)
│
├── guards/
│   └── RoleGuard.jsx           ✅ Route protection by role
│
├── layouts/
│   ├── AdminLayout.jsx         ✅ Admin dashboard layout (sidebar, header)
│   └── UserLayout.jsx          ✅ User dashboard layout (sidebar, header)
│
├── pages/
│   ├── auth/                   ✅ Authentication pages
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── ResetPasswordPage.jsx
│   │
│   ├── admin/                  ✅ Admin pages
│   │   ├── AdminDashboard.jsx
│   │   ├── UsersManagement.jsx
│   │   ├── Settings.jsx        (placeholder)
│   │   └── Reports.jsx         (placeholder)
│   │
│   └── user/                   ✅ User pages
│       ├── UserDashboard.jsx
│       ├── Profile.jsx
│       └── Activities.jsx      (placeholder)
│
└── App.jsx                     ✅ Updated with role-based routing
```

---

## 🔐 Authentication Flow

### 1. Login Process
```javascript
User enters credentials
    ↓
LoginPage validates
    ↓
API returns: { user: {..., role: 'ADMIN' | 'USER'}, accessToken }
    ↓
useAuth.login() saves to localStorage + state
    ↓
Redirects based on role:
  - ADMIN → /admin
  - USER  → /dashboard
```

### 2. Route Protection
```javascript
User tries to access /admin
    ↓
RoleGuard checks:
  - Is authenticated? → No → Redirect to /login
  - Has ADMIN role? → No → Redirect to /dashboard
  - Has ADMIN role? → Yes → Allow access ✅
```

---

## 🎨 Admin Dashboard

### Layout Features
- ✅ Collapsible sidebar (responsive)
- ✅ Top navigation bar
- ✅ User profile section
- ✅ Logout button
- ✅ Mobile-friendly (hamburger menu)

### Admin Pages

#### 1. Dashboard (/admin)
- **Stats Cards**: Total Users, Active Today, Revenue, Support Tickets
- **Recent Activity**: Latest user registrations
- **Charts**: (can add later)

#### 2. Users Management (/admin/users)
- **Users Table**: Name, Phone, Role, Status
- **Actions**: Edit, Delete
- **Search & Filter**: Find users quickly
- **Add User Button**: Create new users

#### 3. Settings (/admin/settings)
- Placeholder - ready for development

#### 4. Reports (/admin/reports)
- Placeholder - ready for development

---

## 👤 User Dashboard

### Layout Features
- ✅ Collapsible sidebar (responsive)
- ✅ Top navigation bar
- ✅ User profile section
- ✅ Logout button
- ✅ Mobile-friendly

### User Pages

#### 1. Dashboard (/dashboard)
- **Welcome Card**: Personalized greeting
- **Quick Stats**: Streak, Points, Level
- **Activities Feed**: Recent user activities

#### 2. Profile (/dashboard/profile)
- **Profile Picture**: Avatar with initial
- **Edit Form**: Name, Phone, Email
- **Security Section**: Change password link

#### 3. Activities (/dashboard/activities)
- Placeholder - ready for development

---

## 🛡️ Role-Based Access Control

### Roles in Database
```prisma
enum UserRole {
  USER
  ADMIN
}

model User {
  ...
  role  UserRole  @default(USER)
}
```

### Protected Routes
```javascript
// Admin only
/admin/*           → Requires ADMIN role

// User only
/dashboard/*       → Requires USER role

// Public
/login
/register
/forgot-password
```

---

## 🔑 useAuth Hook API

```javascript
const {
  user,              // Current user object { id, name, phone, role }
  loading,           // Auth state loading
  login,             // login(userData, token) - Save auth & redirect
  logout,            // logout() - Clear auth & redirect to login
  isAuthenticated,   // Boolean: is user logged in?
  isAdmin,           // Boolean: is user ADMIN?
  isUser,            // Boolean: is user USER?
} = useAuth()
```

### Usage Examples

```javascript
// Check if admin
if (isAdmin) {
  // Show admin controls
}

// Get current user
console.log(user.name, user.role)

// Logout
<button onClick={logout}>Logout</button>
```

---

## 🎨 Styling & Design

### Color Scheme
- **Primary**: `#22C55E` (Green)
- **Background**: `#050505` (Black)
- **Cards**: `#1F2937` (Gray-800)
- **Text**: White/Gray-300
- **Borders**: Gray-700

### Components
- **Cards**: Rounded-lg with shadow
- **Buttons**: Primary green, hover effects
- **Tables**: Striped rows, hover states
- **Sidebar**: Dark with active state highlight
- **Mobile**: Overlay sidebar with backdrop

---

## 📱 Responsive Design

### Desktop (lg: 1024px+)
- Sidebar always visible
- Full width tables
- Multi-column grids

### Tablet/Mobile (< 1024px)
- Hamburger menu
- Sidebar slides in/out
- Stacked layouts
- Full-width cards

---

## 🚀 Next Steps

### Immediate
1. ✅ Database migration (add role column)
2. ✅ Update login response (include role)
3. ✅ Test admin login flow
4. ✅ Test user login flow

### Future Enhancements

#### Admin Dashboard
- [ ] Real-time stats from API
- [ ] Charts & analytics
- [ ] User CRUD operations
- [ ] Settings page
- [ ] Reports page
- [ ] Activity logs
- [ ] Email notifications

#### User Dashboard
- [ ] Real wellness tracking
- [ ] Goals & achievements
- [ ] Activities tracking
- [ ] Social features
- [ ] Notifications
- [ ] Settings page

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register as USER (default)
- [ ] Login as USER → redirects to /dashboard
- [ ] Login as ADMIN → redirects to /admin
- [ ] Logout works correctly
- [ ] Protected routes redirect if not authenticated
- [ ] Role guard prevents wrong role access

#### Admin Dashboard
- [ ] Sidebar navigation works
- [ ] All pages load correctly
- [ ] Mobile menu works
- [ ] User table displays
- [ ] Logout button works

#### User Dashboard
- [ ] Sidebar navigation works
- [ ] All pages load correctly
- [ ] Mobile menu works
- [ ] Profile page displays
- [ ] Logout button works

---

## 📊 Database Setup

### Create Admin User Manually
```sql
-- Via database
UPDATE "User"
SET role = 'ADMIN'
WHERE phone = '+212600000000';
```

### Or via Prisma Studio
```bash
cd backend
npx prisma studio
# Open User table
# Edit role field to 'ADMIN'
```

---

## 🔧 Configuration

### Environment Variables
No additional env vars needed - uses existing auth setup

### API Endpoints
```
POST /api/auth/login  → Returns { user: {..., role}, accessToken }
```

---

## ✅ Summary

### What's Complete
- ✅ Database schema with UserRole enum
- ✅ Authentication hook with role-based logic
- ✅ Role guard for route protection
- ✅ Admin layout with sidebar
- ✅ User layout with sidebar
- ✅ Admin dashboard page
- ✅ Admin users management page
- ✅ User dashboard page
- ✅ User profile page
- ✅ Login updated to use roles
- ✅ App.jsx with role-based routing
- ✅ Responsive design
- ✅ Mobile-friendly

### Benefits
- 🔐 **Secure**: Role-based access control
- 🎨 **Modern**: Beautiful dark theme
- 📱 **Responsive**: Works on all devices
- ⚡ **Fast**: React hooks + localStorage
- 🛡️ **Protected**: Route guards
- 🎯 **Organized**: Clean structure
- 📦 **Scalable**: Easy to add more pages

---

## 🎉 Ready to Use!

Structure is complete and ready for development! 🚀

1. Run migration to add role column
2. Create an admin user
3. Login and test both dashboards
4. Start building real features!
