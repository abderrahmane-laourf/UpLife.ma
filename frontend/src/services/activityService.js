import { apiFetch } from './api';

/**
 * Activity API Service
 * Handles all activity-related API calls
 */

/**
 * Get all activities for today or a specific date
 * @param {string} date - Optional ISO date string (defaults to today)
 * @returns {Promise<Object>} { message, date, activities }
 */
export async function getAllActivities(date = null) {
  const endpoint = date ? `/api/activities?date=${date}` : '/api/activities';
  return apiFetch(endpoint);
}

/**
 * Get activity by ID
 * @param {number} id - Activity ID
 * @returns {Promise<Object>} { message, activity }
 */
export async function getActivityById(id) {
  return apiFetch(`/api/activities/${id}`);
}

/**
 * Create a new activity
 * @param {Object} data - Activity data
 * @param {string} data.title - Activity title (required)
 * @param {string} data.description - Activity description (optional)
 * @param {string} data.time - Activity time/schedule (optional)
 * @param {number} data.categoryId - Category ID (required)
 * @returns {Promise<Object>} { message, activity }
 */
export async function createActivity(data) {
  return apiFetch('/api/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an activity
 * @param {number} id - Activity ID
 * @param {Object} data - Updated activity data
 * @returns {Promise<Object>} { message, activity }
 */
export async function updateActivity(id, data) {
  return apiFetch(`/api/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete an activity
 * @param {number} id - Activity ID
 * @returns {Promise<Object>} { message }
 */
export async function deleteActivity(id) {
  return apiFetch(`/api/activities/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Toggle activity done status
 * @param {number} id - Activity ID
 * @returns {Promise<Object>} { message, activity }
 */
export async function toggleActivityDone(id) {
  return apiFetch(`/api/activities/${id}/toggle`, {
    method: 'PATCH',
  });
}

/**
 * Update prayer status for an activity
 * @param {number} id - Activity ID
 * @param {boolean|null} prayerStatus - Prayer status (true, false, or null)
 * @returns {Promise<Object>} { message, activity }
 */
export async function updatePrayerStatus(id, prayerStatus) {
  return apiFetch(`/api/activities/${id}/prayer-status`, {
    method: 'PATCH',
    body: JSON.stringify({ prayerStatus }),
  });
}

/**
 * Mark all activities as day completed for today
 * @returns {Promise<Object>} { message, updated }
 */
export async function markDayComplete() {
  return apiFetch('/api/activities/day-complete', {
    method: 'PATCH',
  });
}

/**
 * Get all missed activities
 * @returns {Promise<Object>} { message, missedActivities }
 */
export async function getMissedActivities() {
  return apiFetch('/api/activities/missed/all');
}

/**
 * Add reason to missed activity
 * @param {number} id - Missed activity ID
 * @param {string} reason - Reason for missing the activity
 * @returns {Promise<Object>} { message, missedActivity }
 */
export async function updateMissedActivityReason(id, reason) {
  return apiFetch(`/api/activities/missed/${id}/reason`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

/**
 * Update missed activity (edit title, description, time, reason)
 * @param {number} id - Missed activity ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} { message, missedActivity }
 */
export async function updateMissedActivity(id, data) {
  return apiFetch(`/api/activities/missed/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete missed activity
 * @param {number} id - Missed activity ID
 * @returns {Promise<Object>} { message }
 */
export async function deleteMissedActivity(id) {
  return apiFetch(`/api/activities/missed/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Restore missed activity to completed
 * @param {number} id - Missed activity ID
 * @returns {Promise<Object>} { message, activity }
 */
export async function restoreMissedActivity(id) {
  return apiFetch(`/api/activities/missed/${id}/restore`, {
    method: 'POST',
  });
}

/**
 * Move unfinished activities to missed
 * @param {string} date - Optional ISO date string (defaults to today)
 * @returns {Promise<Object>} { message, moved }
 */
export async function moveUnfinishedToMissed(date = null) {
  const body = date ? { date } : {};
  return apiFetch('/api/activities/missed/move', {
    method: 'POST',
    ...(date && { body: JSON.stringify(body) }),
  });
}

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} { message, stats }
 */
export async function getDashboardStats() {
  return apiFetch('/api/activities/stats/dashboard');
}

/**
 * Get daily completion trend (last 30 days)
 * @returns {Promise<Object>} { message, trend }
 */
export async function getDailyCompletionTrend() {
  return apiFetch('/api/activities/stats/daily-trend');
}
