import { Router } from 'express';
import { categoryController } from '@/controllers/categoryController.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';

export const categoryRouter = Router();
categoryRouter.get('/', asyncHandler(categoryController.list));
