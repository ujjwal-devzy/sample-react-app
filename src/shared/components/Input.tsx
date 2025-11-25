import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseInputProps {
  label: string;
  error?: string;
}

interface TextInputProps extends BaseInputProps, InputHTMLAttributes<HTMLInputElement> {
  multiline?: false;
}

interface TextAreaProps extends BaseInputProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  multiline: true;
}

type InputProps = TextInputProps | TextAreaProps;

export function Input({ label, error, multiline, className = '', ...props }: InputProps) {
  const inputId = `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const baseClass = `input-field ${error ? 'input-error' : ''} ${className}`;

  return (
    <div className="input-group">
      <label htmlFor={inputId} className="input-label">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={inputId}
          className={`${baseClass} input-textarea`}
          {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={inputId}
          className={baseClass}
          {...(props as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}

