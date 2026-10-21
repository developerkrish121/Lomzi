import assert from 'node:assert/strict';
import test from 'node:test';
import { configuredProtectedDatabaseUrls, validateTestDatabaseUrl } from './postgres/safety.js';

test('PostgreSQL runner requires an explicit TEST_DATABASE_URL', () => {
  assert.throws(() => validateTestDatabaseUrl(undefined), /TEST_DATABASE_URL is required/);
});

test('PostgreSQL runner accepts only explicitly test-named PostgreSQL databases', () => {
  assert.doesNotThrow(() =>
    validateTestDatabaseUrl('postgresql://runner:secret@localhost:5433/quickbasket_test'),
  );
  assert.throws(
    () => validateTestDatabaseUrl('postgresql://runner:secret@localhost:5433/contest'),
    /explicit test\/CI database/,
  );
  assert.throws(
    () => validateTestDatabaseUrl('mysql://runner:secret@localhost:5433/quickbasket_test'),
    /explicit test\/CI database/,
  );
  assert.throws(
    () => validateTestDatabaseUrl('postgresql:///quickbasket_test'),
    /explicit test\/CI database/,
  );
  assert.throws(
    () => validateTestDatabaseUrl('postgresql://runner:secret@localhost:5433'),
    /explicit test\/CI database/,
  );
});

test('PostgreSQL runner rejects the same database despite different credentials or query options', () => {
  assert.throws(
    () =>
      validateTestDatabaseUrl(
        'postgresql://test_user:test_password@db.example:5432/app_test?sslmode=require',
        [
          {
            name: 'DATABASE_URL',
            value:
              'postgresql://production_user:production_password@db.example:5432/app_test?pgbouncer=true',
          },
        ],
      ),
    /must differ from DATABASE_URL/,
  );
});

test('PostgreSQL runner protects every configured database URL including DIRECT_URL', () => {
  const protectedUrls = configuredProtectedDatabaseUrls({
    TEST_DATABASE_URL: 'postgresql://ignored@localhost/app_test',
    DATABASE_URL: 'postgresql://app@localhost/app',
    DIRECT_URL: 'postgresql://app@localhost/app_test',
    PRODUCTION_DATABASE_URL: 'postgresql://app@localhost/app_production',
    POSTGRES_URL: 'postgresql://app@postgres.example/app_postgres',
    NEON_URL: 'postgresql://app@neon.example/app_neon',
    PRODUCTION_DB_URL: 'postgresql://app@production.example/app_production',
    UNRELATED_URL: 'https://example.test',
  });

  assert.deepEqual(protectedUrls.map(({ name }) => name).sort(), [
    'DATABASE_URL',
    'DIRECT_URL',
    'NEON_URL',
    'POSTGRES_URL',
    'PRODUCTION_DATABASE_URL',
    'PRODUCTION_DB_URL',
  ]);
  assert.throws(
    () => validateTestDatabaseUrl('postgresql://other@localhost/app_test', protectedUrls),
    /must differ from DIRECT_URL/,
  );
});

test('PostgreSQL runner normalizes common localhost aliases before comparison', () => {
  const protectedUrls = [
    {
      name: 'PRODUCTION_DB_URL',
      value: 'postgresql://production@localhost:5432/quickbasket_test',
    },
  ];

  for (const hostname of ['127.0.0.1', '[::1]']) {
    assert.throws(
      () =>
        validateTestDatabaseUrl(
          `postgresql://test:test@${hostname}:5432/quickbasket_test`,
          protectedUrls,
        ),
      /must differ from PRODUCTION_DB_URL/,
    );
  }
});
