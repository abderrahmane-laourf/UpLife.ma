import { apiRequest } from './authService.js';

/**
 * Base API configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling and automatic token refresh
 * Uses the same authentication mechanism as authService
 */
async function apiFetch(endpoint, options = {}) {
  try {
    // Use apiRequest from authService which handles tokens and refresh automatically
    const data = await apiRequest(endpoint, options);
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export { API_BASE_URL, apiFetch };
