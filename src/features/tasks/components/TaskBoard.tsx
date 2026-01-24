/**
 * TaskBoard Component - Main container component
 * Orchestrates the Kanban board UI
 */

import { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { useKeyboardShortcuts } from '../../../core/hooks/useKeyboardShortcut';
import { TaskColumn } from './TaskColumn';
import { AddTaskModal } from './AddTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { Button, SearchInput, Select, Badge } from '../../../shared/components';
import type { TaskStatus, TaskPriority } from '../types';

export function TaskBoard() {
  const { 
    tasks,
    columns: allColumns, 
    stats, 
    isLoading,
    error,
    selectedTask,
    createTask, 
    moveTask, 
    deleteTask,
    updateTask,
    selectTask,
    resetTasks,
    clearError,
  } = useTasks();

  const {
    filters,
    filteredTasks,
    updateFilter,
    resetFilters,
    availableAssignees,
    availableTags,
    activeFilterCount,
  } = useTaskFilters(tasks);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const columns = useMemo(() => {
    return allColumns.map(column => ({
      ...column,
      tasks: filteredTasks.filter(task => task.status === column.id),
    }));
  }, [allColumns, filteredTasks]);

  useKeyboardShortcuts({
    'mod+k': () => {
      const searchInput = document.querySelector<HTMLInputElement>('.task-board-search input');
      searchInput?.focus();
    },
    'mod+n': (e) => {
      e.preventDefault();
      setIsAddModalOpen(true);
    },
    'escape': () => {
      if (isAddModalOpen) {
        setIsAddModalOpen(false);
      } else if (selectedTask) {
        selectTask(null);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="board-loading">
        <div className="loading-spinner" />
        <span>Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="task-board">
      {error && (
        <div className="board-error" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
          <button
            className="board-error-dismiss"
            onClick={clearError}
            aria-label="Dismiss error"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <header className="board-header">
        <div className="board-title-section">
          <h1 className="board-title">
            <span className="title-icon">📋</span>
            Task Board
          </h1>
          <p className="board-subtitle">Organize and track your work efficiently</p>
        </div>

        <div className="board-actions">
          <Button variant="ghost" onClick={resetTasks}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Task
          </Button>
        </div>
      </header>

      <div className="board-filters">
        <div className="board-search">
          <SearchInput
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
            placeholder="Search tasks... (⌘K)"
            className="task-board-search"
          />
        </div>
        <div className="board-filter-controls">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="primary" className="filter-badge">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Clear
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="board-filters-panel">
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <Select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value as TaskStatus | 'all')}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'backlog', label: 'Backlog' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'review', label: 'Review' },
                { value: 'done', label: 'Done' },
              ]}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <Select
              value={filters.priority}
              onChange={(e) => updateFilter('priority', e.target.value as TaskPriority | 'all')}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Assignee</label>
            <Select
              value={filters.assignee}
              onChange={(e) => updateFilter('assignee', e.target.value)}
              options={[
                { value: 'all', label: 'All Assignees' },
                ...availableAssignees.map(assignee => ({ value: assignee, label: assignee })),
              ]}
            />
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="board-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-item">
          <span className="stat-value stat-in-progress">{stats.inProgress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-item">
          <span className="stat-value stat-done">{stats.done}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <div className="stat-progress">
            <div 
              className="stat-progress-bar" 
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <span className="stat-label">{stats.completionRate}% Complete</span>
        </div>
      </div>

      {/* Columns */}
      <div className="board-columns">
        {columns.map((column) => (
          <TaskColumn
            key={column.id}
            column={column}
            onMoveTask={moveTask}
            onDeleteTask={deleteTask}
            onSelectTask={selectTask}
          />
        ))}
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={createTask}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => selectTask(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </div>
  );
}

