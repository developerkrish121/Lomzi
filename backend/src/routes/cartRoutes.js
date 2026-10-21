import { Router } from 'express';
import { cartController } from '@/controllers/cartController.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { authenticate } from '@/middleware/authenticate.js';
import { validate } from '@/middleware/validate.js';
import {
  addCartItemSchema,
  cartItemIdSchema,
  updateCartItemSchema,
} from '@/validators/cartValidators.js';

export const cartRouter = Router();

cartRouter.use(asyncHandler(authenticate));
cartRouter.get('/', asyncHandler(cartController.get));
cartRouter.post('/items', validate(addCartItemSchema), asyncHandler(cartController.addItem));
cartRouter.patch(
  '/items/:id',
  validate(updateCartItemSchema),
  asyncHandler(cartController.updateItem),
);
cartRouter.delete(
  '/items/:id',
  validate(cartItemIdSchema),
  asyncHandler(cartController.removeItem),
);
cartRouter.delete('/', asyncHandler(cartController.clear));
