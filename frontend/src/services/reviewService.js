import { apiRequest } from './authService';

/**
 * Get all daily reviews
 */
export async function getAllReviews() {
  return apiRequest('/api/reviews', {
    method: 'GET',
  });
}

/**
 * Get review by date (YYYY-MM-DD format)
 */
export async function getReviewByDate(date) {
  return apiRequest(`/api/reviews/date/${date}`, {
    method: 'GET',
  });
}

/**
 * Get today's review
 */
export async function getTodayReview() {
  return apiRequest('/api/reviews/today', {
    method: 'GET',
  });
}

/**
 * Create a daily review
 */
export async function createReview(reviewData) {
  return apiRequest('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
}

/**
 * Update review
 */
export async function updateReview(id, reviewData) {
  return apiRequest(`/api/reviews/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData),
  });
}

/**
 * Delete review
 */
export async function deleteReview(id) {
  return apiRequest(`/api/reviews/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get review statistics
 */
export async function getReviewStats() {
  return apiRequest('/api/reviews/stats', {
    method: 'GET',
  });
}
