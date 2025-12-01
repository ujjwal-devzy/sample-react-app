/**
 * Analytics Service
 * Handles analytics and reporting API calls
 */

import type { UUID } from '../../../core/types';
import { API_ENDPOINTS } from '../../../core/constants';
import { api } from '../../../core/api';
import { generateUUID } from '../../../core/utils/id';
import type {
  DashboardMetrics,
  DateRange,
  Report,
  ReportConfig,
  ExportOptions,
  TaskMetrics,
  ProjectMetrics,
  TeamMetrics,
  ProductivityMetrics,
} from '../types';

// ============================================
// MOCK DATA GENERATORS
// ============================================

const USE_MOCK = true;

function generateDateArray(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}

function generateMockTaskMetrics(): TaskMetrics {
  const dates = generateDateArray(30);
  
  const byStatus = [
      { status: 'backlog', count: 45 },
      { status: 'todo', count: 0 },
      { status: 'in_progress', count: 28 },
      { status: 'in_review', count: 12 },
      { status: 'done', count: 87 },
    ];
  const total = byStatus.reduce((acc, s) => acc + s.count, 0);
  const completed = byStatus.find(s => s.status === 'done')?.count ?? 0;
  const inProgress = byStatus.find(s => s.status === 'in_progress')?.count ?? 0;
  const overdue = Math.floor(total * 0.05);
  const completedThisWeek = Math.floor(completed * 0.1);
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const byStatusMap: Record<string, number> = Object.fromEntries(
    byStatus.map(s => [s.status.replace('in_', 'in_'), s.count])
  );

  return {
    byStatus,
    byPriority: [
      { priority: 'low', count: 35 },
      { priority: 'medium', count: 58 },
      { priority: 'high', count: 42 },
      { priority: 'critical', count: 17 },
    ],
    byAssignee: [
      { userId: 'user_001', name: 'John Doe', count: 32, completed: 24 },
      { userId: 'user_002', name: 'Alice Smith', count: 28, completed: 21 },
      { userId: 'user_003', name: 'Bob Johnson', count: 24, completed: 18 },
      { userId: 'user_004', name: 'Carol Williams', count: 20, completed: 14 },
      { userId: 'user_005', name: 'David Brown', count: 18, completed: 10 },
    ],
    completionTrend: dates.map(date => ({
      date,
      completed: Math.floor(Math.random() * 10) + 2,
      created: Math.floor(Math.random() * 8) + 3,
    })),
    averageCompletionTime: 3.5,
    overdueCount: 8,
    dueTodayCount: 5,
    dueThisWeekCount: 18,
    total,
    completed,
    inProgress,
    overdue,
    completionRate,
    completedThisWeek,
    byStatusMap: {
      backlog: byStatusMap['backlog'] ?? 0,
      todo: byStatusMap['todo'] ?? 0,
      inProgress: byStatusMap['in_progress'] ?? 0,
      inReview: byStatusMap['in_review'] ?? 0,
      done: byStatusMap['done'] ?? 0,
    },
  };
}

function generateMockProjectMetrics(): ProjectMetrics {
  const dates = generateDateArray(12).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return d.toISOString().slice(0, 7);
  });

  return {
    byStatus: [
      { status: 'planning', count: 3 },
      { status: 'active', count: 8 },
      { status: 'on_hold', count: 2 },
      { status: 'completed', count: 12 },
      { status: 'archived', count: 5 },
    ],
    byPriority: [
      { priority: 'low', count: 5 },
      { priority: 'medium', count: 10 },
      { priority: 'high', count: 8 },
      { priority: 'critical', count: 7 },
    ],
    progressDistribution: [
      { range: '0-25%', count: 4 },
      { range: '26-50%', count: 6 },
      { range: '51-75%', count: 5 },
      { range: '76-100%', count: 15 },
    ],
    completionTrend: dates.map(date => ({
      date,
      completed: Math.floor(Math.random() * 3),
      started: Math.floor(Math.random() * 4) + 1,
    })),
    atRisk: 3,
    onTrack: 6,
    ahead: 2,
  };
}

function generateMockTeamMetrics(): TeamMetrics {
  const dates = generateDateArray(30);

  return {
    bySize: [
      { range: '1-5', count: 2 },
      { range: '6-10', count: 3 },
      { range: '11-20', count: 1 },
      { range: '21+', count: 0 },
    ],
    topPerformers: [
      { teamId: 'team_001', name: 'Engineering', completionRate: 85 },
      { teamId: 'team_002', name: 'Design', completionRate: 78 },
      { teamId: 'team_003', name: 'Marketing', completionRate: 72 },
      { teamId: 'team_004', name: 'DevOps', completionRate: 68 },
    ],
    memberActivityTrend: dates.map(date => ({
      date,
      active: Math.floor(Math.random() * 10) + 20,
      total: 30,
    })),
    avgProjectsPerTeam: 3.5,
    avgMembersPerTeam: 7.5,
  };
}

function generateMockProductivityMetrics(): ProductivityMetrics {
  const weeks = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);

  return {
    dailyVelocity: 12.5,
    weeklyVelocity: 62.5,
    velocityTrend: weeks.map(week => ({
      week,
      velocity: Math.floor(Math.random() * 20) + 50,
    })),
    peakProductivityHours: Array.from({ length: 24 }, (_, hour) => ({
      hour,
      taskCount: hour >= 9 && hour <= 17 
        ? Math.floor(Math.random() * 20) + 10 
        : Math.floor(Math.random() * 5),
    })),
    peakProductivityDays: [
      { day: 'Monday', taskCount: 45 },
      { day: 'Tuesday', taskCount: 52 },
      { day: 'Wednesday', taskCount: 48 },
      { day: 'Thursday', taskCount: 55 },
      { day: 'Friday', taskCount: 38 },
      { day: 'Saturday', taskCount: 12 },
      { day: 'Sunday', taskCount: 8 },
    ],
    avgTasksPerUser: 8.5,
    avgTaskDuration: 2.3,
  };
}

