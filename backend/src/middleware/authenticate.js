import jwt from 'jsonwebtoken';
import { env } from '@/config/env.js';
import { userRepository } from '@/repositories/userRepository.js';
import { AppError } from '@/utils/AppError.js';
import { toPublicUser } from '@/utils/publicUser.js';
import { verifyAuthToken } from '@/utils/token.js';

function getToken(req) {
  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return req.cookies?.[env.AUTH_COOKIE_NAME];
}

export async function authenticate(req, _res, next) {
  const token = getToken(req);
  if (!token) return next(new AppError('Authentication is required', 401, 'TOKEN_MISSING'));

  try {
    const payload = verifyAuthToken(token);
    const user = await userRepository.findById(payload.sub);
    if (!user) return next(new AppError('This session is no longer valid', 401, 'USER_NOT_FOUND'));
    if (!user.isActive)
      return next(new AppError('This account has been disabled', 403, 'ACCOUNT_INACTIVE'));
    req.user = toPublicUser(user);
    return next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if (error instanceof jwt.TokenExpiredError)
      return next(new AppError('Your session has expired', 401, 'TOKEN_EXPIRED'));
    return next(new AppError('Your session is invalid', 401, 'TOKEN_INVALID'));
  }
}
