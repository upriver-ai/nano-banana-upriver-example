/**
 * Retry utility for handling API rate limits and transient errors
 *
 * Implements exponential backoff with jitter for 429 (rate limit) and 503 (service unavailable) errors
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep for specified milliseconds with optional jitter
 */
function sleep(ms: number, jitter = true): Promise<void> {
  const delay = jitter ? ms * (0.5 + Math.random() * 0.5) : ms;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws Error if all retries exhausted or non-retryable error
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if error is retryable
      const isRateLimitError =
        lastError.message.includes('429') ||
        lastError.message.includes('rate limit') ||
        lastError.message.includes('too many requests');

      const isServiceUnavailable =
        lastError.message.includes('503') ||
        lastError.message.includes('service unavailable');

      const shouldRetry = isRateLimitError || isServiceUnavailable;

      // If not retryable or last attempt, throw immediately
      if (!shouldRetry || attempt === opts.maxRetries) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const baseDelay = opts.initialDelayMs * Math.pow(opts.backoffMultiplier, attempt);
      const delayMs = Math.min(baseDelay, opts.maxDelayMs);

      console.warn(
        `API call failed (attempt ${attempt + 1}/${opts.maxRetries + 1}): ${lastError.message}. ` +
        `Retrying in ${Math.round(delayMs)}ms...`
      );

      await sleep(delayMs);
    }
  }

  throw lastError!;
}

/**
 * Check if an HTTP response is a rate limit error
 */
export function isRateLimitResponse(response: Response): boolean {
  return response.status === 429;
}

/**
 * Check if an HTTP response is a service unavailable error
 */
export function isServiceUnavailableResponse(response: Response): boolean {
  return response.status === 503;
}

/**
 * Get retry-after header value in milliseconds
 */
export function getRetryAfterMs(response: Response): number | null {
  const retryAfter = response.headers.get('retry-after');
  if (!retryAfter) return null;

  // If it's a number, it's seconds
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000;
  }

  // If it's a date, calculate difference
  const retryDate = new Date(retryAfter);
  if (!isNaN(retryDate.getTime())) {
    return Math.max(0, retryDate.getTime() - Date.now());
  }

  return null;
}
