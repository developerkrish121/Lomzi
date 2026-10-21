import { z } from 'zod';

const optionalMoney = z.preprocess(
  (value) => (value === '' || value === undefined ? undefined : value),
  z.coerce.number().nonnegative().optional(),
);

export const productListSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().positive().default(1),
      limit: z.coerce.number().int().min(1).max(48).default(12),
      q: z.string().trim().max(100).optional().default(''),
      category: z.string().trim().max(80).optional().default(''),
      sort: z.enum(['featured', 'price-asc', 'price-desc', 'name', 'newest']).default('featured'),
      available: z.enum(['true', 'false']).optional(),
      minPrice: optionalMoney,
      maxPrice: optionalMoney,
    })
    .refine(
      (value) =>
        value.minPrice === undefined ||
        value.maxPrice === undefined ||
        value.minPrice <= value.maxPrice,
      { message: 'Minimum price cannot exceed maximum price', path: ['minPrice'] },
    ),
});

export const searchSchema = z.object({
  query: productListSchema.shape.query.refine((value) => value.q.length >= 2, {
    message: 'Search query must be at least 2 characters',
    path: ['q'],
  }),
});

export const productIdSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid product id') }),
});
export const categorySlugSchema = z.object({
  params: z.object({
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid category slug'),
  }),
  query: productListSchema.shape.query,
});
