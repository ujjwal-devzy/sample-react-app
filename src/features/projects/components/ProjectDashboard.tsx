/**
 * Project Dashboard Component
 * Overview of a single project with stats and activity
 */

import { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { Button } from '../../../shared/components';
import { formatRelativeTime, formatDate } from '../../../core/utils/date';
import { getInitials } from '../../../core/utils/string';
import type { ProjectStats, ProjectActivity } from '../types';
import { projectService } from '../services/projectService';

interface ProjectDashboardProps {
  projectId: string;
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const { currentProject, loadProject, loadProjectStats } = useProjects();
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [activity, setActivity] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Load project data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await loadProject(projectId);
        const [statsData, activityData] = await Promise.all([
          loadProjectStats(projectId),
          projectService.getProjectActivity(projectId, 10),
        ]);
        setStats(statsData);
        setActivity(activityData);
      } catch (error) {
        console.error('Failed to load project data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  if (loading || !currentProject) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading project...</span>
      </div>
    );
  }

  const progressColor = currentProject.progress >= 80 
    ? 'var(--color-neon-green)' 
    : currentProject.progress >= 50 
      ? 'var(--color-neon-cyan)' 
      : 'var(--color-neon-purple)';

  return (
    <div className="project-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="project-info">
          <div 
            className="project-icon-large"
            style={{ 
              backgroundColor: `${currentProject.color}20`,
              color: currentProject.color,
            }}
          >
            {currentProject.iconEmoji}
          </div>
          <div className="project-details">
            <div className="project-title-row">
              <h1 className="project-title">{currentProject.name}</h1>
              <span className="project-key-badge">{currentProject.key}</span>
            </div>
            {currentProject.description && (
              <p className="project-description">{currentProject.description}</p>
            )}
            <div className="project-meta">
              {currentProject.startDate && (
                <span className="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Started {formatDate(currentProject.startDate, { dateStyle: 'medium' })}
                </span>
              )}
              {currentProject.targetDate && (
                <span className="meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Due {formatDate(currentProject.targetDate, { dateStyle: 'medium' })}
                </span>
              )}
              <span className="meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
                {currentProject.memberIds.length} members
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <Button variant="secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </Button>
          <Button>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Task
          </Button>
        </div>
      </header>

      {/* Progress Section */}
      <div className="progress-section">
        <div className="progress-card main-progress">
          <div className="progress-header">
            <span className="progress-title">Overall Progress</span>
            <span className="progress-percentage" style={{ color: progressColor }}>
              {currentProject.progress}%
            </span>
          </div>
          <div className="progress-bar large">
            <div 
              className="progress-fill"
              style={{ 
                width: `${currentProject.progress}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
          <div className="progress-details">
            <span>{currentProject.completedTaskCount} of {currentProject.taskCount} tasks completed</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon tasks">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalTasks}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon completed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.completedTasks}</span>
              <span className="stat-label">Completed</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon in-progress">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.inProgressTasks}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon overdue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.overdueTasks}</span>
              <span className="stat-label">Overdue</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon members">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalMembers}</span>
              <span className="stat-label">Members</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon comments">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalComments}</span>
              <span className="stat-label">Comments</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="quick-stats-row">
          <div className="quick-stat">
            <span className="quick-stat-label">Completed this week</span>
            <span className="quick-stat-value positive">+{stats.tasksCompletedThisWeek}</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-label">Created this week</span>
            <span className="quick-stat-value">+{stats.tasksCreatedThisWeek}</span>
          </div>
          <div className="quick-stat">
            <span className="quick-stat-label">Avg. task duration</span>
            <span className="quick-stat-value">{stats.averageTaskDuration.toFixed(1)} days</span>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      <div className="activity-section">
        <div className="section-header">
          <h2 className="section-title">Recent Activity</h2>
          <Button variant="ghost" size="sm">View all</Button>
        </div>

        <div className="activity-feed">
          {activity.length === 0 ? (
            <div className="empty-activity">
              <p>No recent activity</p>
            </div>
          ) : (
            activity.map(item => (
              <div key={item.id} className="activity-item">
                <div className="activity-avatar">
                  {getInitials(`User ${item.userId.slice(-3)}`)}
                </div>
                <div className="activity-content">
                  <p className="activity-description">{item.description}</p>
                  <span className="activity-time">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <div className="section-header">
          <h2 className="section-title">Team Members</h2>
          <Button variant="ghost" size="sm">Manage team</Button>
        </div>

        <div className="team-grid">
          {currentProject.memberIds.slice(0, 6).map((memberId, index) => (
            <div key={memberId} className="team-member">
              <div className="member-avatar large">
                {getInitials(`User ${index + 1}`)}
              </div>
              <span className="member-name">User {index + 1}</span>
              <span className="member-role">
                {index === 0 ? 'Owner' : index < 2 ? 'Admin' : 'Member'}
              </span>
            </div>
          ))}
          {currentProject.memberIds.length > 6 && (
            <div className="team-member more">
              <div className="member-avatar large">
                +{currentProject.memberIds.length - 6}
              </div>
              <span className="member-name">More</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

