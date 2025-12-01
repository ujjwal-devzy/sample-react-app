/**
 * Input Component
 * Text input with label, error states, and icons
 */

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  multiline?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      fullWidth = true,
      multiline = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'input-sm',
      md: 'input-md',
      lg: 'input-lg',
    };

    return (
      <div
        className={`input-wrapper ${fullWidth ? 'input-full-width' : ''} ${className}`}
      >
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {props.required && <span className="input-required">*</span>}
          </label>
        )}
        <div className={`input-container ${error ? 'input-error' : ''}`}>
          {leftIcon && <span className="input-icon input-icon-left">{leftIcon}</span>}
          {multiline ? (
            <textarea
              ref={ref as unknown as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              className={`input input-textarea ${sizeClasses[size]} ${leftIcon ? 'input-with-left-icon' : ''} ${
                rightIcon ? 'input-with-right-icon' : ''
              }`}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
              rows={(props as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>).rows}
              {...(props as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref}
              id={inputId}
              className={`input ${sizeClasses[size]} ${leftIcon ? 'input-with-left-icon' : ''} ${
                rightIcon ? 'input-with-right-icon' : ''
              }`}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
              {...props}
            />
          )}
          {rightIcon && <span className="input-icon input-icon-right">{rightIcon}</span>}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="input-error-message" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="input-hint">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
