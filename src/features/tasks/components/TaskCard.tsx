/**
 * TaskCard Component - Presentational component
 * Displays individual task with actions
 */

import type { Task, TaskStatus, TaskPriority } from '../types';

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onSelect: (task: Task) => void;
}

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'priority-low' },
  medium: { label: 'Medium', className: 'priority-medium' },
  high: { label: 'High', className: 'priority-high' },
  critical: { label: 'Critical', className: 'priority-critical' },
};

const statusFlow: TaskStatus[] = ['backlog', 'in_progress', 'review', 'done'];

export function TaskCard({ task, onMove, onDelete, onSelect }: TaskCardProps) {
  const currentIndex = statusFlow.indexOf(task.status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < statusFlow.length - 1;

  const handleMoveLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveLeft) {
      onMove(task.id, statusFlow[currentIndex - 1]);
    }
  };

  const handleMoveRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canMoveRight) {
      onMove(task.id, statusFlow[currentIndex + 1]);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  return (
    <article 
      className="task-card"
      onClick={() => onSelect(task)}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}`}
    >
      <div className="task-card-header">
        <span className={`task-priority ${priorityConfig[task.priority].className}`}>
          {priorityConfig[task.priority].label}
        </span>
        <button 
          className="task-delete-btn"
          onClick={handleDelete}
          aria-label="Delete task"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <h3 className="task-title">{task.title}</h3>
      
      <p className="task-description">{task.description}</p>

      {task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map(tag => (
            <span key={tag} className="task-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="task-footer">
        {task.assignee && (
          <div className="task-assignee">
            <div className="assignee-avatar">
              {task.assignee.charAt(0).toUpperCase()}
            </div>
            <span className="assignee-name">{task.assignee}</span>
          </div>
        )}

        <div className="task-actions">
          <button
            className="task-move-btn"
            onClick={handleMoveLeft}
            disabled={!canMoveLeft}
            aria-label="Move to previous column"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className="task-move-btn"
            onClick={handleMoveRight}
            disabled={!canMoveRight}
            aria-label="Move to next column"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

