/**
 * Select Component
 * Dropdown select with label and error states
 */

import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      options,
      placeholder,
      size = 'md',
      fullWidth = true,
      leftIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'select-sm',
      md: 'select-md',
      lg: 'select-lg',
    };

    return (
      <div
        className={`select-wrapper ${fullWidth ? 'select-full-width' : ''} ${className}`}
      >
        {label && (
          <label htmlFor={selectId} className="select-label">
            {label}
            {props.required && <span className="select-required">*</span>}
          </label>
        )}
        <div className={`select-container ${error ? 'select-error' : ''}`}>
          {leftIcon && <span className="select-icon select-icon-left">{leftIcon}</span>}
          <select
            ref={ref}
            id={selectId}
            className={`select ${sizeClasses[size]} ${leftIcon ? 'select-with-left-icon' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <span className="select-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </span>
        </div>
        {error && (
          <p id={`${selectId}-error`} className="select-error-message" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${selectId}-hint`} className="select-hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
