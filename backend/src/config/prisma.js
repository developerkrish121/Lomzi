import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env.js';

const createPrismaClient = () =>
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

export const prisma = globalThis.__quickBasketPrisma ?? createPrismaClient();
if (env.NODE_ENV !== 'production') globalThis.__quickBasketPrisma = prisma;
