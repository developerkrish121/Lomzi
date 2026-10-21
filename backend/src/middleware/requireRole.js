import { authorize } from '@/middleware/authorize.js';

export const requireRole = (...roles) => authorize((user) => roles.includes(user.role));
