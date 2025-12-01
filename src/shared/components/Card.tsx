/**
 * Card Component
 * Container component with various styles
 */

import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  selected?: boolean;
  className?: string;
}

const variantClasses: Record<string, string> = {
  default: 'card-default',
  outlined: 'card-outlined',
  elevated: 'card-elevated',
  ghost: 'card-ghost',
};

const paddingClasses: Record<string, string> = {
  none: 'card-padding-none',
  sm: 'card-padding-sm',
  md: 'card-padding-md',
  lg: 'card-padding-lg',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  selected = false,
  className = '',
  onClick,
  ...props
}: CardProps) {
  const classes = [
    'card',
    variantClasses[variant],
    paddingClasses[padding],
    hoverable ? 'card-hoverable' : '',
    clickable ? 'card-clickable' : '',
    selected ? 'card-selected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable && onClick ? (e) => e.key === 'Enter' && onClick(e as unknown as React.MouseEvent<HTMLDivElement>) : undefined}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ children, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`card-header ${className}`}>
      <div className="card-header-content">{children}</div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  subtitle?: string;
  className?: string;
}

export function CardTitle({ children, subtitle, className = '' }: CardTitleProps) {
  return (
    <div className={`card-title-wrapper ${className}`}>
      <h3 className="card-title">{children}</h3>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`card-content ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export function CardFooter({ children, align = 'right', className = '' }: CardFooterProps) {
  return (
    <div className={`card-footer card-footer-${align} ${className}`}>
      {children}
    </div>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  position?: 'top' | 'bottom';
  aspectRatio?: 'video' | 'square' | 'wide';
  className?: string;
}

export function CardImage({
  src,
  alt,
  position = 'top',
  aspectRatio,
  className = '',
}: CardImageProps) {
  return (
    <div
      className={`card-image card-image-${position} ${
        aspectRatio ? `card-image-${aspectRatio}` : ''
      } ${className}`}
    >
      <img src={src} alt={alt} />
    </div>
  );
}

