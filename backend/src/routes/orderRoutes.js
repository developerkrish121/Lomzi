import { Router } from 'express';
import { orderController } from '@/controllers/orderController.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { authenticate } from '@/middleware/authenticate.js';
import { validate } from '@/middleware/validate.js';
import {
  createOrderSchema,
  listOrdersSchema,
  orderIdSchema,
} from '@/validators/checkoutValidators.js';

export const orderRouter = Router();
orderRouter.use(authenticate);
orderRouter.post('/', validate(createOrderSchema), asyncHandler(orderController.create));
orderRouter.get('/', validate(listOrdersSchema), asyncHandler(orderController.list));
orderRouter.get('/:id', validate(orderIdSchema), asyncHandler(orderController.get));
