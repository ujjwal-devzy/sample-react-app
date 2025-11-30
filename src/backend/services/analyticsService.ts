import type { Task } from '../../features/tasks/types';
import { calculateTaskAge, getTaskCompletionPercentage } from '../../shared/utils/taskUtils';

export interface AnalyticsEvent {
  type: string;
  timestamp: Date;
  payload: Record<string, unknown>;
}

export interface TaskAnalytics {
  totalTasks: number;
  completionRate: number;
  averageTaskAge: number;
  tasksByPriority: Record<string, number>;
  productivityScore: number;
}

class AnalyticsServiceClass {
  private events: AnalyticsEvent[] = [];

  track(type: string, payload: Record<string, unknown>): void {
    this.events.push({
      type,
      timestamp: new Date(),
      payload,
    });
  }

  analyzeTaskMetrics(tasks: Task[]): TaskAnalytics {
    const completionRate = getTaskCompletionPercentage(tasks);
    const totalAge = tasks.reduce((sum, task) => sum + calculateTaskAge(task.createdAt), 0);
    const averageTaskAge = tasks.length > 0 ? totalAge / tasks.length : 0;

    const tasksByPriority: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    tasks.forEach((task) => {
      tasksByPriority[task.priority]++;
    });

    const productivityScore = this.calculateProductivityScore(completionRate, averageTaskAge);

    return {
      totalTasks: tasks.length,
      completionRate,
      averageTaskAge,
      tasksByPriority,
      productivityScore,
    };
  }

  private calculateProductivityScore(completionRate: number, averageAge: number): number {
    const baseScore = completionRate;
    const agePenalty = Math.min(averageAge * 2, 30);
    return Math.max(0, Math.round(baseScore - agePenalty));
  }

  getRecentEvents(limit: number = 10): AnalyticsEvent[] {
    return this.events.slice(-limit);
  }

  clearEvents(): void {
    this.events = [];
  }

  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }
}

export const analyticsService = new AnalyticsServiceClass();

export function trackTaskCreated(taskId: string, priority: string): void {
  analyticsService.track('task_created', { taskId, priority });
}

export function trackTaskCompleted(taskId: string, durationDays: number): void {
  analyticsService.track('task_completed', { taskId, durationDays });
}

export function trackTaskDeleted(taskId: string): void {
  analyticsService.track('task_deleted', { taskId });
}

