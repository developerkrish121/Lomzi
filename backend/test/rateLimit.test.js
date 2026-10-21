import assert from 'node:assert/strict';
import { test } from 'node:test';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/quickbasket_test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
register('../src/alias-loader.js', pathToFileURL('./test/'));

const { createIpRateLimiter } = await import('@/middleware/rateLimit.js');

function invoke(limiter, ip = '127.0.0.1') {
  const headers = new Map();
  let nextValue;
  limiter({ ip }, { set: (name, value) => headers.set(name, value) }, (value) => {
    nextValue = value;
  });
  return { error: nextValue, headers };
}

test('allows requests through the configured per-IP limit and resets after the window', () => {
  let currentTime = 1_000;
  const limiter = createIpRateLimiter({ windowMs: 1_000, max: 2, now: () => currentTime });

  assert.equal(invoke(limiter).error, undefined);
  const second = invoke(limiter);
  assert.equal(second.error, undefined);
  assert.equal(second.headers.get('RateLimit-Remaining'), '0');

  currentTime = 2_000;
  assert.equal(invoke(limiter).error, undefined);
});

test('returns the standard operational error and retry metadata after the limit', () => {
  const limiter = createIpRateLimiter({ windowMs: 60_000, max: 1, now: () => 1_000 });
  invoke(limiter);
  const blocked = invoke(limiter);

  assert.equal(blocked.error.statusCode, 429);
  assert.equal(blocked.error.code, 'AUTH_RATE_LIMITED');
  assert.equal(blocked.error.message, 'Too many authentication attempts. Please try again later.');
  assert.equal(blocked.headers.get('Retry-After'), '60');
});

test('keeps registration, customer login, and stricter admin login policies independent', () => {
  const options = { windowMs: 60_000, now: () => 1_000 };
  const registration = createIpRateLimiter({ ...options, max: 2 });
  const customerLogin = createIpRateLimiter({ ...options, max: 2 });
  const adminLogin = createIpRateLimiter({ ...options, max: 1 });

  assert.equal(invoke(adminLogin).error, undefined);
  assert.equal(invoke(adminLogin).error.code, 'AUTH_RATE_LIMITED');
  assert.equal(invoke(registration).error, undefined);
  assert.equal(invoke(customerLogin).error, undefined);
  assert.equal(invoke(registration, '192.0.2.10').error, undefined);
  assert.equal(invoke(adminLogin, '192.0.2.10').error, undefined);
});
