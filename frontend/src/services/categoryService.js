import { apiFetch } from './api';

/**
 * Category API Service
 * Handles all category-related API calls
 */

/**
 * Get all categories
 * @returns {Promise<Object>} { message, categories, total }
 */
export async function getAllCategories() {
  return apiFetch('/api/categories');
}

/**
 * Get category by ID
 * @param {number} id - Category ID
 * @returns {Promise<Object>} { message, category }
 */
export async function getCategoryById(id) {
  return apiFetch(`/api/categories/${id}`);
}

/**
 * Create a new category
 * @param {Object} data - Category data
 * @param {string} data.name - Category name (required)
 * @param {string} data.description - Category description (optional)
 * @param {string} data.color - Category color in hex format (optional, default: #22C55E)
 * @returns {Promise<Object>} { message, category }
 */
export async function createCategory(data) {
  return apiFetch('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update a category
 * @param {number} id - Category ID
 * @param {Object} data - Updated category data
 * @returns {Promise<Object>} { message, category }
 */
export async function updateCategory(id, data) {
  return apiFetch(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a category
 * @param {number} id - Category ID
 * @returns {Promise<Object>} { message, deletedCategory }
 */
export async function deleteCategory(id) {
  return apiFetch(`/api/categories/${id}`, {
    method: 'DELETE',
  });
}
