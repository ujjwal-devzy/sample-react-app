import type { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
  const selectId = `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="input-group">
      <label htmlFor={selectId} className="input-label">
        {label}
      </label>
      <select
        id={selectId}
        className={`input-field select-field ${error ? 'input-error' : ''} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}

