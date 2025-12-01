/**
 * Project Card Component
 * Displays project information in a card format
 */

import { useMemo } from 'react';
import type { Project } from '../../../core/types';
import { formatRelativeTime } from '../../../core/utils/date';
import { getInitials } from '../../../core/utils/string';

interface ProjectCardProps {
  project: Project;
  isFavorite?: boolean;
  onClick?: () => void;
  onFavoriteToggle?: () => void;
  onMenuClick?: (action: string) => void;
}

export function ProjectCard({
  project,
  isFavorite = false,
  onClick,
  onFavoriteToggle,
  onMenuClick,
}: ProjectCardProps) {
  const progressColor = useMemo(() => {
    if (project.progress >= 80) return 'var(--color-neon-green)';
    if (project.progress >= 50) return 'var(--color-neon-cyan)';
    if (project.progress >= 25) return 'var(--color-neon-orange)';
    return 'var(--color-neon-purple)';
  }, [project.progress]);

  const statusConfig = {
    planning: { label: 'Planning', color: '#6366f1' },
    active: { label: 'Active', color: '#10b981' },
    on_hold: { label: 'On Hold', color: '#f59e0b' },
    completed: { label: 'Completed', color: '#22c55e' },
    archived: { label: 'Archived', color: '#6b7280' },
  };

  const priorityConfig = {
    low: { label: 'Low', color: '#10b981' },
    medium: { label: 'Medium', color: '#f59e0b' },
    high: { label: 'High', color: '#f97316' },
    critical: { label: 'Critical', color: '#ef4444' },
  };

  const status = statusConfig[project.status];
  const priority = priorityConfig[project.priority];

  return (
    <div 
      className="project-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Card Header */}
      <div className="project-card-header">
        <div 
          className="project-icon"
          style={{ backgroundColor: `${project.color}20`, color: project.color }}
        >
          {project.iconEmoji || getInitials(project.name)}
        </div>
        
        <div className="project-card-actions">
          <button
            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.();
            }}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill={isFavorite ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
          
          <button
            className="menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick?.('menu');
            }}
            aria-label="Project options"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="6" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="project-card-content">
        <h3 className="project-name">{project.name}</h3>
        <span className="project-key">{project.key}</span>
        
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="project-tags">
            {project.tags.slice(0, 3).map(tag => (
              <span key={tag} className="project-tag">
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="project-tag-more">+{project.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="project-progress">
          <div className="progress-header">
            <span className="progress-label">Progress</span>
            <span className="progress-value">{project.progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${project.progress}%`,
                backgroundColor: progressColor,
              }}
            />
          </div>
          <div className="progress-stats">
            <span>{project.completedTaskCount} of {project.taskCount} tasks</span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="project-card-footer">
        <div className="project-meta">
          <span 
            className="status-badge"
            style={{ 
              backgroundColor: `${status.color}15`,
              color: status.color,
            }}
          >
            {status.label}
          </span>
          <span 
            className="priority-badge"
            style={{ 
              backgroundColor: `${priority.color}15`,
              color: priority.color,
            }}
          >
            {priority.label}
          </span>
        </div>

        <div className="project-info">
          <div className="member-avatars">
            {project.memberIds.slice(0, 3).map((memberId, index) => (
              <div 
                key={memberId} 
                className="member-avatar"
                style={{ zIndex: 3 - index }}
              >
                {getInitials(`User ${index + 1}`)}
              </div>
            ))}
            {project.memberIds.length > 3 && (
              <div className="member-avatar more">
                +{project.memberIds.length - 3}
              </div>
            )}
          </div>
          <span className="updated-at">
            {formatRelativeTime(project.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

