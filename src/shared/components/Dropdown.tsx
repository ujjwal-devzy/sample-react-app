/**
 * Dropdown Component
 * Dropdown menu with various trigger types
 */

import { useState, useRef, type ReactNode } from 'react';
import { useOnClickOutside } from '../../core/hooks/useOnClickOutside';
import { useKeyboardShortcut } from '../../core/hooks/useKeyboardShortcut';

type DropdownPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  placement?: DropdownPlacement;
  className?: string;
  closeOnSelect?: boolean;
  disabled?: boolean;
}

export function Dropdown({
  trigger,
  children,
  placement = 'bottom-start',
  className = '',
  closeOnSelect = true,
  disabled = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(dropdownRef, () => setIsOpen(false));
  useKeyboardShortcut('escape', () => setIsOpen(false), { enabled: isOpen });

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleMenuClick = () => {
    if (closeOnSelect) {
      setIsOpen(false);
    }
  };

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <div
        className="dropdown-trigger"
        onClick={handleTriggerClick}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onKeyDown={(e) => e.key === 'Enter' && handleTriggerClick()}
      >
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`dropdown-menu dropdown-${placement}`}
          role="menu"
          onClick={handleMenuClick}
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: ReactNode;
  shortcut?: string;
  className?: string;
}

export function DropdownItem({
  children,
  onClick,
  disabled = false,
  danger = false,
  icon,
  shortcut,
  className = '',
}: DropdownItemProps) {
  return (
    <button
      type="button"
      className={`dropdown-item ${danger ? 'dropdown-item-danger' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
    >
      {icon && <span className="dropdown-item-icon">{icon}</span>}
      <span className="dropdown-item-label">{children}</span>
      {shortcut && <span className="dropdown-item-shortcut">{shortcut}</span>}
    </button>
  );
}

interface DropdownDividerProps {
  className?: string;
}

export function DropdownDivider({ className = '' }: DropdownDividerProps) {
  return <div className={`dropdown-divider ${className}`} role="separator" />;
}

interface DropdownLabelProps {
  children: ReactNode;
  className?: string;
}

export function DropdownLabel({ children, className = '' }: DropdownLabelProps) {
  return <div className={`dropdown-label ${className}`}>{children}</div>;
}

interface DropdownGroupProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export function DropdownGroup({ children, label, className = '' }: DropdownGroupProps) {
  return (
    <div className={`dropdown-group ${className}`} role="group">
      {label && <DropdownLabel>{label}</DropdownLabel>}
      {children}
    </div>
  );
}

