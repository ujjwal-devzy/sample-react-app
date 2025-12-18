import { useWorkspaceInsights } from '../hooks/useWorkspaceInsights';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { ProgressRing } from '../../../shared/components/Progress';

export function WorkspaceInsights() {
  const {
    isLoading,
    hasData,
    userName,
    userRole,
    totalProjects,
    activeProjects,
    completedProjects,
    taskCompletionRate,
    tasksAssignedToUser,
    taskCounts,
    suggestedFocusProjectName,
    focusScore,
    focusRecommendation,
  } = useWorkspaceInsights();

  if (isLoading && !hasData) {
    return (
      <div className="workspace-insights">
        <Card>
          <CardHeader>
            <CardTitle>Workspace insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="workspace-insights-loading">Preparing your workspace overview</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="workspace-insights">
        <Card>
          <CardHeader>
            <CardTitle>Workspace insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="workspace-insights-empty">Sign in and open a few projects to see personalized insights here.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="workspace-insights">
      <div className="workspace-insights-grid">
        <Card>
          <CardHeader>
            <CardTitle>Focus summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="workspace-focus-header">
              <div className="workspace-focus-user">
                <div className="workspace-focus-name">{userName}</div>
                {userRole && (
                  <Badge>{userRole}</Badge>
                )}
              </div>
              <div className="workspace-focus-score">
                <ProgressRing value={focusScore} size={80} strokeWidth={8} label="Focus" />
              </div>
            </div>
            <p className="workspace-focus-text">{focusRecommendation}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="workspace-metrics-row">
              <div className="workspace-metric">
                <span className="workspace-metric-label">Total</span>
                <span className="workspace-metric-value">{totalProjects}</span>
              </div>
              <div className="workspace-metric">
                <span className="workspace-metric-label">Active</span>
                <span className="workspace-metric-value">{activeProjects}</span>
              </div>
              <div className="workspace-metric">
                <span className="workspace-metric-label">Completed</span>
                <span className="workspace-metric-value">{completedProjects}</span>
              </div>
            </div>
            <div className="workspace-highlight">
              <span className="workspace-highlight-label">Suggested focus project</span>
              <span className="workspace-highlight-value">{suggestedFocusProjectName ?? 'No project selected'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="workspace-metrics-row">
              <div className="workspace-metric">
                <span className="workspace-metric-label">Completion rate</span>
                <span className="workspace-metric-value">{taskCompletionRate}%</span>
              </div>
              <div className="workspace-metric">
                <span className="workspace-metric-label">Assigned to you</span>
                <span className="workspace-metric-value">{tasksAssignedToUser}</span>
              </div>
            </div>
            <div className="workspace-task-breakdown">
              <div className="workspace-task-item">
                <span className="workspace-task-label">Backlog</span>
                <span className="workspace-task-value">{taskCounts.backlog}</span>
              </div>
              <div className="workspace-task-item">
                <span className="workspace-task-label">In progress</span>
                <span className="workspace-task-value">{taskCounts.inProgress}</span>
              </div>
              <div className="workspace-task-item">
                <span className="workspace-task-label">Review</span>
                <span className="workspace-task-value">{taskCounts.review}</span>
              </div>
              <div className="workspace-task-item">
                <span className="workspace-task-label">Done</span>
                <span className="workspace-task-value">{taskCounts.done}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
