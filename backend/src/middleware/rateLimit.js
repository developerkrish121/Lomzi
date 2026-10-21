import { AppError } from '@/utils/AppError.js';

export function createIpRateLimiter({ windowMs, max, now = Date.now }) {
  const clients = new Map();
  let nextSweep = now() + windowMs;

  return (req, res, next) => {
    const currentTime = now();
    if (currentTime >= nextSweep) {
      for (const [ip, entry] of clients) {
        if (entry.resetAt <= currentTime) clients.delete(ip);
      }
      nextSweep = currentTime + windowMs;
    }

    const ip = req.ip;
    const previous = clients.get(ip);
    const entry =
      !previous || previous.resetAt <= currentTime
        ? { count: 1, resetAt: currentTime + windowMs }
        : { count: previous.count + 1, resetAt: previous.resetAt };
    clients.set(ip, entry);

    res.set('RateLimit-Limit', String(max));
    res.set('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    res.set('RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.set('Retry-After', String(Math.max(1, Math.ceil((entry.resetAt - currentTime) / 1000))));
      return next(
        new AppError(
          'Too many authentication attempts. Please try again later.',
          429,
          'AUTH_RATE_LIMITED',
        ),
      );
    }
    return next();
  };
}
