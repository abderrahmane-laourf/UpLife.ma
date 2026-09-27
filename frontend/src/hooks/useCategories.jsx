import { useState, useEffect } from 'react'
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService.js'

/**
 * Custom hook for managing categories
 * Fetches categories from API and provides CRUD operations
 */
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllCategories()
      setCategories(data.categories || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch categories:', err)
    } finally {
      setLoading(false)
    }
  }

  async function addCategory(categoryData) {
    try {
      setError(null)
      const data = await createCategory(categoryData)
      setCategories(prev => [...prev, data.category])
      return { success: true, category: data.category }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function editCategory(id, categoryData) {
    try {
      setError(null)
      const data = await updateCategory(id, categoryData)
      setCategories(prev => prev.map(cat => cat.id === id ? data.category : cat))
      return { success: true, category: data.category }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function removeCategory(id) {
    try {
      setError(null)
      await deleteCategory(id)
      setCategories(prev => prev.filter(cat => cat.id !== id))
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    categories,
    loading,
    error,
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  }
}
