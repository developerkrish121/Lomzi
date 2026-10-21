import { prisma } from '@/config/prisma.js';
import { AppError } from '@/utils/AppError.js';

export function createReadinessHandler(database = prisma) {
  return async (_req, res) => {
    try {
      await database.$queryRaw`SELECT 1`;
    } catch {
      throw new AppError('Database is unavailable', 503, 'DATABASE_UNAVAILABLE');
    }
    return res.status(200).json({ success: true, status: 'ready' });
  };
}

export const readiness = createReadinessHandler();
