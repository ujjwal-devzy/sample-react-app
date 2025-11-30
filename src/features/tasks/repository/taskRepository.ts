/**
 * Task Repository - Implements Repository Pattern
 * Abstracts data access layer from business logic
 * Can be easily swapped for API calls in production
 */

import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from '../types';
import { formatDate, validateTask, TaskValidationError } from '../../../shared/utils/taskUtils';

const STORAGE_KEY = 'kanban_tasks';

// Generate unique ID
const generateId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Initial seed data for demo
const SEED_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Design new landing page',
    description: 'Create wireframes and mockups for the new marketing landing page',
    status: 'backlog',
    priority: 'high',
    assignee: 'Alice',
    tags: ['design', 'marketing'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'task_2',
    title: 'Implement authentication flow',
    description: 'Set up OAuth2 with Google and GitHub providers',
    status: 'in_progress',
    priority: 'critical',
    assignee: 'Bob',
    tags: ['backend', 'security'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: 'task_3',
    title: 'Write unit tests for API',
    description: 'Achieve 80% code coverage on all API endpoints',
    status: 'review',
    priority: 'medium',
    assignee: 'Charlie',
    tags: ['testing', 'backend'],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-19'),
  },
  {
    id: 'task_4',
    title: 'Update documentation',
    description: 'Refresh README and API docs with latest changes',
    status: 'done',
    priority: 'low',
    assignee: 'Dana',
    tags: ['docs'],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16'),
  },
  {
    id: 'task_5',
    title: 'Performance optimization',
    description: 'Reduce bundle size and improve load times',
    status: 'backlog',
    priority: 'medium',
    tags: ['performance', 'frontend'],
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
  },
  {
    id: 'task_6',
    title: 'Mobile responsive fixes',
    description: 'Fix layout issues on smaller screens',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Alice',
    tags: ['frontend', 'mobile'],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-20'),
  },
];

const serializeTasks = (tasks: Task[]): string => {
  return JSON.stringify(tasks, (key, value) => {
    if (key === 'createdAt' || key === 'updatedAt') {
      return value instanceof Date ? value.toISOString() : value;
    }
    return value;
  });
};

const deserializeTasks = (json: string): Task[] => {
  return JSON.parse(json, (key, value) => {
    if (key === 'createdAt' || key === 'updatedAt') {
      return new Date(value);
    }
    return value;
  });
};

/**
 * TaskRepository class - Single Responsibility for data operations
 */
class TaskRepository {
  private getStoredTasks(): Task[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with seed data
      this.saveTasks(SEED_TASKS);
      return SEED_TASKS;
    }
    return deserializeTasks(stored);
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEY, serializeTasks(tasks));
  }

  // Read operations
  findAll(): Task[] {
    return this.getStoredTasks();
  }

  findById(id: string): Task | undefined {
    return this.getStoredTasks().find(task => task.id === id);
  }

  findByStatus(status: TaskStatus): Task[] {
    return this.getStoredTasks().filter(task => task.status === status);
  }

  create(dto: CreateTaskDTO): Task {
    validateTask({ title: dto.title });
    
    const tasks = this.getStoredTasks();
    const now = new Date();
    
    const newTask: Task = {
      id: generateId(),
      title: dto.title,
      description: dto.description,
      status: 'backlog',
      priority: dto.priority,
      assignee: dto.assignee,
      tags: dto.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  getFormattedDate(task: Task): string {
    return formatDate(task.updatedAt);
  }

  update(id: string, dto: UpdateTaskDTO): Task | null {
    const tasks = this.getStoredTasks();
    const index = tasks.findIndex(task => task.id === id);
    
    if (index === -1) return null;

    const updatedTask: Task = {
      ...tasks[index],
      ...dto,
      updatedAt: new Date(),
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  }

  delete(id: string): boolean {
    const tasks = this.getStoredTasks();
    const filtered = tasks.filter(task => task.id !== id);
    
    if (filtered.length === tasks.length) return false;
    
    this.saveTasks(filtered);
    return true;
  }

  // Bulk operations
  moveTask(taskId: string, newStatus: TaskStatus): Task | null {
    return this.update(taskId, { status: newStatus });
  }

  // Reset to seed data
  reset(): Task[] {
    this.saveTasks(SEED_TASKS);
    return SEED_TASKS;
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();

