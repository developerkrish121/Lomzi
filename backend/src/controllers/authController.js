import { env } from '@/config/env.js';
import { authService } from '@/services/authService.js';

const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
export const createBaseCookieOptions = (nodeEnvironment = env.NODE_ENV) => ({
  httpOnly: true,
  sameSite: nodeEnvironment === 'production' ? 'none' : 'lax',
  secure: nodeEnvironment === 'production',
  path: '/',
});

const baseCookieOptions = createBaseCookieOptions();

function setSessionCookie(res, token, remember) {
  res.cookie(env.AUTH_COOKIE_NAME, token, {
    ...baseCookieOptions,
    ...(remember ? { maxAge: THIRTY_DAYS } : {}),
  });
}

export const authController = {
  async register(req, res) {
    const result = await authService.register(req.validated.body);
    setSessionCookie(res, result.token, req.validated.body.remember);
    res.status(201).json({ success: true, user: result.user });
  },

  async login(req, res) {
    const result = await authService.login(req.validated.body);
    setSessionCookie(res, result.token, req.validated.body.remember);
    res.status(200).json({ success: true, user: result.user });
  },

  async adminLogin(req, res) {
    const result = await authService.adminLogin(req.validated.body);
    setSessionCookie(res, result.token, req.validated.body.remember);
    res.status(200).json({ success: true, user: result.user });
  },

  logout(_req, res) {
    res.clearCookie(env.AUTH_COOKIE_NAME, baseCookieOptions);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  },

  me(req, res) {
    res.status(200).json({ success: true, user: req.user });
  },
};
