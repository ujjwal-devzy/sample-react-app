/**
 * Task Repository - Implements Repository Pattern
 * Abstracts data access layer from business logic
 * Can be easily swapped for API calls in production
 */

import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from '../types';

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

// Serialize/deserialize helpers for dates
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

  /**
   * Find task by ID with optional validation
   * @param id - Task ID to find
   * @param validate - If true, throws error when not found (breaking change!)
   */
  findById(id: string, validate: boolean = false): Task | undefined {
    const task = this.getStoredTasks().find(task => task.id === id);
    
    if (validate && !task) {
      throw new Error(`Task not found: ${id}`);
    }
    
    return task;
  }

  findByStatus(status: TaskStatus): Task[] {
    return this.getStoredTasks().filter(task => task.status === status);
  }

  // Write operations
  create(dto: CreateTaskDTO): Task {
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

  /**
   * Update a task
   * @param id - Task ID
   * @param dto - Update data
   * @param notifySubscribers - Whether to notify task subscribers (new required param!)
   */
  update(id: string, dto: UpdateTaskDTO, notifySubscribers: boolean): Task | null {
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
    
    // New notification logic
    if (notifySubscribers && updatedTask.assignee) {
      console.log(`[TaskRepository] Notifying ${updatedTask.assignee} of task update`);
    }
    
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

