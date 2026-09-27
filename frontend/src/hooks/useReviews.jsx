import { useState, useEffect } from 'react'
import { 
  getAllReviews, 
  getTodayReview, 
  getReviewByDate,
  createReview, 
  updateReview, 
  deleteReview, 
  getReviewStats 
} from '../services/reviewService.js'

/**
 * Custom hook for managing daily reviews
 * Fetches reviews from API and provides CRUD operations
 */
export function useReviews() {
  const [reviews, setReviews] = useState([])
  const [todayReview, setTodayReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  // Fetch reviews on mount
  useEffect(() => {
    fetchReviews()
    fetchTodayReview()
    fetchStats()
  }, [])

  async function fetchReviews() {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllReviews()
      setReviews(data.reviews || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTodayReview() {
    try {
      const data = await getTodayReview()
      setTodayReview(data.review)
    } catch (err) {
      // It's okay if there's no review for today yet
      setTodayReview(null)
      console.log('No review for today yet')
    }
  }

  async function fetchReviewByDate(date) {
    try {
      setError(null)
      const data = await getReviewByDate(date)
      return { success: true, review: data.review }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function fetchStats() {
    try {
      const data = await getReviewStats()
      setStats(data.stats || null)
    } catch (err) {
      console.error('Failed to fetch review stats:', err)
    }
  }

  async function addReview(reviewData) {
    try {
      setError(null)
      const data = await createReview(reviewData)
      setReviews(prev => [data.review, ...prev])
      setTodayReview(data.review)
      fetchStats() // Update stats
      return { success: true, review: data.review }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function editReview(id, reviewData) {
    try {
      setError(null)
      const data = await updateReview(id, reviewData)
      setReviews(prev => prev.map(review => review.id === id ? data.review : review))
      
      // Update today's review if it's the one being edited
      if (todayReview && todayReview.id === id) {
        setTodayReview(data.review)
      }
      
      return { success: true, review: data.review }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  async function removeReview(id) {
    try {
      setError(null)
      await deleteReview(id)
      setReviews(prev => prev.filter(review => review.id !== id))
      
      // Clear today's review if it's the one being deleted
      if (todayReview && todayReview.id === id) {
        setTodayReview(null)
      }
      
      fetchStats() // Update stats
      return { success: true }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  return {
    reviews,
    todayReview,
    loading,
    error,
    stats,
    fetchReviews,
    fetchTodayReview,
    fetchReviewByDate,
    addReview,
    editReview,
    removeReview,
  }
}
