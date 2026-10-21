import assert from 'node:assert/strict';
import { test } from 'node:test';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/quickbasket_test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
register('../src/alias-loader.js', pathToFileURL('./test/'));

const { createBaseCookieOptions } = await import('@/controllers/authController.js');
const { createTrustedOrigin } = await import('@/middleware/trustedOrigin.js');

test('production cookies support credentialed cross-site requests securely', () => {
  assert.deepEqual(createBaseCookieOptions('production'), {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    path: '/',
  });
});

test('trusted-origin protection rejects unsafe requests from another origin', () => {
  const middleware = createTrustedOrigin({
    allowedOrigin: 'https://lomzi.example',
  });
  let result;
  middleware({ method: 'POST', get: () => 'https://attacker.example' }, {}, (value) => {
    result = value;
  });

  assert.equal(result.statusCode, 403);
  assert.equal(result.code, 'UNTRUSTED_ORIGIN');
});

test('trusted-origin protection allows the configured origin and safe methods', () => {
  const middleware = createTrustedOrigin({
    allowedOrigin: 'https://lomzi.example',
  });
  let result = 'not-called';
  const next = (value) => {
    result = value;
  };

  middleware({ method: 'POST', get: () => 'https://lomzi.example' }, {}, next);
  assert.equal(result, undefined);

  result = 'not-called';
  middleware({ method: 'GET', get: () => 'https://attacker.example' }, {}, next);
  assert.equal(result, undefined);
});
