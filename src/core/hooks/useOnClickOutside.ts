/**
 * useOnClickOutside Hook
 * Detect clicks outside of a specified element
 */

import { useEffect, useRef, type RefObject } from 'react';

type Handler = (event: MouseEvent | TouchEvent) => void;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handlerRef.current(event);
    };

    document.addEventListener(mouseEvent, listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, mouseEvent]);
}

/**
 * Alternative version that returns a ref to use
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: Handler
): RefObject<T | null> {
  const ref = useRef<T | null>(null);
  useOnClickOutside(ref, handler);
  return ref;
}
