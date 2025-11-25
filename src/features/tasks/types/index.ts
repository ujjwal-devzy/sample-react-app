// Task domain types - single source of truth for task-related types

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

export interface CreateTaskDTO {
  title: string;
  description: string;
  priority: TaskPriority;
  assignee?: string;
  tags?: string[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  tags?: string[];
}

// Column configuration
export const COLUMNS_CONFIG: Record<TaskStatus, { title: string; color: string }> = {
  backlog: { title: 'Backlog', color: '#6366f1' },
  in_progress: { title: 'In Progress', color: '#f59e0b' },
  review: { title: 'Review', color: '#8b5cf6' },
  done: { title: 'Done', color: '#10b981' },
};

