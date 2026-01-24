/**
 * Custom Hook - useTasks
 * Facade pattern: provides simplified interface to task operations
 * Abstracts Context complexity from components
 */

import { useEffect, useMemo } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { COLUMNS_CONFIG, type TaskStatus, type TaskColumn, type TaskPriority } from '../types';

const priorityOrder: Record<TaskPriority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function useTasks() {
  const { state, actions } = useTaskContext();

  useEffect(() => {
    actions.loadTasks();
  }, [actions]);

  const columns: TaskColumn[] = useMemo(() => {
    const statusOrder: TaskStatus[] = ['backlog', 'in_progress', 'review', 'done'];
    
    return statusOrder.map(status => ({
      id: status,
      title: COLUMNS_CONFIG[status].title,
      color: COLUMNS_CONFIG[status].color,
      tasks: state.tasks
        .filter(task => task.status === status)
        .sort((a, b) => {
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        }),
    }));
  }, [state.tasks]);

  // Task stats
  const stats = useMemo(() => ({
    total: state.tasks.length,
    backlog: state.tasks.filter(t => t.status === 'backlog').length,
    inProgress: state.tasks.filter(t => t.status === 'in_progress').length,
    review: state.tasks.filter(t => t.status === 'review').length,
    done: state.tasks.filter(t => t.status === 'done').length,
    completionRate: state.tasks.length > 0 
      ? Math.round((state.tasks.filter(t => t.status === 'done').length / state.tasks.length) * 100)
      : 0,
  }), [state.tasks]);

  return {
    tasks: state.tasks,
    columns,
    stats,
    isLoading: state.isLoading,
    error: state.error,
    selectedTask: state.selectedTask,
    clearError: actions.clearError,
    ...actions,
  };
}

