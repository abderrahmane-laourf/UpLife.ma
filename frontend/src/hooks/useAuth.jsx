import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, setAccessToken, clearAccessToken } from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Try to restore session from refresh token (stored in httpOnly cookie)
    const restoreSession = async () => {
      try {
        const data = await apiRequest('/api/auth/refresh', { method: 'POST' })
        setAccessToken(data.accessToken)
        
        // Get user info (you can add a /me endpoint or decode from token)
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.log('No valid session found')
        clearAccessToken()
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = (userData, accessToken) => {
    setUser(userData)
    setAccessToken(accessToken)
    localStorage.setItem('user', JSON.stringify(userData))
    
    // Redirect based on role
    if (userData.role === 'ADMIN') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      clearAccessToken()
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isUser: user?.role === 'USER',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
