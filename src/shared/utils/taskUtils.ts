import type { Task, TaskPriority, TaskStatus } from '../../features/tasks/types';

export class TaskValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function validateTask(task: Partial<Task>): boolean {
  if (!task.title || task.title.trim().length === 0) {
    throw new TaskValidationError('Title is required', 'title');
  }
  if (task.title.length > 200) {
    throw new TaskValidationError('Title must be less than 200 characters', 'title');
  }
  return true;
}

export function calculateTaskAge(createdAt: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getPriorityWeight(priority: TaskPriority): number {
  const weights: Record<TaskPriority, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  return weights[priority];
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
  );
}

export function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status);
}

export function getTaskCompletionPercentage(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.status === 'done').length;
  return Math.round((completed / tasks.length) * 100);
}

export function generateTaskReport(tasks: Task[]): TaskReport {
  return {
    total: tasks.length,
    byStatus: {
      backlog: filterTasksByStatus(tasks, 'backlog').length,
      in_progress: filterTasksByStatus(tasks, 'in_progress').length,
      review: filterTasksByStatus(tasks, 'review').length,
      done: filterTasksByStatus(tasks, 'done').length,
    },
    byPriority: {
      low: tasks.filter((t) => t.priority === 'low').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      high: tasks.filter((t) => t.priority === 'high').length,
      critical: tasks.filter((t) => t.priority === 'critical').length,
    },
    completionRate: getTaskCompletionPercentage(tasks),
    averageAge: calculateAverageTaskAge(tasks),
  };
}

export function calculateAverageTaskAge(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const totalAge = tasks.reduce((sum, task) => sum + calculateTaskAge(task.createdAt), 0);
  return Math.round(totalAge / tasks.length);
}

export interface TaskReport {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  completionRate: number;
  averageAge: number;
}

export function isTaskOverdue(task: Task, maxDays: number = 7): boolean {
  if (task.status === 'done') return false;
  return calculateTaskAge(task.createdAt) > maxDays;
}

export function getOverdueTasks(tasks: Task[], maxDays: number = 7): Task[] {
  return tasks.filter((task) => isTaskOverdue(task, maxDays));
}

export function exportTasksToCSV(tasks: Task[]): string {
  const headers = ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Created', 'Updated'];
  const rows = tasks.map((t) => [
    t.id,
    t.title,
    t.status,
    t.priority,
    t.assignee || '',
    formatDate(t.createdAt),
    formatDate(t.updatedAt),
  ]);
  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function parseTasksFromCSV(csv: string): Partial<Task>[] {
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const task: Partial<Task> = {};
    headers.forEach((header, index) => {
      const key = header.toLowerCase() as keyof Task;
      if (key === 'title' || key === 'status' || key === 'priority' || key === 'assignee') {
        (task as Record<string, string>)[key] = values[index];
      }
    });
    return task;
  });
}

