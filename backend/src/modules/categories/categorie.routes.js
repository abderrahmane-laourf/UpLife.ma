import express from 'express';
import { 
  createCategory, 
  getAllCategories, 
  getCategoryById, 
  updateCategory, 
  deleteCategory 
} from './categorie.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

const router = express.Router();

/**
 * Public routes - anyone can view categories
 */
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

/**
 * Protected routes - require authentication
 * You can add admin check middleware here if needed
 */
router.post('/', authMiddleware, createCategory);
router.put('/:id', authMiddleware, updateCategory);
router.delete('/:id', authMiddleware, deleteCategory);

export default router;
