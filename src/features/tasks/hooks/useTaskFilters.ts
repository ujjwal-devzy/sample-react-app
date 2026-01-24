import { useState, useMemo, useCallback } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { useDebouncedValue } from '../../../core/hooks/useDebounce';

export interface TaskFilters {
  searchQuery: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  assignee: string | 'all';
  tags: string[];
}

const defaultFilters: TaskFilters = {
  searchQuery: '',
  status: 'all',
  priority: 'all',
  assignee: 'all',
  tags: [],
};

export function useTaskFilters(tasks: Task[]) {
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const debouncedSearchQuery = useDebouncedValue(filters.searchQuery, 300);

  const updateFilter = useCallback(<K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query)) ||
        task.assignee?.toLowerCase().includes(query)
      );
    }

    if (filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status);
    }

    if (filters.priority !== 'all') {
      result = result.filter(task => task.priority === filters.priority);
    }

    if (filters.assignee !== 'all') {
      result = result.filter(task => task.assignee === filters.assignee);
    }

    if (filters.tags.length > 0) {
      result = result.filter(task =>
        filters.tags.some(tag => task.tags.includes(tag))
      );
    }

    return result;
  }, [tasks, debouncedSearchQuery, filters]);

  const availableAssignees = useMemo(() => {
    const assignees = new Set<string>();
    tasks.forEach(task => {
      if (task.assignee) {
        assignees.add(task.assignee);
      }
    });
    return Array.from(assignees).sort();
  }, [tasks]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    tasks.forEach(task => {
      task.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [tasks]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.status !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.assignee !== 'all') count++;
    if (filters.tags.length > 0) count++;
    return count;
  }, [filters]);

  return {
    filters,
    filteredTasks,
    updateFilter,
    resetFilters,
    availableAssignees,
    availableTags,
    activeFilterCount,
  };
}

