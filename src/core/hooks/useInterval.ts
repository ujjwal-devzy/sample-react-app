/**
 * useInterval Hook
 * Safe interval that cleans up automatically
 */

import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * useInterval - Run a callback at a specified interval
 */
export function useInterval(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return;

    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);

    return () => clearInterval(id);
  }, [delay]);
}

/**
 * useTimeout - Run a callback after a specified delay
 */
export function useTimeout(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);

    return () => clearTimeout(id);
  }, [delay]);
}

/**
 * useCountdown - Countdown timer
 */
export function useCountdown(
  endTime: Date | number,
  options?: { interval?: number; onComplete?: () => void }
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
  totalSeconds: number;
} {
  const { interval = 1000, onComplete } = options || {};
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const calculateTimeLeft = useCallback(() => {
    const target = typeof endTime === 'number' ? endTime : endTime.getTime();
    const difference = target - Date.now();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isComplete: true,
        totalSeconds: 0,
      };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds, isComplete: false, totalSeconds };
  }, [endTime]);

  const timeLeftRef = useRef(calculateTimeLeft());
  const [, setTick] = useState(0);

  useInterval(() => {
    const newTimeLeft = calculateTimeLeft();
    timeLeftRef.current = newTimeLeft;
    setTick(t => t + 1);

    if (newTimeLeft.isComplete && onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, timeLeftRef.current.isComplete ? null : interval);

  return timeLeftRef.current;
}

/**
 * useTimer - Stopwatch/timer that counts up
 */
export function useTimer(
  options?: { autoStart?: boolean; interval?: number }
): {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  formattedTime: string;
} {
  const { autoStart = false, interval = 1000 } = options || {};
  
  const startTimeRef = useRef<number | null>(null);
  const elapsedRef = useRef(0);
  const isRunningRef = useRef(autoStart);
  const [, setTick] = useState(0);

  const getTime = useCallback(() => {
    if (!isRunningRef.current || startTimeRef.current === null) {
      return elapsedRef.current;
    }
    return elapsedRef.current + (Date.now() - startTimeRef.current);
  }, []);

  useInterval(
    () => {
      setTick(t => t + 1);
    },
    isRunningRef.current ? interval : null
  );

  const start = useCallback(() => {
    if (!isRunningRef.current) {
      startTimeRef.current = Date.now();
      isRunningRef.current = true;
      setTick(t => t + 1);
    }
  }, []);

  const pause = useCallback(() => {
    if (isRunningRef.current && startTimeRef.current !== null) {
      elapsedRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
      isRunningRef.current = false;
      setTick(t => t + 1);
    }
  }, []);

  const reset = useCallback(() => {
    startTimeRef.current = isRunningRef.current ? Date.now() : null;
    elapsedRef.current = 0;
    setTick(t => t + 1);
  }, []);

  const time = getTime();
  const totalSeconds = Math.floor(time / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime = hours > 0
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return {
    time,
    isRunning: isRunningRef.current,
    start,
    pause,
    reset,
    formattedTime,
  };
}

/**
 * usePolling - Periodically call an async function
 */
export function usePolling(
  callback: () => Promise<void>,
  interval: number,
  options?: { enabled?: boolean; immediate?: boolean }
): { isPolling: boolean; error: Error | null } {
  const { enabled = true, immediate = true } = options || {};
  const savedCallback = useRef(callback);
  const errorRef = useRef<Error | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    const poll = async () => {
      try {
        await savedCallback.current();
        errorRef.current = null;
      } catch (err) {
        errorRef.current = err as Error;
      }
    };

    if (immediate) {
      poll();
    }

    const id = setInterval(() => {
      if (isMounted) {
        poll();
      }
    }, interval);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [interval, enabled, immediate]);

  return { isPolling: enabled, error: errorRef.current };
}

