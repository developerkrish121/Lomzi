import { Router } from 'express';
import { adminCategoryController } from '@/controllers/adminCategoryController.js';
import { adminDashboardController } from '@/controllers/adminDashboardController.js';
import { adminOrderController } from '@/controllers/adminOrderController.js';
import { adminProductController } from '@/controllers/adminProductController.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { authenticate } from '@/middleware/authenticate.js';
import { requireRole } from '@/middleware/requireRole.js';
import { validate } from '@/middleware/validate.js';
import {
  adminCategoryIdSchema,
  adminCategoryListSchema,
  adminEmptySchema,
  adminOrderIdSchema,
  adminOrderListSchema,
  adminProductIdSchema,
  adminProductListSchema,
  createAdminCategorySchema,
  createAdminProductSchema,
  updateAdminCategorySchema,
  updateAdminOrderStatusSchema,
  updateAdminProductSchema,
  updateAdminStockSchema,
} from '@/validators/adminValidators.js';

export const adminRouter = Router();
adminRouter.use(asyncHandler(authenticate), requireRole('ADMIN'));

adminRouter.get(
  '/dashboard',
  validate(adminEmptySchema),
  asyncHandler(adminDashboardController.get),
);

adminRouter.get(
  '/products',
  validate(adminProductListSchema),
  asyncHandler(adminProductController.list),
);
adminRouter.post(
  '/products',
  validate(createAdminProductSchema),
  asyncHandler(adminProductController.create),
);
adminRouter.get(
  '/products/:id',
  validate(adminProductIdSchema),
  asyncHandler(adminProductController.get),
);
adminRouter.patch(
  '/products/:id',
  validate(updateAdminProductSchema),
  asyncHandler(adminProductController.update),
);
adminRouter.delete(
  '/products/:id',
  validate(adminProductIdSchema),
  asyncHandler(adminProductController.remove),
);
adminRouter.patch(
  '/products/:id/stock',
  validate(updateAdminStockSchema),
  asyncHandler(adminProductController.stock),
);
adminRouter.patch(
  '/products/:id/toggle',
  validate(adminProductIdSchema),
  asyncHandler(adminProductController.toggle),
);

adminRouter.get(
  '/categories',
  validate(adminCategoryListSchema),
  asyncHandler(adminCategoryController.list),
);
adminRouter.post(
  '/categories',
  validate(createAdminCategorySchema),
  asyncHandler(adminCategoryController.create),
);
adminRouter.get(
  '/categories/:id',
  validate(adminCategoryIdSchema),
  asyncHandler(adminCategoryController.get),
);
adminRouter.patch(
  '/categories/:id',
  validate(updateAdminCategorySchema),
  asyncHandler(adminCategoryController.update),
);
adminRouter.delete(
  '/categories/:id',
  validate(adminCategoryIdSchema),
  asyncHandler(adminCategoryController.remove),
);

adminRouter.get('/orders', validate(adminOrderListSchema), asyncHandler(adminOrderController.list));
adminRouter.get(
  '/orders/:id',
  validate(adminOrderIdSchema),
  asyncHandler(adminOrderController.get),
);
adminRouter.patch(
  '/orders/:id/status',
  validate(updateAdminOrderStatusSchema),
  asyncHandler(adminOrderController.status),
);
