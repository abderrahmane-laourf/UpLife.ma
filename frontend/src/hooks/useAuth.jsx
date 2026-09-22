import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')
    
    if (accessToken && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('accessToken')
      }
    }
    
    setLoading(false)
  }, [])

  const login = (userData, accessToken) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('accessToken', accessToken)
    
    // Redirect based on role
    if (userData.role === 'ADMIN') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    navigate('/login')
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
