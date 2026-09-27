import express from 'express';
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleActivityDone,
  getMissedActivities,
  updateMissedActivityReason,
  moveUnfinishedToMissed,
} from './activity.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * All activity routes require authentication
 */
router.use(authMiddleware);

/**
 * Activity CRUD routes
 */
// Get all activities for today
router.get('/', getAllActivities);

// Get activity by ID
router.get('/:id', getActivityById);

// Create new activity
router.post('/', createActivity);

// Update activity
router.put('/:id', updateActivity);

// Delete activity
router.delete('/:id', deleteActivity);

// Toggle activity done status
router.patch('/:id/toggle', toggleActivityDone);

/**
 * Missed activities routes
 */
// Get all missed activities
router.get('/missed/all', getMissedActivities);

// Add reason to missed activity
router.patch('/missed/:id/reason', updateMissedActivityReason);

// Move unfinished activities to missed (can be called by cron)
router.post('/missed/move', moveUnfinishedToMissed);

export default router;
