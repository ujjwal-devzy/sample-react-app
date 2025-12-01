/**
 * useAsync Hook
 * Generic hook for managing async operations with loading, error, and data states
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AsyncStatus, ApiError } from '../types';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: ApiError | null;
}

export interface UseAsyncOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  initialData?: T | null;
}

export interface UseAsyncReturn<T, Args extends unknown[]> {
  execute: (...args: Args) => Promise<T | null>;
  status: AsyncStatus;
  data: T | null;
  error: ApiError | null;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
  setData: (data: T | null) => void;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useAsync<T, Args extends unknown[] = []>(
  asyncFn: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  const {
    immediate = false,
    onSuccess,
    onError,
    initialData = null,
  } = options;

  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: initialData,
    error: null,
  });

  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      // Cancel any pending request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        status: 'loading',
        error: null,
      }));

      try {
        const result = await asyncFn(...args);

        if (mountedRef.current) {
          setState({
            status: 'success',
            data: result,
            error: null,
          });
          onSuccess?.(result);
        }

        return result;
      } catch (err) {
        const error: ApiError = {
          code: (err as ApiError)?.code || 'UNKNOWN_ERROR',
          message: (err as Error)?.message || 'An unexpected error occurred',
          details: (err as ApiError)?.details,
        };

        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            status: 'error',
            error,
          }));
          onError?.(error);
        }

        return null;
      }
    },
    [asyncFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState({
      status: 'idle',
      data: initialData,
      error: null,
    });
  }, [initialData]);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
    }));
  }, []);

  // Execute immediately if option is set
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as Args));
    }
  }, [immediate, execute]);

  return {
    execute,
    status: state.status,
    data: state.data,
    error: state.error,
    isIdle: state.status === 'idle',
    isLoading: state.status === 'loading',
    isSuccess: state.status === 'success',
    isError: state.status === 'error',
    reset,
    setData,
  };
}

// ============================================
// SPECIALIZED VARIANTS
// ============================================

/**
 * useAsync with automatic execution on mount
 */
export function useAsyncImmediate<T>(
  asyncFn: () => Promise<T>,
  deps: React.DependencyList = []
): UseAsyncReturn<T, []> {
  const memoizedFn = useCallback(asyncFn, deps);
  return useAsync(memoizedFn, { immediate: true });
}

/**
 * useAsync for mutation operations (POST, PUT, DELETE)
 */
export function useMutation<T, Args extends unknown[]>(
  mutationFn: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  return useAsync(mutationFn, { ...options, immediate: false });
}

// ============================================
// FETCH HOOK
// ============================================

export interface UseFetchOptions<T> extends UseAsyncOptions<T> {
  skip?: boolean;
  refetchInterval?: number;
}

export function useFetch<T>(
  url: string | null,
  options: UseFetchOptions<T> = {}
): UseAsyncReturn<T, []> & { refetch: () => Promise<T | null> } {
  const { skip = false, refetchInterval, ...asyncOptions } = options;

  const fetchData = useCallback(async (): Promise<T> => {
    if (!url) {
      throw new Error('No URL provided');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }, [url]);

  const asyncResult = useAsync(fetchData, {
    ...asyncOptions,
    immediate: !skip && !!url,
  });

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval && !skip && url) {
      const intervalId = setInterval(() => {
        asyncResult.execute();
      }, refetchInterval);

      return () => clearInterval(intervalId);
    }
  }, [refetchInterval, skip, url, asyncResult.execute]);

  return {
    ...asyncResult,
    refetch: asyncResult.execute,
  };
}

