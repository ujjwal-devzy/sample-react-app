/**
 * usePrevious Hook
 * Track previous value of a variable
 */

import { useRef, useEffect } from 'react';

/**
 * Returns the previous value of the provided value
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Returns the previous value only when the value has changed
 */
export function usePreviousDistinct<T>(value: T, compareFn?: (prev: T, next: T) => boolean): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  const compare = compareFn || Object.is;

  useEffect(() => {
    if (ref.current === undefined || !compare(ref.current, value)) {
      ref.current = value;
    }
  }, [value, compare]);

  return ref.current;
}

/**
 * Track if value has changed from previous render
 */
export function useHasChanged<T>(value: T): boolean {
  const previous = usePrevious(value);
  return previous !== value;
}

/**
 * Get the change between previous and current value
 */
export function useValueChange<T>(
  value: T,
  onChange?: (current: T, previous: T | undefined) => void
): { current: T; previous: T | undefined; hasChanged: boolean } {
  const previous = usePrevious(value);
  const hasChanged = previous !== value;

  useEffect(() => {
    if (hasChanged && onChange) {
      onChange(value, previous);
    }
  }, [value, previous, hasChanged, onChange]);

  return { current: value, previous, hasChanged };
}

