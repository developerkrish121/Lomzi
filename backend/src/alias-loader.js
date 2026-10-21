import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const sourceDirectory = path.dirname(fileURLToPath(import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    return nextResolve(pathToFileURL(path.join(sourceDirectory, specifier.slice(2))).href, context);
  }
  return nextResolve(specifier, context);
}
