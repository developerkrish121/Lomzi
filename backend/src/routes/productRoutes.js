import { Router } from 'express';
import { productController } from '@/controllers/productController.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { validate } from '@/middleware/validate.js';
import {
  categorySlugSchema,
  productIdSchema,
  productListSchema,
  searchSchema,
} from '@/validators/discoveryValidators.js';

export const productRouter = Router();
productRouter.get('/', validate(productListSchema), asyncHandler(productController.list));
productRouter.get('/search', validate(searchSchema), asyncHandler(productController.search));
productRouter.get(
  '/category/:slug',
  validate(categorySlugSchema),
  asyncHandler(productController.byCategory),
);
productRouter.get('/:id', validate(productIdSchema), asyncHandler(productController.details));
