import express from 'express';
import {
  getAllReviews,
  getReviewByDate,
  getTodayReview,
  createReview,
  updateReview,
  deleteReview,
  getReviewStats,
} from './review.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * All review routes require authentication
 */
router.use(authMiddleware);

/**
 * Daily Review CRUD routes
 */
// Get all reviews
router.get('/', getAllReviews);

// Get review statistics
router.get('/stats', getReviewStats);

// Get today's review
router.get('/today', getTodayReview);

// Get review by specific date
router.get('/date/:date', getReviewByDate);

// Create new review
router.post('/', createReview);

// Update review
router.put('/:id', updateReview);

// Delete review
router.delete('/:id', deleteReview);

export default router;
