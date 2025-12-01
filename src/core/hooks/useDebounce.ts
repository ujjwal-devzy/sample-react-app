/**
 * useDebounce Hook
 * Debounce a value or callback
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { debounce, type DebouncedFunction } from '../utils/debounce';

// ============================================
// USE DEBOUNCED VALUE
// ============================================

/**
 * Returns a debounced version of the provided value
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// USE DEBOUNCED CALLBACK
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * Returns a debounced version of the provided callback
 */
export function useDebouncedCallback<T extends AnyFunction>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): DebouncedFunction<T> {
  const callbackRef = useRef(callback);

  // Update the callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFn = useMemo(
    () =>
      debounce(
        ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
        delay
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedFn.cancel();
    };
  }, [debouncedFn]);

  return debouncedFn;
}

// ============================================
// USE DEBOUNCED STATE
// ============================================

export interface UseDebouncedStateOptions {
  delay?: number;
  leading?: boolean;
}

/**
 * State hook that debounces updates
 */
export function useDebouncedState<T>(
  initialValue: T,
  options: UseDebouncedStateOptions = {}
): [T, T, (value: T | ((prev: T) => T)) => void] {
  const { delay = 300 } = options;

  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  const debouncedSetValue = useDebouncedCallback(
    (newValue: T) => {
      setDebouncedValue(newValue);
    },
    delay
  );

  const handleSetValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue(prev => {
        const resolved = typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(prev)
          : newValue;
        debouncedSetValue(resolved);
        return resolved;
      });
    },
    [debouncedSetValue]
  );

  return [value, debouncedValue, handleSetValue];
}

// ============================================
// USE THROTTLE
// ============================================

/**
 * Returns a throttled version of the provided value
 */
export function useThrottledValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= delay) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, delay - timeSinceLastUpdate);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return throttledValue;
}

// ============================================
// USE THROTTLED CALLBACK
// ============================================

/**
 * Returns a throttled version of the provided callback
 */
export function useThrottledCallback<T extends AnyFunction>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = useRef(callback);
  const lastCalledRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastArgsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCalledRef.current;

      if (timeSinceLastCall >= delay) {
        lastCalledRef.current = now;
        return callbackRef.current(...args);
      }

      lastArgsRef.current = args;

      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          lastCalledRef.current = Date.now();
          timeoutRef.current = null;
          if (lastArgsRef.current) {
            callbackRef.current(...lastArgsRef.current);
          }
        }, delay - timeSinceLastCall);
      }
    }) as T,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}
