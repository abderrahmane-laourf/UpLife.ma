import express from 'express';
import {
  requestRegistrationOtp,
  verifyRegistrationOtp,
  completeRegistration,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
} from './auth.controller.js';
import { authMiddleware } from './auth.middleware.js';

const router = express.Router();

router.post('/register/request-otp', requestRegistrationOtp);
router.post('/register/verify-otp', verifyRegistrationOtp);
router.post('/register/complete', completeRegistration);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', authMiddleware, logout);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
