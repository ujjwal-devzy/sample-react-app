/**
 * Progress Components
 * Progress bars and rings
 */

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`progress-bar-container progress-${size} ${className}`}>
      {(showLabel || label) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showLabel && <span className="progress-value">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="progress-bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div
          className={`progress-fill progress-${variant} ${animated ? 'progress-animated' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface ProgressRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
  label,
  variant = 'default',
  className = '',
}: ProgressRingProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors: Record<string, string> = {
    default: 'var(--color-neon-purple)',
    success: 'var(--color-neon-green)',
    warning: 'var(--color-neon-orange)',
    danger: 'var(--color-neon-red)',
  };

  return (
    <div className={`progress-ring-container ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="progress-ring-bg"
          stroke="var(--color-bg-tertiary)"
          strokeWidth={strokeWidth}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring-fill"
          stroke={variantColors[variant]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      {showLabel && (
        <div className="progress-ring-label">
          <span className="progress-ring-value">{Math.round(percentage)}%</span>
          {label && <span className="progress-ring-text">{label}</span>}
        </div>
      )}
    </div>
  );
}

