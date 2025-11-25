/**
 * TaskColumn Component - Container for tasks of a specific status
 * Implements composition pattern
 */

import type { TaskColumn as TaskColumnType, Task, TaskStatus } from '../types';
import { TaskCard } from './TaskCard';

interface TaskColumnProps {
  column: TaskColumnType;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
}

export function TaskColumn({ column, onMoveTask, onDeleteTask, onSelectTask }: TaskColumnProps) {
  return (
    <section className="task-column" aria-label={`${column.title} tasks`}>
      <header className="column-header" style={{ '--column-color': column.color } as React.CSSProperties}>
        <div className="column-indicator" />
        <h2 className="column-title">{column.title}</h2>
        <span className="column-count">{column.tasks.length}</span>
      </header>

      <div className="column-tasks">
        {column.tasks.length === 0 ? (
          <div className="column-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 9h6M9 13h4" />
            </svg>
            <span>No tasks yet</span>
          </div>
        ) : (
          column.tasks.map((task, index) => (
            <div 
              key={task.id} 
              className="task-card-wrapper"
              style={{ '--animation-delay': `${index * 0.05}s` } as React.CSSProperties}
            >
              <TaskCard
                task={task}
                onMove={onMoveTask}
                onDelete={onDeleteTask}
                onSelect={onSelectTask}
              />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

