/**
 * Empty State Components
 * Display when there's no data or errors
 */

import type { ReactNode } from 'react';
import { Button } from './Button';

// ============================================
// EMPTY STATE
// ============================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const defaultIcon = (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  );

  return (
    <div className={`empty-state empty-state-${size} ${className}`}>
      <div className="empty-state-icon">{icon || defaultIcon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {(action || secondaryAction) && (
        <div className="empty-state-actions">
          {action && (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// ERROR STATE
// ============================================

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  error,
  onRetry,
  className = '',
}: ErrorStateProps) {
  const errorMessage = message || error?.message || 'An unexpected error occurred';

  return (
    <div className={`error-state ${className}`}>
      <div className="error-state-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-message">{errorMessage}</p>
      {onRetry && (
        <Button onClick={onRetry}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Try Again
        </Button>
      )}
    </div>
  );
}

// ============================================
// NOT FOUND STATE
// ============================================

interface NotFoundStateProps {
  title?: string;
  message?: string;
  onGoBack?: () => void;
  onGoHome?: () => void;
  className?: string;
}

export function NotFoundState({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or has been moved.",
  onGoBack,
  onGoHome,
  className = '',
}: NotFoundStateProps) {
  return (
    <div className={`not-found-state ${className}`}>
      <div className="not-found-state-code">404</div>
      <h1 className="not-found-state-title">{title}</h1>
      <p className="not-found-state-message">{message}</p>
      <div className="not-found-state-actions">
        {onGoBack && (
          <Button variant="secondary" onClick={onGoBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Go Back
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================
// NO RESULTS STATE
// ============================================

interface NoResultsStateProps {
  query?: string;
  suggestions?: string[];
  onClearSearch?: () => void;
  className?: string;
}

export function NoResultsState({
  query,
  suggestions,
  onClearSearch,
  className = '',
}: NoResultsStateProps) {
  return (
    <div className={`no-results-state ${className}`}>
      <div className="no-results-state-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <path d="M11 8v6M8 11h6" />
        </svg>
      </div>
      <h3 className="no-results-state-title">No results found</h3>
      <p className="no-results-state-message">
        {query 
          ? `We couldn't find anything matching "${query}"`
          : "We couldn't find any results"}
      </p>
      {suggestions && suggestions.length > 0 && (
        <div className="no-results-suggestions">
          <p>Try searching for:</p>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      {onClearSearch && (
        <Button variant="secondary" onClick={onClearSearch}>
          Clear search
        </Button>
      )}
    </div>
  );
}

