import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
});

export const authRateLimiter = rateLimit({
  windowMs:        15 * 60 * 1000, // 15-minute window
  max:             10,              // 10 attempts per IP per window
  standardHeaders: true,            // sends Retry-After header so clients know when to retry
  legacyHeaders:   false,
  message: { success: false, message: 'Too many attempts. Please wait 15 minutes and try again.' },
});
