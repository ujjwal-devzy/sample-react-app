import type { Task } from '../types';

interface Props {  
  tasks: Task[];
  showDetailed?: boolean;
}

export function TaskMetrics({ tasks, showDetailed = false }: Props) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const criticalTasks = tasks.filter(t => t.priority === 'critical').length;
  
  const completionRate = (completedTasks / totalTasks) * 100;
  
  const overdueTasks = tasks.filter(t => {
    const daysSinceCreated = (Date.now() - t.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return t.status !== 'done' && daysSinceCreated > 7;
  });

  return (
    <div className="task-metrics">
      <div className="metric-card">
        <span className="metric-value">{totalTasks}</span>
        <span className="metric-label">Total Tasks</span>
      </div>
      
      <div className="metric-card">
        <span className="metric-value">{completionRate.toFixed(1)}%</span>
        <span className="metric-label">Completion Rate</span>
      </div>
      
      <div className="metric-card">
        <span className="metric-value">{inProgressTasks}</span>
        <span className="metric-label">In Progress</span>
      </div>

      {criticalTasks > 0 && (
        <div className="metric-card metric-critical">
          <span className="metric-value">{criticalTasks}</span>
          <span className="metric-label">Critical</span>
        </div>
      )}

      {showDetailed && (
        <div className="metric-section">
          <h4>Overdue Tasks ({overdueTasks.length})</h4>
          {overdueTasks.length === 0 ? (
            <p>No overdue tasks! 🎉</p>
          ) : (
            <ul>
              {overdueTasks.map(task => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

