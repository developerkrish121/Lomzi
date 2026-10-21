import jwt from 'jsonwebtoken';
import { env } from '@/config/env.js';

export function signAuthToken(user, remember = false) {
  return jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: remember ? env.JWT_REMEMBER_EXPIRES_IN : env.JWT_EXPIRES_IN,
  });
}

export function verifyAuthToken(token) {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
}
