import assert from 'node:assert/strict';
import { test } from 'node:test';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import bcrypt from 'bcrypt';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/quickbasket_test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
register('../src/alias-loader.js', pathToFileURL('./test/'));

const { seedDefaultAdmin } = await import('../prisma/seed.js');
const strongCredentials = {
  NODE_ENV: 'production',
  SEED_ADMIN_EMAIL: 'portfolio-admin@example.com',
  SEED_ADMIN_PASSWORD: 'Strong-seed-passphrase-42!',
};

test('creates an administrator from seed-only credentials and hashes its password', async () => {
  let created;
  const database = {
    user: {
      findUnique: async () => null,
      create: async (input) => {
        created = input.data;
        return { id: 'admin-id', ...input.data };
      },
    },
  };

  await seedDefaultAdmin(database, strongCredentials);

  assert.equal(created.email, strongCredentials.SEED_ADMIN_EMAIL);
  assert.equal(created.role, 'ADMIN');
  assert.notEqual(created.password, strongCredentials.SEED_ADMIN_PASSWORD);
  assert.equal(await bcrypt.compare(strongCredentials.SEED_ADMIN_PASSWORD, created.password), true);
});

test('refuses missing or weak administrator credentials in production', async () => {
  const database = { user: { findUnique: () => assert.fail('database should not be queried') } };

  await assert.rejects(
    seedDefaultAdmin(database, { NODE_ENV: 'production' }),
    /requires a valid SEED_ADMIN_EMAIL and a strong SEED_ADMIN_PASSWORD/,
  );
  await assert.rejects(
    seedDefaultAdmin(database, {
      NODE_ENV: 'production',
      SEED_ADMIN_EMAIL: 'portfolio-admin@example.com',
      SEED_ADMIN_PASSWORD: 'weak-password',
    }),
    /requires a valid SEED_ADMIN_EMAIL and a strong SEED_ADMIN_PASSWORD/,
  );
});

test('repeated seed runs never reset or reactivate an existing administrator', async () => {
  const existing = {
    id: 'admin-id',
    email: strongCredentials.SEED_ADMIN_EMAIL,
    password: 'existing-password-hash',
    role: 'ADMIN',
    isActive: false,
  };
  let createCalls = 0;
  const database = {
    user: {
      findUnique: async () => existing,
      create: async () => {
        createCalls += 1;
      },
    },
  };

  assert.equal(await seedDefaultAdmin(database, strongCredentials), existing);
  assert.equal(await seedDefaultAdmin(database, strongCredentials), existing);
  assert.equal(createCalls, 0);
  assert.equal(existing.password, 'existing-password-hash');
  assert.equal(existing.isActive, false);
});
