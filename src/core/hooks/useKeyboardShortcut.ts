/**
 * useKeyboardShortcut Hook
 * Handle keyboard shortcuts
 */

import { useEffect, useCallback, useRef } from 'react';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  ignoreInputs?: boolean;
}

export interface ParsedShortcut {
  key: string;
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse shortcut string into components
 * Supports: ctrl, cmd, meta, mod (ctrl on Windows, cmd on Mac), alt, shift
 */
function parseShortcut(shortcut: string): ParsedShortcut {
  const parts = shortcut.toLowerCase().split('+').map(s => s.trim());
  
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  
  return {
    key: parts[parts.length - 1],
    ctrl: parts.includes('ctrl') || parts.includes('control'),
    meta: parts.includes('meta') || parts.includes('cmd') || parts.includes('command'),
    alt: parts.includes('alt') || parts.includes('option'),
    shift: parts.includes('shift'),
    // 'mod' key: meta on Mac, ctrl on Windows/Linux
    ...(parts.includes('mod') && {
      ctrl: !isMac,
      meta: isMac,
    }),
  };
}

/**
 * Check if event matches parsed shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: ParsedShortcut): boolean {
  const eventKey = event.key.toLowerCase();
  
  // Handle special keys
  const keyMatches = 
    eventKey === shortcut.key ||
    event.code.toLowerCase() === shortcut.key ||
    (shortcut.key === 'escape' && eventKey === 'escape') ||
    (shortcut.key === 'enter' && eventKey === 'enter') ||
    (shortcut.key === 'space' && eventKey === ' ') ||
    (shortcut.key === 'backspace' && eventKey === 'backspace') ||
    (shortcut.key === 'delete' && eventKey === 'delete') ||
    (shortcut.key === 'tab' && eventKey === 'tab');

  const modifiersMatch =
    event.ctrlKey === shortcut.ctrl &&
    event.metaKey === shortcut.meta &&
    event.altKey === shortcut.alt &&
    event.shiftKey === shortcut.shift;

  return keyMatches && modifiersMatch;
}

/**
 * Check if event target is an input element
 */
function isInputElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  );
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

/**
 * Single keyboard shortcut
 */
export function useKeyboardShortcut(
  shortcut: string,
  callback: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {}
): void {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    ignoreInputs = true,
  } = options;

  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      
      // Ignore if typing in an input
      if (ignoreInputs && isInputElement(event.target)) return;

      const parsedShortcut = parseShortcut(shortcut);
      
      if (matchesShortcut(event, parsedShortcut)) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        callbackRef.current(event);
      }
    },
    [enabled, shortcut, preventDefault, stopPropagation, ignoreInputs]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Multiple keyboard shortcuts
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, (event: KeyboardEvent) => void>,
  options: ShortcutOptions = {}
): void {
  const {
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    ignoreInputs = true,
  } = options;

  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (ignoreInputs && isInputElement(event.target)) return;

      for (const [shortcut, callback] of Object.entries(shortcutsRef.current)) {
        const parsedShortcut = parseShortcut(shortcut);
        
        if (matchesShortcut(event, parsedShortcut)) {
          if (preventDefault) event.preventDefault();
          if (stopPropagation) event.stopPropagation();
          callback(event);
          return;
        }
      }
    },
    [enabled, preventDefault, stopPropagation, ignoreInputs]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Escape key shortcut
 */
export function useEscapeKey(
  callback: () => void,
  enabled = true
): void {
  useKeyboardShortcut('escape', callback, { enabled, ignoreInputs: false });
}

/**
 * Enter key shortcut
 */
export function useEnterKey(
  callback: () => void,
  options: ShortcutOptions = {}
): void {
  useKeyboardShortcut('enter', callback, options);
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: string): string {
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  
  const symbols: Record<string, string> = {
    mod: isMac ? '⌘' : 'Ctrl',
    ctrl: isMac ? '⌃' : 'Ctrl',
    meta: isMac ? '⌘' : 'Win',
    cmd: '⌘',
    alt: isMac ? '⌥' : 'Alt',
    shift: isMac ? '⇧' : 'Shift',
    enter: '↵',
    escape: 'Esc',
    backspace: '⌫',
    delete: '⌦',
    tab: '⇥',
    space: '␣',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
  };

  return shortcut
    .split('+')
    .map(part => {
      const trimmed = part.trim().toLowerCase();
      return symbols[trimmed] || part.trim().toUpperCase();
    })
    .join(isMac ? '' : '+');
}

