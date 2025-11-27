/**
 * Analytics Types
 */

export interface UserAnalytics {
  userId: string;
  pageViews: number;
  sessions: number;
  avgSessionDuration: number;
  lastActive: string;
}

export interface EventData {
  eventName: string;
  userId: string;
  timestamp: number;
  properties: Record<string, unknown>;
  sessionId: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  sampleRate: number;
  endpoint: string;
  apiKey?: string;
}

export interface MetricsSummary {
  totalUsers: number;
  totalEvents: number;
  avgEngagement: number;
  topEvents: string[];
}

export interface _InternalDatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

