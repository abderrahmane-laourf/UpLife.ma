import { useState, useEffect, useCallback } from 'react'
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService.js'

/**
 * Custom hook for managing categories
 * @returns {Object} Categories state and methods
 */
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllCategories()
      setCategories(data.categories || [])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch single category
  const fetchCategory = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCategoryById(id)
      return data.category
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Create new category
  const addCategory = useCallback(async (categoryData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await createCategory(categoryData)
      setCategories((prev) => [data.category, ...prev])
      return data.category
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update category
  const editCategory = useCallback(async (id, categoryData) => {
    setLoading(true)
    setError(null)
    try {
      const data = await updateCategory(id, categoryData)
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? data.category : cat))
      )
      return data.category
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete category
  const removeCategory = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      await deleteCategory(id)
      setCategories((prev) => prev.filter((cat) => cat.id !== id))
      return true
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-fetch on mount
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    fetchCategories,
    fetchCategory,
    addCategory,
    editCategory,
    removeCategory,
  }
}
