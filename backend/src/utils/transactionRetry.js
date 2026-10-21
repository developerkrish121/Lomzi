const DEFAULT_MAX_ATTEMPTS = 3;

export function isTransientTransactionConflict(error) {
  return error?.code === 'P2034';
}

export async function withTransactionRetry(operation, maxAttempts = DEFAULT_MAX_ATTEMPTS) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await operation();
    } catch (error) {
      if (!isTransientTransactionConflict(error) || attempt >= maxAttempts) throw error;
    }
  }
}
