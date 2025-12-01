/**
 * Analytics Types
 * Types for analytics and reporting
 */

import type { UUID } from '../../../core/types';

// ============================================
// TIME PERIODS
// ============================================

export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// ============================================
// DASHBOARD METRICS
// ============================================

export interface DashboardMetrics {
  overview: OverviewMetrics;
  taskMetrics: TaskMetrics;
  projectMetrics: ProjectMetrics;
  teamMetrics: TeamMetrics;
  productivityMetrics: ProductivityMetrics;
}

export interface OverviewMetrics {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalTeamMembers: number;
  activeUsers: number;
  overallCompletion: number;
  tasksCompletedToday: number;
  tasksCreatedToday: number;
}

export interface TaskMetrics {
  // Detailed breakdowns
  byStatus: Array<{ status: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  byAssignee: Array<{ userId: UUID; name: string; count: number; completed: number }>;
  completionTrend: Array<{ date: string; completed: number; created: number }>;
  averageCompletionTime: number;
  overdueCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
  // Derived/summary fields used by UI
  total?: number;
  completed?: number;
  inProgress?: number;
  overdue?: number;
  completionRate?: number;
  completedThisWeek?: number;
  // Convenience map for direct access by status
  byStatusMap?: {
    backlog?: number;
    todo?: number;
    inProgress?: number;
    inReview?: number;
    done?: number;
    [key: string]: number | undefined;
  };
}

export interface ProjectMetrics {
  byStatus: Array<{ status: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  progressDistribution: Array<{ range: string; count: number }>;
  completionTrend: Array<{ date: string; completed: number; started: number }>;
  atRisk: number;
  onTrack: number;
  ahead: number;
}

export interface TeamMetrics {
  bySize: Array<{ range: string; count: number }>;
  topPerformers: Array<{ teamId: UUID; name: string; completionRate: number }>;
  memberActivityTrend: Array<{ date: string; active: number; total: number }>;
  avgProjectsPerTeam: number;
  avgMembersPerTeam: number;
}

export interface ProductivityMetrics {
  dailyVelocity: number;
  weeklyVelocity: number;
  velocityTrend: Array<{ week: string; velocity: number }>;
  peakProductivityHours: Array<{ hour: number; taskCount: number }>;
  peakProductivityDays: Array<{ day: string; taskCount: number }>;
  avgTasksPerUser: number;
  avgTaskDuration: number;
}

// ============================================
// CHART DATA
// ============================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MultiSeriesDataPoint {
  date: string;
  [key: string]: string | number;
}

// ============================================
// REPORT TYPES
// ============================================

export type ReportType = 
  | 'project_summary'
  | 'team_performance'
  | 'individual_performance'
  | 'task_analysis'
  | 'time_tracking'
  | 'custom';

export interface ReportConfig {
  type: ReportType;
  title: string;
  description?: string;
  dateRange: DateRange;
  filters: ReportFilters;
  groupBy?: string;
  metrics: string[];
  format: 'table' | 'chart' | 'both';
}

export interface ReportFilters {
  projectIds?: UUID[];
  teamIds?: UUID[];
  userIds?: UUID[];
  statuses?: string[];
  priorities?: string[];
  tags?: string[];
}

export interface Report {
  id: UUID;
  config: ReportConfig;
  data: ReportData;
  generatedAt: Date;
  generatedBy: UUID;
}

export interface ReportData {
  summary: Record<string, number | string>;
  tableData?: Array<Record<string, unknown>>;
  chartData?: Array<ChartDataPoint | TimeSeriesDataPoint>;
}

// ============================================
// EXPORT OPTIONS
// ============================================

export type ExportFormat = 'pdf' | 'csv' | 'xlsx' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  includeCharts: boolean;
  dateRange: DateRange;
  filters?: ReportFilters;
}

// ============================================
// WIDGET TYPES
// ============================================

export type WidgetType = 
  | 'stat_card'
  | 'progress_ring'
  | 'bar_chart'
  | 'line_chart'
  | 'pie_chart'
  | 'table'
  | 'activity_feed'
  | 'leaderboard';

export interface DashboardWidget {
  id: UUID;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: { x: number; y: number; w: number; h: number };
}

export interface WidgetConfig {
  metric?: string;
  dateRange?: DateRange;
  filters?: ReportFilters;
  limit?: number;
  showTrend?: boolean;
  showComparison?: boolean;
}

// ============================================
// ANALYTICS CONTEXT
// ============================================

export interface AnalyticsContextValue {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  selectedPeriod: TimePeriod;
  dateRange: DateRange;
  
  // Actions
  loadDashboardMetrics: (dateRange?: DateRange) => Promise<void>;
  setSelectedPeriod: (period: TimePeriod) => void;
  setDateRange: (range: DateRange) => void;
  generateReport: (config: ReportConfig) => Promise<Report>;
  exportData: (options: ExportOptions) => Promise<Blob>;
}

