import { AppError } from '@/utils/AppError.js';

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!result.success) {
      const error = new AppError('Request validation failed', 422, 'VALIDATION_ERROR');
      error.details = result.error.flatten().fieldErrors;
      return next(error);
    }
    req.validated = result.data;
    return next();
  };
}
