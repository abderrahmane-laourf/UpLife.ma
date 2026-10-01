import { Router } from 'express';
import * as noFapController from './nofap.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = Router();

/**
 * NoFap Counter Routes
 * All routes require authentication
 */

// Get counter
router.get('/', authMiddleware, noFapController.getCounter);

// Start/Reset counter
router.post('/start', authMiddleware, noFapController.startCounter);

// Report relapse
router.post('/relapse', authMiddleware, noFapController.reportRelapse);

// Pause counter
router.patch('/pause', authMiddleware, noFapController.pauseCounter);

// Resume counter
router.patch('/resume', authMiddleware, noFapController.resumeCounter);

// Delete counter
router.delete('/', authMiddleware, noFapController.deleteCounter);

// Get stats
router.get('/stats', authMiddleware, noFapController.getStats);

export default router;
