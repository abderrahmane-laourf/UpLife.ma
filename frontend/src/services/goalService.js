import { apiFetch } from './api';

/**
 * Goal API Service
 * Handles all goal-related API calls
 */

/**
 * Get active goal
 * @returns {Promise<Object>} { message, goal }
 */
export async function getActiveGoal() {
  return apiFetch('/api/goals/active');
}

/**
 * Get all goals (history)
 * @returns {Promise<Object>} { message, goals }
 */
export async function getAllGoals() {
  return apiFetch('/api/goals');
}

/**
 * Create or update goal
 * @param {Object} data - Goal data
 * @param {string} data.title - Goal title (required)
 * @param {string} data.description - Goal description (optional)
 * @param {number} data.categoryId - Category ID (required)
 * @param {string} data.deadline - Deadline date (optional, ISO format)
 * @returns {Promise<Object>} { message, goal }
 */
export async function createOrUpdateGoal(data) {
  return apiFetch('/api/goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update goal
 * @param {number} id - Goal ID
 * @param {Object} data - Updated goal data
 * @returns {Promise<Object>} { message, goal }
 */
export async function updateGoal(id, data) {
  return apiFetch(`/api/goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Complete goal
 * @param {number} id - Goal ID
 * @returns {Promise<Object>} { message, goal }
 */
export async function completeGoal(id) {
  return apiFetch(`/api/goals/${id}/complete`, {
    method: 'PATCH',
  });
}

/**
 * Delete goal
 * @param {number} id - Goal ID
 * @returns {Promise<Object>} { message }
 */
export async function deleteGoal(id) {
  return apiFetch(`/api/goals/${id}`, {
    method: 'DELETE',
  });
}

// ========== Partial Goals ==========

/**
 * Get all partial goals for a goal
 * @param {number} goalId - Goal ID
 * @returns {Promise<Object>} { message, partialGoals }
 */
export async function getPartialGoals(goalId) {
  return apiFetch(`/api/goals/${goalId}/partial`);
}

/**
 * Create partial goal
 * @param {number} goalId - Goal ID
 * @param {Object} data - Partial goal data
 * @param {string} data.title - Title (required)
 * @param {string} data.description - Description (optional)
 * @param {number} data.order - Display order (optional)
 * @returns {Promise<Object>} { message, partialGoal }
 */
export async function createPartialGoal(goalId, data) {
  return apiFetch(`/api/goals/${goalId}/partial`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update partial goal
 * @param {number} goalId - Goal ID
 * @param {number} id - Partial goal ID
 * @param {Object} data - Updated data
 * @returns {Promise<Object>} { message, partialGoal }
 */
export async function updatePartialGoal(goalId, id, data) {
  return apiFetch(`/api/goals/${goalId}/partial/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Toggle partial goal completion
 * @param {number} goalId - Goal ID
 * @param {number} id - Partial goal ID
 * @returns {Promise<Object>} { message, partialGoal, mainGoalCompleted }
 */
export async function togglePartialGoalCompletion(goalId, id) {
  return apiFetch(`/api/goals/${goalId}/partial/${id}/toggle`, {
    method: 'PATCH',
  });
}

/**
 * Delete partial goal
 * @param {number} goalId - Goal ID
 * @param {number} id - Partial goal ID
 * @returns {Promise<Object>} { message }
 */
export async function deletePartialGoal(goalId, id) {
  return apiFetch(`/api/goals/${goalId}/partial/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Reorder partial goals
 * @param {number} goalId - Goal ID
 * @param {number[]} partialGoalIds - Array of partial goal IDs in new order
 * @returns {Promise<Object>} { message }
 */
export async function reorderPartialGoals(goalId, partialGoalIds) {
  return apiFetch(`/api/goals/${goalId}/partial/reorder`, {
    method: 'PATCH',
    body: JSON.stringify({ partialGoalIds }),
  });
}
