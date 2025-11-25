/**
 * TaskBoard Component - Main container component
 * Orchestrates the Kanban board UI
 */

import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { TaskColumn } from './TaskColumn';
import { AddTaskModal } from './AddTaskModal';
import { TaskDetailModal } from './TaskDetailModal';
import { Button } from '../../../shared/components';

export function TaskBoard() {
  const { 
    columns, 
    stats, 
    isLoading, 
    selectedTask,
    createTask, 
    moveTask, 
    deleteTask,
    updateTask,
    selectTask,
    resetTasks,
  } = useTasks();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
      {/* Header */}
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

