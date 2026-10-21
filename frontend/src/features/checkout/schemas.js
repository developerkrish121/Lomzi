import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the recipient name').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{7,18}$/, 'Enter a valid phone number'),
  addressLine1: z.string().trim().min(3, 'Enter a complete address').max(180),
  addressLine2: z.string().trim().max(180).optional(),
  city: z.string().trim().min(2, 'Enter a city').max(80),
  state: z.string().trim().min(2, 'Enter a state').max(80),
  postalCode: z.string().trim().min(3, 'Enter a valid postal code').max(20),
  country: z.string().trim().min(2, 'Enter a country').max(80),
  isDefault: z.boolean(),
});
