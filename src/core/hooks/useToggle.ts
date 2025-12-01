/**
 * useToggle Hook
 * Simple boolean toggle state
 */

import { useState, useCallback } from 'react';

/**
 * useToggle - Toggle boolean state
 */
export function useToggle(
  initialValue = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  return [value, toggle, setValue];
}

/**
 * useBoolean - Extended boolean state with on/off/toggle
 */
export function useBoolean(initialValue = false): {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: (value: boolean) => void;
} {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
  };
}

/**
 * useCycle - Cycle through an array of values
 */
export function useCycle<T>(values: T[]): [T, () => void, (index: number) => void] {
  const [index, setIndex] = useState(0);

  const cycle = useCallback(() => {
    setIndex(i => (i + 1) % values.length);
  }, [values.length]);

  const setByIndex = useCallback(
    (newIndex: number) => {
      setIndex(Math.max(0, Math.min(newIndex, values.length - 1)));
    },
    [values.length]
  );

  return [values[index], cycle, setByIndex];
}

/**
 * useCounter - Numeric counter state
 */
export function useCounter(
  initialValue = 0,
  options?: { min?: number; max?: number; step?: number }
): {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (value: number | ((prev: number) => number)) => void;
} {
  const { min = -Infinity, max = Infinity, step = 1 } = options || {};
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(c => Math.min(max, c + step));
  }, [max, step]);

  const decrement = useCallback(() => {
    setCount(c => Math.max(min, c - step));
  }, [min, step]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  const setCountSafe = useCallback(
    (value: number | ((prev: number) => number)) => {
      setCount(prev => {
        const nextValue = typeof value === 'function' ? value(prev) : value;
        return Math.max(min, Math.min(max, nextValue));
      });
    },
    [min, max]
  );

  return {
    count,
    increment,
    decrement,
    reset,
    setCount: setCountSafe,
  };
}

/**
 * useStep - Multi-step navigation
 */
export function useStep(
  maxStep: number,
  initialStep = 0
): {
  step: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
} {
  const [step, setStep] = useState(initialStep);

  const nextStep = useCallback(() => {
    setStep(s => Math.min(maxStep - 1, s + 1));
  }, [maxStep]);

  const prevStep = useCallback(() => {
    setStep(s => Math.max(0, s - 1));
  }, []);

  const goToStep = useCallback(
    (newStep: number) => {
      setStep(Math.max(0, Math.min(maxStep - 1, newStep)));
    },
    [maxStep]
  );

  const reset = useCallback(() => {
    setStep(initialStep);
  }, [initialStep]);

  return {
    step,
    nextStep,
    prevStep,
    goToStep,
    reset,
    isFirstStep: step === 0,
    isLastStep: step === maxStep - 1,
    canGoNext: step < maxStep - 1,
    canGoPrev: step > 0,
  };
}

