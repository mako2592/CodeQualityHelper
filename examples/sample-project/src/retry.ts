// Pętla z licznikiem: mutacje warunku lub inkrementacji zapętlają kod,
// co w raporcie daje status Timeout.
export function retry<T>(fn: () => T, maxAttempts: number): T {
  let attempt = 0;
  let lastError: unknown = new Error('No attempts made');
  while (attempt < maxAttempts) {
    try {
      return fn();
    } catch (error) {
      lastError = error;
    }
    attempt++;
  }
  throw lastError;
}
