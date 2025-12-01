/**
 * Badge Component
 * Display status, counts, or labels
 */

import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;
  dot?: boolean;
  dotColor?: string;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'badge-default',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  dot = false,
  dotColor,
  removable = false,
  onRemove,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`badge ${variantClasses[variant]} ${sizeClasses[size]} ${
        rounded ? 'badge-rounded' : ''
      } ${className}`}
    >
      {dot && (
        <span
          className="badge-dot"
          style={dotColor ? { backgroundColor: dotColor } : undefined}
        />
      )}
      <span className="badge-content">{children}</span>
      {removable && (
        <button
          type="button"
          className="badge-remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          aria-label="Remove"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  size?: BadgeSize;
  className?: string;
}

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'success', label: 'Active' },
  inactive: { variant: 'default', label: 'Inactive' },
  pending: { variant: 'warning', label: 'Pending' },
  completed: { variant: 'success', label: 'Completed' },
  planning: { variant: 'info', label: 'Planning' },
  on_hold: { variant: 'warning', label: 'On Hold' },
  archived: { variant: 'default', label: 'Archived' },
  in_progress: { variant: 'info', label: 'In Progress' },
  review: { variant: 'primary', label: 'Review' },
  done: { variant: 'success', label: 'Done' },
  backlog: { variant: 'secondary', label: 'Backlog' },
};

export function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'default' as BadgeVariant, label: status };
  
  return (
    <Badge variant={config.variant} size={size} dot className={className}>
      {config.label}
    </Badge>
  );
}

interface PriorityBadgeProps {
  priority: string;
  size?: BadgeSize;
  className?: string;
}

const priorityConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  low: { variant: 'success', label: 'Low' },
  medium: { variant: 'warning', label: 'Medium' },
  high: { variant: 'danger', label: 'High' },
  critical: { variant: 'danger', label: 'Critical' },
};

export function PriorityBadge({ priority, size = 'sm', className = '' }: PriorityBadgeProps) {
  const config = priorityConfig[priority] || { variant: 'default' as BadgeVariant, label: priority };
  
  return (
    <Badge variant={config.variant} size={size} className={className}>
      {config.label}
    </Badge>
  );
}

interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export function CountBadge({
  count,
  max = 99,
  variant = 'primary',
  size = 'sm',
  className = '',
}: CountBadgeProps) {
  if (count === 0) return null;
  
  const displayCount = count > max ? `${max}+` : count.toString();
  
  return (
    <Badge variant={variant} size={size} rounded className={className}>
      {displayCount}
    </Badge>
  );
}

