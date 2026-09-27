const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get all daily reviews
 */
export async function getAllReviews() {
  const response = await fetch(`${API_URL}/api/reviews`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch reviews');
  }

  return response.json();
}

/**
 * Get review by date (YYYY-MM-DD format)
 */
export async function getReviewByDate(date) {
  const response = await fetch(`${API_URL}/api/reviews/date/${date}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch review');
  }

  return response.json();
}

/**
 * Get today's review
 */
export async function getTodayReview() {
  const response = await fetch(`${API_URL}/api/reviews/today`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch today\'s review');
  }

  return response.json();
}

/**
 * Create a daily review
 */
export async function createReview(reviewData) {
  const response = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create review');
  }

  return response.json();
}

/**
 * Update review
 */
export async function updateReview(id, reviewData) {
  const response = await fetch(`${API_URL}/api/reviews/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update review');
  }

  return response.json();
}

/**
 * Delete review
 */
export async function deleteReview(id) {
  const response = await fetch(`${API_URL}/api/reviews/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete review');
  }

  return response.json();
}

/**
 * Get review statistics
 */
export async function getReviewStats() {
  const response = await fetch(`${API_URL}/api/reviews/stats`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch statistics');
  }

  return response.json();
}
