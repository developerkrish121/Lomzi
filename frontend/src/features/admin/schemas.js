import { z } from 'zod';

const optionalNumber = z.preprocess(
  (value) => (value === '' || value === null ? null : Number(value)),
  z.number().nonnegative().nullable(),
);
export const productSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is required').max(140),
    description: z.string().trim().min(1, 'Description is required').max(3000),
    categoryId: z.string().uuid('Choose a category'),
    price: z.coerce.number().positive('Price must be greater than zero'),
    discountPrice: optionalNumber,
    stock: z.coerce.number().int().nonnegative('Stock cannot be negative'),
    unit: z.string().trim().min(1, 'Unit is required').max(40),
    image: z.string().url('Enter a valid image URL'),
    isAvailable: z.boolean(),
  })
  .refine((data) => data.discountPrice === null || data.discountPrice < data.price, {
    path: ['discountPrice'],
    message: 'Discount must be lower than price',
  });
export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  icon: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullable().optional(),
});
