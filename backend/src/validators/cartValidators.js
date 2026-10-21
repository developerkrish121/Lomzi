import { z } from 'zod';

export const addCartItemSchema = z.object({
  body: z
    .object({
      productId: z.string().uuid('Invalid product id'),
      quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    })
    .strict(),
});

export const updateCartItemSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid cart item id') }),
  body: z
    .object({ quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative') })
    .strict(),
});

export const cartItemIdSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid cart item id') }),
});
