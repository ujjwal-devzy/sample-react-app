/**
 * Search Input Component
 * Enhanced search input with clear and loading states
 */

import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { useDebouncedValue } from '../../core/hooks/useDebounce';
import { Spinner } from './Loading';

interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showClear?: boolean;
  showIcon?: boolean;
  disabled?: boolean;
}

export function SearchInput({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  isLoading = false,
  autoFocus = false,
  size = 'md',
  className = '',
  showClear = true,
  showIcon = true,
  disabled = false,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;
  const debouncedValue = useDebouncedValue(value, debounceMs);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (onSearch && debouncedValue !== undefined) {
      onSearch(debouncedValue);
    }
  }, [debouncedValue, onSearch]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('');
    }
    onChange?.('');
    onSearch?.('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
    if (e.key === 'Enter') {
      onSearch?.(value);
    }
  };

  const sizeClasses = {
    sm: 'search-input-sm',
    md: 'search-input-md',
    lg: 'search-input-lg',
  };

  return (
    <div className={`search-input-wrapper ${sizeClasses[size]} ${className}`}>
      {showIcon && (
        <span className="search-input-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        className="search-input"
        value={value}
        disabled={disabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search"
      />
      {isLoading && (
        <span className="search-input-loading">
          <Spinner size="sm" />
        </span>
      )}
      {showClear && value && !isLoading && (
        <button
          type="button"
          className="search-input-clear"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

