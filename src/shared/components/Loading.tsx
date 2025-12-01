/**
 * Loading Components
 * Spinners, skeletons, and loading states
 */

import type { ReactNode } from 'react';

// ============================================
// SPINNER
// ============================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function Spinner({ size = 'md', color, className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  };

  return (
    <div
      className={`spinner ${sizeClasses[size]} ${className}`}
      style={color ? { borderTopColor: color } : undefined}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// ============================================
// LOADING OVERLAY
// ============================================

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  blur?: boolean;
  fullScreen?: boolean;
  children?: ReactNode;
}

export function LoadingOverlay({
  isLoading,
  message,
  blur = true,
  fullScreen = false,
  children,
}: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`loading-overlay-container ${fullScreen ? 'full-screen' : ''}`}>
      {children && <div className={`loading-content ${blur ? 'blur' : ''}`}>{children}</div>}
      <div className="loading-overlay">
        <Spinner size="lg" />
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
}

// ============================================
// SKELETON
// ============================================

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({
  width,
  height,
  borderRadius = '4px',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius,
      }}
    />
  );
}

// ============================================
// SKELETON TEXT
// ============================================

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '60%',
  className = '',
}: SkeletonTextProps) {
  return (
    <div className={`skeleton-text ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={16}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          className="skeleton-line"
        />
      ))}
    </div>
  );
}

// ============================================
// SKELETON AVATAR
// ============================================

interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function SkeletonAvatar({ size = 'md', className = '' }: SkeletonAvatarProps) {
  const sizes = { sm: 24, md: 32, lg: 40, xl: 48 };
  
  return (
    <Skeleton
      width={sizes[size]}
      height={sizes[size]}
      borderRadius="50%"
      className={`skeleton-avatar ${className}`}
    />
  );
}

// ============================================
// SKELETON CARD
// ============================================

interface SkeletonCardProps {
  hasImage?: boolean;
  hasFooter?: boolean;
  className?: string;
}

export function SkeletonCard({
  hasImage = false,
  hasFooter = true,
  className = '',
}: SkeletonCardProps) {
  return (
    <div className={`skeleton-card ${className}`}>
      {hasImage && (
        <Skeleton height={160} borderRadius="8px 8px 0 0" className="skeleton-card-image" />
      )}
      <div className="skeleton-card-content">
        <div className="skeleton-card-header">
          <SkeletonAvatar size="md" />
          <div className="skeleton-card-meta">
            <Skeleton height={16} width="60%" />
            <Skeleton height={12} width="40%" />
          </div>
        </div>
        <SkeletonText lines={2} />
      </div>
      {hasFooter && (
        <div className="skeleton-card-footer">
          <Skeleton height={32} width={80} />
          <Skeleton height={32} width={80} />
        </div>
      )}
    </div>
  );
}

// ============================================
// SKELETON LIST
// ============================================

interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
  gap?: number;
  className?: string;
}

export function SkeletonList({
  count = 3,
  itemHeight = 60,
  gap = 12,
  className = '',
}: SkeletonListProps) {
  return (
    <div className={`skeleton-list ${className}`} style={{ gap }}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-list-item" style={{ height: itemHeight }}>
          <SkeletonAvatar size="md" />
          <div className="skeleton-list-item-content">
            <Skeleton height={16} width="70%" />
            <Skeleton height={12} width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// LOADING STATE
// ============================================

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  className = '',
}: LoadingStateProps) {
  return (
    <div className={`loading-state loading-state-${size} ${className}`}>
      <Spinner size={size} />
      <span className="loading-state-message">{message}</span>
    </div>
  );
}

