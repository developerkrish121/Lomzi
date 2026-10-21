import assert from 'node:assert/strict';
import { test } from 'node:test';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('../src/alias-loader.js', pathToFileURL('./test/'));

const { withTransactionRetry } = await import('@/utils/transactionRetry.js');

test('retries recognized Prisma transaction conflicts up to the bounded limit', async () => {
  let attempts = 0;
  const result = await withTransactionRetry(async () => {
    attempts += 1;
    if (attempts < 3) throw Object.assign(new Error('write conflict'), { code: 'P2034' });
    return 'committed';
  });

  assert.equal(result, 'committed');
  assert.equal(attempts, 3);
});

test('does not retry arbitrary failures', async () => {
  let attempts = 0;
  const failure = new Error('validation failed');

  await assert.rejects(
    withTransactionRetry(async () => {
      attempts += 1;
      throw failure;
    }),
    (error) => error === failure,
  );
  assert.equal(attempts, 1);
});

test('returns the last conflict after the retry limit is exhausted', async () => {
  let attempts = 0;

  await assert.rejects(
    withTransactionRetry(async () => {
      attempts += 1;
      throw Object.assign(new Error(`conflict ${attempts}`), { code: 'P2034' });
    }, 2),
    /conflict 2/,
  );
  assert.equal(attempts, 2);
});
