import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const environmentFile = fileURLToPath(new URL('../../.env', import.meta.url));
dotenv.config({ path: environmentFile, quiet: true });

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REMEMBER_EXPIRES_IN: z.string().default('30d'),
  AUTH_COOKIE_NAME: z.string().default('quickbasket_session'),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(10).default(0),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  ADMIN_LOGIN_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
});

const result = environmentSchema.safeParse(process.env);
if (!result.success) {
  console.error('Invalid server environment configuration', result.error.flatten().fieldErrors);
  process.exit(1);
}
export const env = result.data;
