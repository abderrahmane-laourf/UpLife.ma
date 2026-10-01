import { apiFetch } from './api';

/**
 * NoFap Counter Service
 * Handles all NoFap counter API calls
 */

/**
 * Get current counter
 * @returns {Promise<Object>} { message, counter }
 */
export async function getCounter() {
  return apiFetch('/api/nofap');
}

/**
 * Start or reset counter
 * @returns {Promise<Object>} { message, counter }
 */
export async function startCounter() {
  return apiFetch('/api/nofap/start', {
    method: 'POST',
  });
}

/**
 * Report a relapse
 * @returns {Promise<Object>} { message, counter }
 */
export async function reportRelapse() {
  return apiFetch('/api/nofap/relapse', {
    method: 'POST',
  });
}

/**
 * Pause counter
 * @returns {Promise<Object>} { message, counter }
 */
export async function pauseCounter() {
  return apiFetch('/api/nofap/pause', {
    method: 'PATCH',
  });
}

/**
 * Resume counter
 * @returns {Promise<Object>} { message, counter }
 */
export async function resumeCounter() {
  return apiFetch('/api/nofap/resume', {
    method: 'PATCH',
  });
}

/**
 * Delete counter
 * @returns {Promise<Object>} { message }
 */
export async function deleteCounter() {
  return apiFetch('/api/nofap', {
    method: 'DELETE',
  });
}

/**
 * Get stats
 * @returns {Promise<Object>} { message, stats }
 */
export async function getStats() {
  return apiFetch('/api/nofap/stats');
}
