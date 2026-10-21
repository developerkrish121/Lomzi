const TEST_DATABASE_NAME_PATTERN = /(?:^|[_-])(test|testing|ci)(?:[_-]|$)/i;
const LOCALHOST_ALIASES = new Set(['localhost', '127.0.0.1', '::1']);

function normalizedHostname(url) {
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  return LOCALHOST_ALIASES.has(hostname) ? 'localhost' : hostname;
}

function suggestsDatabaseUrl(name) {
  return (
    name === 'DIRECT_URL' ||
    /(?:DATABASE|POSTGRES|NEON).*URL/i.test(name) ||
    /(?:^|_)DB_URL$/i.test(name)
  );
}

export function databaseIdentity(value) {
  const url = new URL(value);
  const databaseName = decodeURIComponent(url.pathname.replace(/^\/+|\/+$/g, ''));
  return `${url.protocol}//${normalizedHostname(url)}:${url.port || '5432'}/${databaseName}`;
}

export function configuredProtectedDatabaseUrls(environment) {
  return Object.entries(environment)
    .filter(([name, value]) => value && name !== 'TEST_DATABASE_URL' && suggestsDatabaseUrl(name))
    .map(([name, value]) => ({ name, value }));
}

export function validateTestDatabaseUrl(testDatabaseUrl, protectedDatabaseUrls = []) {
  if (!testDatabaseUrl) {
    throw new Error('TEST_DATABASE_URL is required; PostgreSQL integration tests were not run.');
  }

  let parsed;
  try {
    parsed = new URL(testDatabaseUrl);
  } catch {
    throw new Error('TEST_DATABASE_URL must be a valid PostgreSQL URL.');
  }

  const databaseName = decodeURIComponent(parsed.pathname.replace(/^\/+|\/+$/g, ''));
  if (
    !['postgres:', 'postgresql:'].includes(parsed.protocol) ||
    !parsed.hostname ||
    !databaseName ||
    !TEST_DATABASE_NAME_PATTERN.test(databaseName)
  ) {
    throw new Error(
      'Refusing integration tests: TEST_DATABASE_URL must name an explicit test/CI database.',
    );
  }

  const testIdentity = databaseIdentity(testDatabaseUrl);
  for (const { name, value } of protectedDatabaseUrls) {
    let protectedIdentity;
    try {
      protectedIdentity = databaseIdentity(value);
    } catch {
      throw new Error(
        `Refusing integration tests: configured ${name} is not a valid database URL.`,
      );
    }
    if (testIdentity === protectedIdentity) {
      throw new Error(`Refusing integration tests: TEST_DATABASE_URL must differ from ${name}.`);
    }
  }

  return parsed;
}
