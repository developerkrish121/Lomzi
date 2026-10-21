import { AppError } from '@/utils/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function createTrustedOrigin({ allowedOrigin, enabled = true }) {
  return (req, _res, next) => {
    const origin = req.get('origin');
    if (!enabled || SAFE_METHODS.has(req.method) || !origin || origin === allowedOrigin) {
      return next();
    }

    return next(new AppError('Request origin is not allowed', 403, 'UNTRUSTED_ORIGIN'));
  };
}
