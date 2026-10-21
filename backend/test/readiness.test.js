import assert from 'node:assert/strict';
import { test } from 'node:test';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/quickbasket_test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
register('../src/alias-loader.js', pathToFileURL('./test/'));

const { createReadinessHandler } = await import('@/controllers/healthController.js');

function responseRecorder() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('readiness succeeds only after the database responds', async () => {
  let queries = 0;
  const handler = createReadinessHandler({
    $queryRaw: async () => {
      queries += 1;
      return [{ '?column?': 1 }];
    },
  });
  const response = responseRecorder();

  await handler({}, response);

  assert.equal(queries, 1);
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { success: true, status: 'ready' });
});

test('readiness converts database failures to the standard operational error', async () => {
  const handler = createReadinessHandler({
    $queryRaw: async () => {
      throw new Error('connection details must not escape');
    },
  });

  await assert.rejects(handler({}, responseRecorder()), (error) => {
    assert.equal(error.statusCode, 503);
    assert.equal(error.code, 'DATABASE_UNAVAILABLE');
    assert.equal(error.message, 'Database is unavailable');
    assert.equal(error.isOperational, true);
    return true;
  });
});
