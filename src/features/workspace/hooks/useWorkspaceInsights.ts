import { useMemo } from 'react';
import { useAuth } from '../../auth';
import { useProjects } from '../../projects';
import { useTasks } from '../../tasks';

type WorkspaceInsights = {
  isLoading: boolean;
  hasData: boolean;
  userName: string;
  userRole: string | null;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  taskCompletionRate: number;
  tasksAssignedToUser: number;
  taskCounts: {
    backlog: number;
    inProgress: number;
    review: number;
    done: number;
  };
  suggestedFocusProjectId: string | null;
  suggestedFocusProjectName: string | null;
  focusScore: number;
  focusRecommendation: string;
};

export function useWorkspaceInsights(): WorkspaceInsights {
  const { state: authState } = useAuth();
  const { projects, currentProject, isLoading: projectsLoading } = useProjects();
  const { tasks, stats, isLoading: tasksLoading } = useTasks();

  const derived = useMemo(() => {
    const user = authState.user;
    const userName = user?.displayName ?? 'Guest';
    const userRole = user?.role ?? null;

    const totalProjects = projects.length;
    const activeProjects = projects.filter(project => project.status === 'active').length;
    const completedProjects = projects.filter(project => project.status === 'completed').length;

    const taskCounts = {
      backlog: stats.backlog,
      inProgress: stats.inProgress,
      review: stats.review,
      done: stats.done,
    };

    const tasksAssignedToUser = user
      ? tasks.filter(task => {
          if (!task.assignee) {
            return false;
          }
          const assignee = task.assignee.toLowerCase();
          const displayName = user.displayName.toLowerCase();
          const username = user.username.toLowerCase();
          return assignee === displayName || assignee === username || assignee === user.email.toLowerCase();
        }).length
      : 0;

    const suggestedFocusProject =
      currentProject ||
      projects.find(project => project.status === 'active') ||
      projects.find(project => project.status === 'planning') ||
      projects[0] ||
      null;

    const baseScore = stats.completionRate;
    const assignmentBoost = tasksAssignedToUser > 0 ? 10 : 0;
    const workloadPenalty = activeProjects > 3 ? 10 : 0;
    const clampedScore = Math.max(0, Math.min(100, baseScore + assignmentBoost - workloadPenalty));

    let focusRecommendation = 'Focus on maintaining steady progress across your projects.';
    if (clampedScore < 40) {
      focusRecommendation = 'Reduce work in progress and complete a small set of tasks first.';
    } else if (clampedScore < 70) {
      focusRecommendation = 'Close out tasks that are nearest to completion before starting new work.';
    } else if (clampedScore >= 85 && completedProjects > 0) {
      focusRecommendation = 'Shift attention to higher impact projects while keeping momentum on current work.';
    }

    return {
      userName,
      userRole,
      totalProjects,
      activeProjects,
      completedProjects,
      taskCompletionRate: stats.completionRate,
      tasksAssignedToUser,
      taskCounts,
      suggestedFocusProjectId: suggestedFocusProject ? suggestedFocusProject.id : null,
      suggestedFocusProjectName: suggestedFocusProject ? suggestedFocusProject.name : null,
      focusScore: clampedScore,
      focusRecommendation,
    };
  }, [authState.user, projects, currentProject, stats, tasks]);

  const isLoading = tasksLoading || projectsLoading || !authState.isInitialized;
  const hasData = !!authState.user && projects.length > 0;

  return {
    isLoading,
    hasData,
    userName: derived.userName,
    userRole: derived.userRole,
    totalProjects: derived.totalProjects,
    activeProjects: derived.activeProjects,
    completedProjects: derived.completedProjects,
    taskCompletionRate: derived.taskCompletionRate,
    tasksAssignedToUser: derived.tasksAssignedToUser,
    taskCounts: derived.taskCounts,
    suggestedFocusProjectId: derived.suggestedFocusProjectId,
    suggestedFocusProjectName: derived.suggestedFocusProjectName,
    focusScore: derived.focusScore,
    focusRecommendation: derived.focusRecommendation,
  };
}
