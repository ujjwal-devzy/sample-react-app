/**
 * Custom Hook - useTaskFilters
 * Provides task filtering functionality
 * 
 * NOTE: This hook has intentional pattern deviations for testing
 */

import { useState, useCallback } from 'react';
import type { Task, TaskStatus, TaskPriority } from '../types';

// Different interface style than useTasks (not using context pattern)
interface FilterCriteria {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee?: string;
  searchQuery?: string;
}

// Missing memoization pattern that useTasks uses
export function useTaskFilters(tasks: Task[]) {
  const [criteria, setCriteria] = useState<FilterCriteria>({});

  // Using useCallback but inconsistent with useTasks which doesn't wrap actions
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

  // No useMemo for filtered tasks (unlike useTasks columns pattern)
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
      // Missing tag search that might be expected
      if (!matchesTitle && !matchesDesc) {
        return false;
      }
    }
    return true;
  });

  // Missing stats calculation that useTasks has
  return {
    filteredTasks,
    criteria,
    setStatusFilter,
    setPriorityFilter,
    setAssigneeFilter,
    setSearchQuery,
    clearFilters,
    // Missing isFiltered flag
    hasActiveFilters: Object.values(criteria).some(v => v !== undefined && v !== ''),
  };
}

