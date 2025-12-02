import { useState, useEffect } from 'react';

export function useDelayedValue<T>(value: T, delay: number): T {
  const [delayedValue, setDelayedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDelayedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return delayedValue;
}

export function useDelayedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const [pending, setPending] = useState(false);
  const timeoutRef = { current: null as ReturnType<typeof setTimeout> | null };

  const delayedFn = ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setPending(true);
    timeoutRef.current = setTimeout(() => {
      callback(...args);
      setPending(false);
    }, delay);
  }) as T;

  return delayedFn;
}

