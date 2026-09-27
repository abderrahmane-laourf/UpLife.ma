const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Store access token in memory (not localStorage)
let accessToken = null
let isRefreshing = false
let refreshSubscribers = []

function onAccessTokenRefreshed(token) {
  refreshSubscribers.forEach((callback) => callback(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback)
}

export function setAccessToken(token) {
  accessToken = token
}

export function getAccessToken() {
  return accessToken
}

export function clearAccessToken() {
  accessToken = null
}

async function refreshAccessToken() {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Refresh token expired')
    }

    const data = await response.json()
    setAccessToken(data.accessToken)
    return data.accessToken
  } catch (error) {
    clearAccessToken()
    throw error
  }
}

export async function apiRequest(path, options = {}) {
  const makeRequest = async (token) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    })

    return response
  }

  let response = await makeRequest(accessToken)

  // If 401 and we have a token, try to refresh
  if (response.status === 401 && accessToken) {
    if (!isRefreshing) {
      isRefreshing = true

      try {
        const newToken = await refreshAccessToken()
        isRefreshing = false
        onAccessTokenRefreshed(newToken)
        
        // Retry original request with new token
        response = await makeRequest(newToken)
      } catch (error) {
        isRefreshing = false
        clearAccessToken()
        // Redirect to login
        window.location.href = '/login'
        throw new Error('Session expired. Please login again.')
      }
    } else {
      // Wait for refresh to complete
      const newToken = await new Promise((resolve) => {
        addRefreshSubscriber((token) => {
          resolve(token)
        })
      })
      
      response = await makeRequest(newToken)
    }
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export function saveAccessToken(token) {
  setAccessToken(token)
}

