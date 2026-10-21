import { Router } from 'express';
import { readiness } from '@/controllers/healthController.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { authRouter } from '@/routes/authRoutes.js';
import { categoryRouter } from '@/routes/categoryRoutes.js';
import { cartRouter } from '@/routes/cartRoutes.js';
import { productRouter } from '@/routes/productRoutes.js';
import { addressRouter } from '@/routes/addressRoutes.js';
import { orderRouter } from '@/routes/orderRoutes.js';
import { adminRouter } from '@/routes/adminRoutes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/addresses', addressRouter);
apiRouter.use('/categories', categoryRouter);
apiRouter.use('/cart', cartRouter);
apiRouter.use('/products', productRouter);
apiRouter.use('/orders', orderRouter);
apiRouter.use('/admin', adminRouter);

apiRouter.get('/', (_req, res) =>
  res.status(200).json({ success: true, message: 'Lomzi API is ready' }),
);
apiRouter.get('/health', (_req, res) =>
  res.status(200).json({ success: true, status: 'healthy', timestamp: new Date().toISOString() }),
);
apiRouter.get('/readiness', asyncHandler(readiness));
