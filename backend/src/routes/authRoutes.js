import { Router } from 'express';
import { authController } from '@/controllers/authController.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { authenticate } from '@/middleware/authenticate.js';
import { createIpRateLimiter } from '@/middleware/rateLimit.js';
import { validate } from '@/middleware/validate.js';
import { env } from '@/config/env.js';
import { loginSchema, registerSchema } from '@/validators/authValidators.js';

export const authRouter = Router();
const customerLimit = {
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
};
const registrationLimiter = createIpRateLimiter(customerLimit);
const customerLoginLimiter = createIpRateLimiter(customerLimit);
const adminLoginLimiter = createIpRateLimiter({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.ADMIN_LOGIN_RATE_LIMIT_MAX,
});

authRouter.post(
  '/register',
  registrationLimiter,
  validate(registerSchema),
  asyncHandler(authController.register),
);
authRouter.post(
  '/login',
  customerLoginLimiter,
  validate(loginSchema),
  asyncHandler(authController.login),
);
authRouter.post(
  '/admin/login',
  adminLoginLimiter,
  validate(loginSchema),
  asyncHandler(authController.adminLogin),
);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', asyncHandler(authenticate), authController.me);
