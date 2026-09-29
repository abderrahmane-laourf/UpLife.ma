# Authentication Fix - "Missing or invalid token" Error

## 🔴 Problem

The Activities page was showing errors:
```
Failed to load activities
API Error: Error: Missing or invalid token
```

## 🔍 Root Cause Analysis

### The Issue
The application had **two different API request systems**:

1. **`authService.apiRequest()`** ✅
   - Used for login/auth endpoints
   - Includes `Authorization: Bearer {token}` header
   - Handles token refresh automatically
   - Works correctly

2. **`api.apiFetch()`** ❌ (Original Implementation)
   - Used for activities/categories endpoints
   - Did NOT include the `Authorization` header
   - Missing token caused 401 errors

### Backend Expectation
The `auth.middleware.js` requires:
```javascript
const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return res.status(401).json({ message: 'Missing or invalid token' });
}
```

## ✅ Solution Applied

### Updated `src/services/api.js`

**Before:**
```javascript
async function apiFetch(endpoint, options = {}) {
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };
  
  const response = await fetch(url, config);
  // ... no token included!
}
```

**After:**
```javascript
import { apiRequest } from './authService.js';

async function apiFetch(endpoint, options = {}) {
  try {
    // Reuse the authService.apiRequest which:
    // 1. Includes Authorization header with token
    // 2. Handles token refresh automatically
    // 3. Redirects to login on session expiry
    const data = await apiRequest(endpoint, options);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### Updated Service Endpoints

Changed all endpoints to include `/api` prefix since `apiRequest` expects full paths:

**`activityService.js` & `categoryService.js`:**
```javascript
// Before
return apiFetch('/activities')

// After
return apiFetch('/api/activities')
```

## 🎯 How Authentication Works Now

### Token Flow

1. **Login** (`LoginPage.jsx`)
   ```javascript
   const data = await apiRequest('/api/auth/login', {...})
   login(data.user, data.accessToken)
   ```
   - User credentials sent to backend
   - Backend returns: `accessToken` (JWT) + `refreshToken` (httpOnly cookie)
   - Access token stored in memory by `authService`

2. **Protected API Calls** (Activities, Categories, etc.)
   ```javascript
   const data = await apiFetch('/api/activities')
   ```
   - Internally uses `authService.apiRequest()`
   - Automatically adds `Authorization: Bearer {token}` header
   - Token retrieved from memory via `getAccessToken()`

3. **Token Refresh** (Automatic)
   - If API returns 401 (token expired)
   - Automatically calls `/api/auth/refresh` with refresh cookie
   - Gets new access token
   - Retries the original request
   - If refresh fails → redirect to login

### Token Storage Strategy

- ✅ **Access Token**: Stored in **memory** (not localStorage)
  - More secure against XSS attacks
  - Lost on page refresh (intentionally)
  
- ✅ **Refresh Token**: Stored in **httpOnly cookie** (set by backend)
  - Cannot be accessed by JavaScript
  - Protected against XSS
  - Used to get new access tokens

- ✅ **User Data**: Stored in **localStorage** (non-sensitive)
  - Only for UI display (name, email, role)
  - No sensitive auth data

### Session Restoration

On app load (`useAuth.jsx`):
```javascript
useEffect(() => {
  const restoreSession = async () => {
    const data = await apiRequest('/api/auth/refresh', { method: 'POST' })
    setAccessToken(data.accessToken)
    setUser(JSON.parse(localStorage.getItem('user')))
  }
  restoreSession()
}, [])
```

## 🧪 Testing the Fix

1. **Login First**
   ```
   Navigate to /login
   Enter credentials
   Click "Login"
   ```

2. **Test Activities Page**
   ```
   Navigate to /activities
   Should load without errors
   Try creating/editing/deleting activities
   ```

3. **Test Token Refresh**
   ```
   Wait for token to expire (~15 minutes)
   Try any action
   Should auto-refresh and continue working
   ```

4. **Test Session Expiry**
   ```
   Clear cookies (refresh token)
   Try any action
   Should redirect to /login
   ```

## 🔒 Security Benefits

1. **Access Token in Memory**
   - Not accessible via `document.cookie`
   - Not accessible via `localStorage`
   - XSS attacks cannot steal it

2. **Refresh Token in httpOnly Cookie**
   - JavaScript cannot read it
   - Sent automatically by browser
   - Protected by CORS and SameSite policies

3. **Automatic Token Refresh**
   - User stays logged in seamlessly
   - No need to re-login frequently
   - Minimal exposure window for access tokens

4. **Centralized Auth Logic**
   - Single source of truth for token management
   - Consistent error handling
   - Easier to maintain and audit

## 🐛 Troubleshooting

### Still getting "Missing or invalid token"?

1. **Check if logged in:**
   ```javascript
   // In browser console
   localStorage.getItem('user')
   // Should return user object
   ```

2. **Check if token exists:**
   ```javascript
   // Add to authService.js temporarily
   console.log('Access Token:', getAccessToken())
   ```

3. **Check cookies:**
   - Open DevTools → Application → Cookies
   - Should see `refreshToken` cookie

4. **Check backend:**
   ```bash
   # Verify JWT_SECRET is set in backend/.env
   echo $JWT_SECRET
   ```

### Token expires immediately?

Check backend JWT expiry settings:
```javascript
// backend/src/lib/jwt.js
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'
```

### CORS errors?

Ensure backend allows credentials:
```javascript
// backend/src/server.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
```

## 📝 Summary

**Problem:** Activities API calls failed with "Missing or invalid token"

**Cause:** New API service didn't include authentication headers

**Fix:** Unified API requests to use `authService.apiRequest()` which handles:
- Authorization headers
- Token refresh
- Session expiry
- Error handling

**Result:** All API calls now authenticated properly ✅

---

**Date Fixed:** 2026-09-29  
**Affected Files:**
- `frontend/src/services/api.js`
- `frontend/src/services/activityService.js`
- `frontend/src/services/categoryService.js`
