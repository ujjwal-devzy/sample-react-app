/**
 * Core Module Exports
 * Central export point for all core utilities, types, constants, hooks, and API
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Utilities
export * from './utils';

// API
export * from './api';

// Hooks
export {
  // async
  useAsync,
  useAsyncImmediate,
  useMutation,
  useFetch,
  // debounce/throttle
  useDebouncedValue,
  useDebouncedCallback,
  useDebouncedState,
  useThrottledValue,
  useThrottledCallback,
  // form
  useForm,
  // dom/events
  useEventListener,
  useOnClickOutside,
  useClickOutside,
  useKeyboardShortcut,
  useKeyboardShortcuts,
  useEscapeKey,
  useEnterKey,
  formatShortcut,
  // media/time
  useMediaQuery,
  usePrevious,
  useInterval,
  useTimeout,
  useCountdown,
  useTimer,
  usePolling,
  // state
  useToggle,
  useDisclosure,
  useDisclosures,
  useModal,
  useConfirmDialog,
} from './hooks';

export type {
  AsyncState,
  UseAsyncOptions,
  UseAsyncReturn,
  UseFetchOptions,
  UseDebouncedStateOptions,
  FormState,
  UseFormOptions,
  UseFormReturn,
  FieldInputProps,
  FieldMeta,
  FieldHelpers,
  ShortcutOptions,
  ParsedShortcut,
  UseDisclosureReturn,
  UseDisclosureOptions,
} from './hooks';
