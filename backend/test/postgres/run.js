import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { configuredProtectedDatabaseUrls, validateTestDatabaseUrl } from './safety.js';

const backendDirectory = fileURLToPath(new URL('../../', import.meta.url));
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
try {
  validateTestDatabaseUrl(testDatabaseUrl, configuredProtectedDatabaseUrls(process.env));
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const prismaCli = fileURLToPath(
  new URL('../../../node_modules/prisma/build/index.js', import.meta.url),
);
const environment = {
  ...process.env,
  DATABASE_URL: testDatabaseUrl,
  NODE_ENV: 'test',
  POSTGRES_INTEGRATION_TESTS: '1',
  JWT_SECRET: 'postgres-integration-test-secret-at-least-32-characters',
};
const migrate = spawnSync(
  process.execPath,
  [prismaCli, 'migrate', 'deploy', '--schema', 'prisma/schema.prisma'],
  { cwd: backendDirectory, env: environment, stdio: 'inherit' },
);
if (migrate.status !== 0) process.exit(migrate.status ?? 1);

const tests = spawnSync(
  process.execPath,
  ['--test', '--test-concurrency=1', 'test/postgres/critical.integration.test.js'],
  { cwd: backendDirectory, env: environment, stdio: 'inherit' },
);
process.exit(tests.status ?? 1);
