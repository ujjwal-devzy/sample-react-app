/**
 * useDisclosure Hook
 * Manage open/close state for modals, dropdowns, etc.
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  getButtonProps: (props?: Record<string, unknown>) => {
    onClick: () => void;
    'aria-expanded': boolean;
  };
  getDisclosureProps: (props?: Record<string, unknown>) => {
    hidden: boolean;
    'aria-hidden': boolean;
  };
}

export interface UseDisclosureOptions {
  defaultIsOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  id?: string;
}

/**
 * useDisclosure - Manage boolean disclosure state
 */
export function useDisclosure(options: UseDisclosureOptions = {}): UseDisclosureReturn {
  const { defaultIsOpen = false, onOpen: onOpenProp, onClose: onCloseProp } = options;

  const [isOpen, setIsOpen] = useState(defaultIsOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpenProp?.();
  }, [onOpenProp]);

  const close = useCallback(() => {
    setIsOpen(false);
    onCloseProp?.();
  }, [onCloseProp]);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        onOpenProp?.();
      } else {
        onCloseProp?.();
      }
      return next;
    });
  }, [onOpenProp, onCloseProp]);

  const getButtonProps = useCallback(
    (props: Record<string, unknown> = {}) => ({
      ...props,
      onClick: toggle,
      'aria-expanded': isOpen,
    }),
    [isOpen, toggle]
  );

  const getDisclosureProps = useCallback(
    (props: Record<string, unknown> = {}) => ({
      ...props,
      hidden: !isOpen,
      'aria-hidden': !isOpen,
    }),
    [isOpen]
  );

  return useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      onOpen: open,
      onClose: close,
      onToggle: toggle,
      getButtonProps,
      getDisclosureProps,
    }),
    [isOpen, open, close, toggle, getButtonProps, getDisclosureProps]
  );
}

/**
 * useDisclosures - Manage multiple disclosures
 */
export function useDisclosures<K extends string>(
  _ids: K[],
  options?: { allowMultiple?: boolean }
): {
  isOpen: (id: K) => boolean;
  open: (id: K) => void;
  close: (id: K) => void;
  toggle: (id: K) => void;
  closeAll: () => void;
  openIds: K[];
} {
  const { allowMultiple = false } = options || {};
  const [openIds, setOpenIds] = useState<K[]>([]);

  const isOpen = useCallback((id: K) => openIds.includes(id), [openIds]);

  const open = useCallback(
    (id: K) => {
      setOpenIds(prev => {
        if (prev.includes(id)) return prev;
        return allowMultiple ? [...prev, id] : [id];
      });
    },
    [allowMultiple]
  );

  const close = useCallback((id: K) => {
    setOpenIds(prev => prev.filter(i => i !== id));
  }, []);

  const toggle = useCallback(
    (id: K) => {
      setOpenIds(prev => {
        if (prev.includes(id)) {
          return prev.filter(i => i !== id);
        }
        return allowMultiple ? [...prev, id] : [id];
      });
    },
    [allowMultiple]
  );

  const closeAll = useCallback(() => {
    setOpenIds([]);
  }, []);

  return useMemo(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      closeAll,
      openIds,
    }),
    [isOpen, open, close, toggle, closeAll, openIds]
  );
}

/**
 * useModal - Extended disclosure for modals
 */
export function useModal(options: UseDisclosureOptions = {}) {
  const disclosure = useDisclosure(options);

  const getModalProps = useCallback(
    (props: Record<string, unknown> = {}) => ({
      ...props,
      isOpen: disclosure.isOpen,
      onClose: disclosure.close,
      role: 'dialog',
      'aria-modal': true,
    }),
    [disclosure.isOpen, disclosure.close]
  );

  const getTriggerProps = useCallback(
    (props: Record<string, unknown> = {}) => ({
      ...props,
      onClick: disclosure.open,
      'aria-haspopup': 'dialog',
    }),
    [disclosure.open]
  );

  return {
    ...disclosure,
    getModalProps,
    getTriggerProps,
  };
}

/**
 * useConfirmDialog - Disclosure with confirm/cancel actions
 */
export function useConfirmDialog<T = void>(
  onConfirm: (data?: T) => void | Promise<void>
): {
  isOpen: boolean;
  open: (data?: T) => void;
  close: () => void;
  confirm: () => Promise<void>;
  isConfirming: boolean;
  data: T | undefined;
} {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [data, setData] = useState<T | undefined>(undefined);

  const open = useCallback((confirmData?: T) => {
    setData(confirmData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(undefined);
  }, []);

  const confirm = useCallback(async () => {
    setIsConfirming(true);
    try {
      await onConfirm(data);
      close();
    } finally {
      setIsConfirming(false);
    }
  }, [onConfirm, data, close]);

  return {
    isOpen,
    open,
    close,
    confirm,
    isConfirming,
    data,
  };
}

