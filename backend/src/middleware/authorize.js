import { AppError } from '@/utils/AppError.js';

export const authorize = (permission) => (req, _res, next) => {
  if (!req.user || !permission(req.user, req)) {
    return next(
      new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN'),
    );
  }
  return next();
};
