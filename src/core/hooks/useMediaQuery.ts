/**
 * useMediaQuery Hook
 * Responsive design utilities
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Breakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export type BreakpointKey = keyof Breakpoints;

// ============================================
// CONSTANTS
// ============================================

export const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// ============================================
// HOOK IMPLEMENTATIONS
// ============================================

/**
 * Basic media query hook
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Add listener
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      mediaQueryList.addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', listener);
      } else {
        mediaQueryList.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Check if screen is at least a certain width
 */
export function useBreakpoint(
  breakpoint: BreakpointKey,
  breakpoints: Breakpoints = defaultBreakpoints
): boolean {
  const query = `(min-width: ${breakpoints[breakpoint]}px)`;
  return useMediaQuery(query);
}

/**
 * Check if screen is below a certain width
 */
export function useBreakpointDown(
  breakpoint: BreakpointKey,
  breakpoints: Breakpoints = defaultBreakpoints
): boolean {
  const query = `(max-width: ${breakpoints[breakpoint] - 1}px)`;
  return useMediaQuery(query);
}

/**
 * Check if screen is between two breakpoints
 */
export function useBreakpointBetween(
  min: BreakpointKey,
  max: BreakpointKey,
  breakpoints: Breakpoints = defaultBreakpoints
): boolean {
  const query = `(min-width: ${breakpoints[min]}px) and (max-width: ${breakpoints[max] - 1}px)`;
  return useMediaQuery(query);
}

/**
 * Get current breakpoint
 */
export function useCurrentBreakpoint(
  breakpoints: Breakpoints = defaultBreakpoints
): BreakpointKey {
  const is2xl = useBreakpoint('2xl', breakpoints);
  const isXl = useBreakpoint('xl', breakpoints);
  const isLg = useBreakpoint('lg', breakpoints);
  const isMd = useBreakpoint('md', breakpoints);
  const isSm = useBreakpoint('sm', breakpoints);

  if (is2xl) return '2xl';
  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}

/**
 * Common device checks
 */
export function useIsMobile(): boolean {
  return useBreakpointDown('md');
}

export function useIsTablet(): boolean {
  return useBreakpointBetween('md', 'lg');
}

export function useIsDesktop(): boolean {
  return useBreakpoint('lg');
}

/**
 * Check for reduced motion preference
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Check for dark mode preference
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Check for high contrast preference
 */
export function usePrefersHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: high)');
}

/**
 * Get window dimensions
 */
export function useWindowSize(): { width: number; height: number } {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Get scroll position
 */
export function useScrollPosition(): { x: number; y: number } {
  const [position, setPosition] = useState(() => ({
    x: typeof window !== 'undefined' ? window.scrollX : 0,
    y: typeof window !== 'undefined' ? window.scrollY : 0,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setPosition({
        x: window.scrollX,
        y: window.scrollY,
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

/**
 * Check if scrolled past a certain point
 */
export function useScrolledPast(threshold: number): boolean {
  const { y } = useScrollPosition();
  return y > threshold;
}

/**
 * Scroll to top
 */
export function useScrollToTop(): () => void {
  return useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
}

/**
 * Check if element is in viewport
 */
export function useInViewport(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit
): boolean {
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInViewport(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return isInViewport;
}

/**
 * Lock body scroll (useful for modals)
 */
export function useLockBodyScroll(lock: boolean): void {
  useEffect(() => {
    if (!lock) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
}

