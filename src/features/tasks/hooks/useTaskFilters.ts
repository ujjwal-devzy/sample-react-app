import { useState, useCallback } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../types';

interface FilterCriteria {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  searchQuery?: string;
}

export function useTaskFilters(tasks: Task[]) {
  const [criteria, setCriteria] = useState<FilterCriteria>({});

  const setStatusFilter = useCallback((status?: TaskStatus) => {
    setCriteria(prev => ({ ...prev, status }));
  }, []);

  const setPriorityFilter = useCallback((priority?: TaskPriority) => {
    setCriteria(prev => ({ ...prev, priority }));
  }, []);

  const setAssigneeFilter = useCallback((assignee?: string) => {
    setCriteria(prev => ({ ...prev, assignee }));
  }, []);

  const setSearchQuery = useCallback((searchQuery?: string) => {
    setCriteria(prev => ({ ...prev, searchQuery }));
  }, []);

  const clearFilters = useCallback(() => {
    setCriteria({});
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (criteria.status && task.status !== criteria.status) {
      return false;
    }
    if (criteria.priority && task.priority !== criteria.priority) {
      return false;
    }
    if (criteria.assignee && task.assignee !== criteria.assignee) {
      return false;
    }
    if (criteria.searchQuery) {
      const query = criteria.searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDesc = task.description.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDesc) {
        return false;
      }
    }
    return true;
  });

  return {
    filteredTasks,
    criteria,
    setStatusFilter,
    setPriorityFilter,
    setAssigneeFilter,
    setSearchQuery,
    clearFilters,
    hasActiveFilters: Object.values(criteria).some(v => v !== undefined && v !== ''),
  };
}

