import express from 'express';
import {
  getActiveGoal,
  getAllGoals,
  createOrUpdateGoal,
  updateGoal,
  completeGoal,
  deleteGoal,
} from './goal.controller.js';
import {
  getPartialGoals,
  createPartialGoal,
  updatePartialGoal,
  togglePartialGoalCompletion,
  deletePartialGoal,
  reorderPartialGoals,
} from './partialGoal.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * All goal routes require authentication
 */
router.use(authMiddleware);

/**
 * Main Goal routes
 */
// Get active goal
router.get('/active', getActiveGoal);

// Get all goals (history)
router.get('/', getAllGoals);

// Create or update goal
router.post('/', createOrUpdateGoal);

// Update goal
router.put('/:id', updateGoal);

// Complete goal
router.patch('/:id/complete', completeGoal);

// Delete goal
router.delete('/:id', deleteGoal);

/**
 * Partial Goal routes
 */
// Get all partial goals for a goal
router.get('/:goalId/partial', getPartialGoals);

// Create partial goal
router.post('/:goalId/partial', createPartialGoal);

// Reorder partial goals
router.patch('/:goalId/partial/reorder', reorderPartialGoals);

// Update partial goal
router.put('/:goalId/partial/:id', updatePartialGoal);

// Toggle partial goal completion
router.patch('/:goalId/partial/:id/toggle', togglePartialGoalCompletion);

// Delete partial goal
router.delete('/:goalId/partial/:id', deletePartialGoal);

export default router;
