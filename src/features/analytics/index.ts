/**
 * Analytics Feature Module
 * Exports all analytics-related functionality.
 */

// Components
export { AnalyticsDashboard } from './components/AnalyticsDashboard';
export { MetricsCard, calculateTrendPercentage } from './components/MetricsCard';
export { EngagementChart, formatMetricValue } from './components/EngagementChart';

// Hooks
export { useAnalytics, analytics } from './hooks/useAnalytics';

// Types
export type { 
  UserAnalytics, 
  EventData, 
  AnalyticsConfig 
} from '../../backend/services/types';

// Services
export { 
  analyticsServiceInstance,
  directDatabaseQuery 
} from '../../backend/services/analyticsService';

