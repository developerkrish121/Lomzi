import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./alias-loader.js', pathToFileURL('./src/'));

const { env } = await import('@/config/env.js');
const { app } = await import('@/app.js');
const { prisma } = await import('@/config/prisma.js');

const server = app.listen(env.PORT, '0.0.0.0', () =>
  console.log(`Lomzi API listening on port ${env.PORT}`),
);

let shuttingDown = false;
const shutdown = (signal) => {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down gracefully`);
  const forceExit = setTimeout(() => process.exit(1), 10_000);
  forceExit.unref();
  server.close(async (error) => {
    try {
      await prisma.$disconnect();
    } finally {
      clearTimeout(forceExit);
      process.exit(error ? 1 : 0);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
