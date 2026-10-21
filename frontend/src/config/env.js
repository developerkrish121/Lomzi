import { z } from 'zod';

const environmentSchema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:5000/api/v1'),
});

const result = environmentSchema.safeParse(import.meta.env);

if (!result.success) {
  throw new Error(`Invalid frontend environment: ${result.error.message}`);
}

export const env = result.data;
