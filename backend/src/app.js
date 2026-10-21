import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from '@/config/env.js';
import { errorHandler } from '@/middleware/errorHandler.js';
import { notFound } from '@/middleware/notFound.js';
import { createTrustedOrigin } from '@/middleware/trustedOrigin.js';
import { apiRouter } from '@/routes/index.js';

export const app = express();
app.disable('x-powered-by');
if (env.TRUST_PROXY_HOPS > 0) app.set('trust proxy', env.TRUST_PROXY_HOPS);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(
  createTrustedOrigin({
    allowedOrigin: env.CORS_ORIGIN,
    enabled: env.NODE_ENV === 'production',
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/api/v1', apiRouter);
app.use(notFound);
app.use(errorHandler);
