import { apiRequest } from './authService.js'

/**
 * Get all categories
 * @returns {Promise<{categories: Array, total: number}>}
 */
export async function getAllCategories() {
  try {
    const data = await apiRequest('/api/categories', {
      method: 'GET',
    })
    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch categories')
  }
}

/**
 * Get single category by ID
 * @param {number} id - Category ID
 * @returns {Promise<{category: Object}>}
 */
export async function getCategoryById(id) {
  try {
    const data = await apiRequest(`/api/categories/${id}`, {
      method: 'GET',
    })
    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch category')
  }
}

/**
 * Create new category
 * @param {Object} categoryData - {name, description, color}
 * @returns {Promise<{category: Object}>}
 */
export async function createCategory(categoryData) {
  try {
    const data = await apiRequest('/api/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    })
    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to create category')
  }
}

/**
 * Update existing category
 * @param {number} id - Category ID
 * @param {Object} categoryData - {name?, description?, color?}
 * @returns {Promise<{category: Object}>}
 */
export async function updateCategory(id, categoryData) {
  try {
    const data = await apiRequest(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    })
    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to update category')
  }
}

/**
 * Delete category
 * @param {number} id - Category ID
 * @returns {Promise<{message: string}>}
 */
export async function deleteCategory(id) {
  try {
    const data = await apiRequest(`/api/categories/${id}`, {
      method: 'DELETE',
    })
    return data
  } catch (error) {
    throw new Error(error.message || 'Failed to delete category')
  }
}
