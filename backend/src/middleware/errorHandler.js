import { env } from '@/config/env.js';

export function errorHandler(error, _req, res, _next) {
  const response = {
    success: false,
    error: {
      code: error.code ?? 'INTERNAL_ERROR',
      message: error.isOperational ? error.message : 'An unexpected error occurred',
    },
  };
  if (env.NODE_ENV === 'development') response.error.stack = error.stack;
  if (error.details && (error.isOperational || env.NODE_ENV === 'development')) {
    response.error.details = error.details;
  }
  res.status(error.statusCode ?? 500).json(response);
}
