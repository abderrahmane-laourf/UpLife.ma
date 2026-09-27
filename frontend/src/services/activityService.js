const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get all activities for today
 */
export async function getAllActivities() {
  const response = await fetch(`${API_URL}/api/activities`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch activities');
  }

  return response.json();
}

/**
 * Get activity by ID
 */
export async function getActivityById(id) {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch activity');
  }

  return response.json();
}

/**
 * Create a new activity
 */
export async function createActivity(activityData) {
  const response = await fetch(`${API_URL}/api/activities`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activityData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create activity');
  }

  return response.json();
}

/**
 * Update activity
 */
export async function updateActivity(id, activityData) {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(activityData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update activity');
  }

  return response.json();
}

/**
 * Delete activity
 */
export async function deleteActivity(id) {
  const response = await fetch(`${API_URL}/api/activities/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete activity');
  }

  return response.json();
}

/**
 * Toggle activity done status
 */
export async function toggleActivityDone(id) {
  const response = await fetch(`${API_URL}/api/activities/${id}/toggle`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle activity');
  }

  return response.json();
}

/**
 * Get all missed activities
 */
export async function getMissedActivities() {
  const response = await fetch(`${API_URL}/api/activities/missed/all`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch missed activities');
  }

  return response.json();
}

/**
 * Add reason to missed activity
 */
export async function updateMissedActivityReason(id, reason) {
  const response = await fetch(`${API_URL}/api/activities/missed/${id}/reason`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update reason');
  }

  return response.json();
}

/**
 * Move unfinished activities to missed
 */
export async function moveUnfinishedToMissed() {
  const response = await fetch(`${API_URL}/api/activities/missed/move`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to move activities');
  }

  return response.json();
}