// ============================================
// ANALYTICS SERVICE
// ============================================

class AnalyticsService {
  private mockDelay(ms = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(dateRange?: DateRange): Promise<DashboardMetrics> {
    if (USE_MOCK) {
      await this.mockDelay(800);
      
      return {
        overview: {
          totalProjects: 30,
          activeProjects: 11,
          totalTasks: 172,
          completedTasks: 87,
          totalTeamMembers: 30,
          activeUsers: 24,
          overallCompletion: 51,
          tasksCompletedToday: 8,
          tasksCreatedToday: 5,
        },
        taskMetrics: generateMockTaskMetrics(),
        projectMetrics: generateMockProjectMetrics(),
        teamMetrics: generateMockTeamMetrics(),
        productivityMetrics: generateMockProductivityMetrics(),
      };
    }

    const response = await api.get<DashboardMetrics>(API_ENDPOINTS.ANALYTICS_DASHBOARD, {
      params: dateRange ? {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      } : undefined,
    });
    return response.data;
  }

  /**
   * Get task metrics
   */
  async getTaskMetrics(dateRange?: DateRange): Promise<TaskMetrics> {
    if (USE_MOCK) {
      await this.mockDelay();
      return generateMockTaskMetrics();
    }

    const response = await api.get<TaskMetrics>('/analytics/tasks', {
      params: dateRange ? {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      } : undefined,
    });
    return response.data;
  }

  /**
   * Get project metrics
   */
  async getProjectMetrics(dateRange?: DateRange): Promise<ProjectMetrics> {
    if (USE_MOCK) {
      await this.mockDelay();
      return generateMockProjectMetrics();
    }

    const response = await api.get<ProjectMetrics>('/analytics/projects', {
      params: dateRange ? {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      } : undefined,
    });
    return response.data;
  }

  /**
   * Get team metrics
   */
  async getTeamMetrics(dateRange?: DateRange): Promise<TeamMetrics> {
    if (USE_MOCK) {
      await this.mockDelay();
      return generateMockTeamMetrics();
    }

    const response = await api.get<TeamMetrics>('/analytics/teams', {
      params: dateRange ? {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      } : undefined,
    });
    return response.data;
  }

  /**
   * Get productivity metrics
   */
  async getProductivityMetrics(dateRange?: DateRange): Promise<ProductivityMetrics> {
    if (USE_MOCK) {
      await this.mockDelay();
      return generateMockProductivityMetrics();
    }

    const response = await api.get<ProductivityMetrics>('/analytics/productivity', {
      params: dateRange ? {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      } : undefined,
    });
    return response.data;
  }

  /**
   * Generate report
   */
  async generateReport(config: ReportConfig): Promise<Report> {
    if (USE_MOCK) {
      await this.mockDelay(1500);
      
      return {
        id: generateUUID(),
        config,
        data: {
          summary: {
            totalItems: 150,
            completedItems: 87,
            completionRate: 58,
            avgDuration: 3.5,
          },
          tableData: Array.from({ length: 10 }, (_, i) => ({
            id: `item_${i}`,
            name: `Item ${i + 1}`,
            status: ['completed', 'in_progress', 'pending'][Math.floor(Math.random() * 3)],
            value: Math.floor(Math.random() * 100),
          })),
          chartData: Array.from({ length: 7 }, (_, i) => ({
            label: `Day ${i + 1}`,
            value: Math.floor(Math.random() * 50) + 10,
          })),
        },
        generatedAt: new Date(),
        generatedBy: 'user_001',
      };
    }

    const response = await api.post<Report>(API_ENDPOINTS.ANALYTICS_REPORTS, config);
    return response.data;
  }

  /**
   * Export analytics data
   */
  async exportData(options: ExportOptions): Promise<Blob> {
    if (USE_MOCK) {
      await this.mockDelay(2000);
      
      // Create mock CSV data
      const csvContent = `Date,Tasks Completed,Tasks Created,Completion Rate
2024-01-01,12,8,60%
2024-01-02,15,10,60%
2024-01-03,8,12,40%
2024-01-04,20,15,57%
2024-01-05,18,14,56%`;
      
      return new Blob([csvContent], { type: 'text/csv' });
    }

    const response = await api.post<Blob>(
      API_ENDPOINTS.ANALYTICS_EXPORT,
      options,
      { headers: { Accept: 'application/octet-stream' } }
    );
    return response.data;
  }

  /**
   * Get user productivity stats
   */
  async getUserProductivity(userId: UUID, dateRange?: DateRange): Promise<{
    tasksCompleted: number;
    avgCompletionTime: number;
    streak: number;
    rank: number;
    totalUsers: number;
  }> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      return {
        tasksCompleted: Math.floor(Math.random() * 50) + 20,
        avgCompletionTime: Math.random() * 3 + 1,
        streak: Math.floor(Math.random() * 15),
        rank: Math.floor(Math.random() * 10) + 1,
        totalUsers: 30,
      };
    }

    const response = await api.get<{
      tasksCompleted: number;
      avgCompletionTime: number;
      streak: number;
      rank: number;
      totalUsers: number;
    }>(`/analytics/users/${userId}/productivity`, {
      params: dateRange ? {
        startDate: dateRange.startDate.toISOString(),
        endDate: dateRange.endDate.toISOString(),
      } : undefined,
    });
    return response.data;
  }
}

export const analyticsService = new AnalyticsService();

