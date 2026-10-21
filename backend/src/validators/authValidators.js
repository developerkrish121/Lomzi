import { z } from 'zod';

const email = z
  .string()
  .trim()
  .email('Enter a valid email address')
  .max(254)
  .transform((value) => value.toLowerCase());
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password cannot exceed 72 characters');

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
      email,
      password,
      phone: z
        .string()
        .trim()
        .regex(/^\+?[1-9]\d{7,14}$/, 'Enter a valid phone number')
        .optional()
        .or(z.literal('')),
      remember: z.boolean().optional().default(false),
    })
    .strict(),
});

export const loginSchema = z.object({
  body: z
    .object({
      email,
      password: z.string().min(1, 'Password is required').max(72),
      remember: z.boolean().optional().default(false),
    })
    .strict(),
});
