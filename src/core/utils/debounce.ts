/**
 * Debounce and Throttle Utilities
 * Functions for rate-limiting function calls
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
}

export interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

// ============================================
// DEBOUNCE
// ============================================

/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait milliseconds have elapsed since the last
 * time the debounced function was invoked.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const { leading = false, trailing = true, maxWait } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let maxTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let result: ReturnType<T> | undefined;

  const invokeFunc = (time: number) => {
    const args = lastArgs!;
    lastArgs = null;
    lastInvokeTime = time;
    result = func(...args) as ReturnType<T>;
    return result;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = lastCallTime !== null ? time - lastCallTime : 0;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === null ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const trailingEdge = (time: number) => {
    timeoutId = null;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    return result;
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    const timeSinceLastCall = time - (lastCallTime || 0);
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;
    const remainingWait =
      maxWait !== undefined
        ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;

    timeoutId = setTimeout(timerExpired, remainingWait);
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;
    timeoutId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  };

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
    }
    lastCallTime = null;
    lastArgs = null;
    timeoutId = null;
    maxTimeoutId = null;
  };

  const flush = () => {
    if (timeoutId === null) return result;
    return trailingEdge(Date.now());
  };

  const pending = () => timeoutId !== null;

  const debounced = ((...args: Parameters<T>) => {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(time);
      }
      if (maxWait !== undefined) {
        timeoutId = setTimeout(timerExpired, wait);
        return invokeFunc(time);
      }
    }
    if (timeoutId === null) {
      timeoutId = setTimeout(timerExpired, wait);
    }
    return result;
  }) as DebouncedFunction<T>;

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced;
}

/**
 * Creates a debounced function with leading edge invocation
 */
export function debounceLeading<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  return debounce(func, wait, { leading: true, trailing: false });
}

/**
 * Creates a debounced function with both leading and trailing invocation
 */
export function debounceBoth<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  return debounce(func, wait, { leading: true, trailing: true });
}

// ============================================
// THROTTLE
// ============================================

/**
 * Creates a throttled function that only invokes the provided function
 * at most once per every wait milliseconds.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: ThrottleOptions = {}
): ThrottledFunction<T> {
  const { leading = true, trailing = true } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;
  let result: ReturnType<T> | undefined;

  const invokeFunc = () => {
    const args = lastArgs!;
    lastArgs = null;
    lastCallTime = Date.now();
    result = func(...args) as ReturnType<T>;
    return result;
  };

  const remainingWait = () => {
    const timeSinceLastCall = lastCallTime ? Date.now() - lastCallTime : 0;
    return Math.max(0, wait - timeSinceLastCall);
  };

  const trailingEdge = () => {
    timeoutId = null;
    if (trailing && lastArgs) {
      invokeFunc();
      if (!timeoutId) {
        timeoutId = setTimeout(trailingEdge, wait);
      }
    }
  };

  const cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
    lastCallTime = null;
  };

  const throttled = ((...args: Parameters<T>) => {
    const remaining = remainingWait();
    lastArgs = args;

    if (remaining === 0 || remaining === wait) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (leading) {
        invokeFunc();
      }
      if (trailing) {
        timeoutId = setTimeout(trailingEdge, wait);
      }
    } else if (timeoutId === null && trailing) {
      timeoutId = setTimeout(trailingEdge, remaining);
    }

    return result;
  }) as ThrottledFunction<T>;

  throttled.cancel = cancel;

  return throttled;
}

// ============================================
// RAF-BASED UTILITIES
// ============================================

/**
 * Creates a function that uses requestAnimationFrame for timing
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
  func: T
): ThrottledFunction<T> {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    lastArgs = args;
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        func(...lastArgs!);
      });
    }
  }) as ThrottledFunction<T>;

  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return throttled;
}

// ============================================
// ASYNC UTILITIES
// ============================================

/**
 * Creates a debounced async function
 */
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;
  let resolveList: Array<(value: ReturnType<T>) => void> = [];
  let rejectList: Array<(reason: unknown) => void> = [];

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      resolveList.push(resolve);
      rejectList.push(reject);

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        timeoutId = null;
        const currentResolveList = resolveList;
        const currentRejectList = rejectList;
        resolveList = [];
        rejectList = [];

        try {
          pendingPromise = func(...args) as Promise<ReturnType<T>>;
          const result = await pendingPromise;
          currentResolveList.forEach(r => r(result));
        } catch (error) {
          currentRejectList.forEach(r => r(error));
        } finally {
          pendingPromise = null;
        }
      }, wait);
    });
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Delay execution for specified milliseconds
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute function after delay
 */
export async function delayedCall<T>(
  func: () => T | Promise<T>,
  ms: number
): Promise<T> {
  await delay(ms);
  return func();
}

/**
 * Execute function with timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  timeoutError = new Error('Operation timed out')
): Promise<T> {
  return Promise.race([
    promise,
    delay(ms).then(() => Promise.reject(timeoutError)),
  ]);
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  func: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
  } = options;

  let attempt = 0;
  let currentDelay = initialDelay;

  while (attempt < maxAttempts) {
    try {
      return await func();
    } catch (error) {
      attempt++;
      if (attempt >= maxAttempts) {
        throw error;
      }
      await delay(currentDelay);
      currentDelay = Math.min(currentDelay * factor, maxDelay);
    }
  }

  throw new Error('Max attempts reached');
}

/**
 * Create an async queue that processes items sequentially
 */
export function createAsyncQueue<T, R>(
  processor: (item: T) => Promise<R>,
  concurrency = 1
): {
  add: (item: T) => Promise<R>;
  clear: () => void;
  size: () => number;
} {
  const queue: Array<{
    item: T;
    resolve: (value: R) => void;
    reject: (reason: unknown) => void;
  }> = [];
  let running = 0;

  const process = async () => {
    if (running >= concurrency || queue.length === 0) return;

    running++;
    const { item, resolve, reject } = queue.shift()!;

    try {
      const result = await processor(item);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      running--;
      process();
    }
  };

  return {
    add: (item: T): Promise<R> => {
      return new Promise((resolve, reject) => {
        queue.push({ item, resolve, reject });
        process();
      });
    },
    clear: () => {
      queue.length = 0;
    },
    size: () => queue.length,
  };
}

