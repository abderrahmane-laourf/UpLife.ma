import express from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getNotesStats,
} from './note.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * All note routes require authentication
 */
router.use(authMiddleware);

/**
 * Notes CRUD routes
 */
// Get all notes (with optional search)
router.get('/', getAllNotes);

// Get notes statistics
router.get('/stats', getNotesStats);

// Get note by ID
router.get('/:id', getNoteById);

// Create new note
router.post('/', createNote);

// Update note
router.put('/:id', updateNote);

// Delete note
router.delete('/:id', deleteNote);

export default router;
