import { Router } from 'express';
import { authController } from './auth.controller';
import { validate } from '../../shared/middleware/validate.middleware';
import { authRateLimiter } from '../../shared/middleware/rateLimiter.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
} from './auth.validation';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);

// POST /api/v1/auth/login
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);

// POST /api/v1/auth/logout
router.post('/logout', validate(refreshTokenSchema), authController.logout);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), authController.resetPassword);

// POST /api/v1/auth/verify-email
router.post('/verify-email', authRateLimiter, validate(verifyEmailSchema), authController.verifyEmail);

// POST /api/v1/auth/resend-verification
router.post('/resend-verification', authRateLimiter, validate(resendVerificationSchema), authController.resendVerification);

export default router;
