import express from 'express';
import {
  requestRegistrationOtp,
  verifyRegistrationOtp,
  completeRegistration,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
} from './auth.controller.js';
import { authMiddleware } from './auth.middleware.js';
import { rateLimitMiddleware } from '../../lib/rateLimiter.js';

const router = express.Router();

// Helper function bach njib phone mn request
const getPhoneFromBody = (req) => req.body.phone;

// Login - 5 attempts f 15 d9ay9
router.post(
  '/login',
  rateLimitMiddleware('LOGIN', getPhoneFromBody),
  login
);

// Register OTP Request - 3 attempts f 10 d9ay9
router.post(
  '/register/request-otp',
  rateLimitMiddleware('REGISTER_OTP', getPhoneFromBody),
  requestRegistrationOtp
);

// Register OTP Verification - 5 attempts f 10 d9ay9
router.post(
  '/register/verify-otp',
  rateLimitMiddleware('OTP_VERIFY', getPhoneFromBody),
  verifyRegistrationOtp
);

// Complete Registration - No rate limit (already verified OTP)
router.post('/register/complete', completeRegistration);

// Refresh Token - No rate limit (uses secure cookie)
router.post('/refresh', refreshToken);

// Logout - Requires auth, no rate limit needed
router.post('/logout', authMiddleware, logout);

// Password Reset OTP Request - 3 attempts f 10 d9ay9
router.post(
  '/forgot-password',
  rateLimitMiddleware('PASSWORD_RESET_OTP', getPhoneFromBody),
  requestPasswordReset
);

// Password Reset OTP Verification - 5 attempts f 10 d9ay9
router.post(
  '/verify-password-otp',
  rateLimitMiddleware('OTP_VERIFY', getPhoneFromBody),
  verifyPasswordResetOtp
);

// Reset Password - No rate limit (already verified OTP)
router.post('/reset-password', resetPassword);

export default router;
