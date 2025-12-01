/**
 * Project List Component
 * Displays a grid or list of projects
 */

import { useState, useEffect, useMemo } from 'react';
import { useProjects } from '../context/ProjectContext';
import { ProjectCard } from './ProjectCard';
import { CreateProjectModal } from './CreateProjectModal';
import { useDisclosure } from '../../../core/hooks/useDisclosure';
import { useDebouncedValue } from '../../../core/hooks/useDebounce';
import { Button } from '../../../shared/components';
import type { ProjectStatus, ProjectPriority } from '../../../core/types';
import type { ProjectFiltersState } from '../types';

type ViewMode = 'grid' | 'list';

const initialFilters: ProjectFiltersState = {
  status: [],
  visibility: [],
  priority: [],
  teamId: null,
  search: '',
  tags: [],
  sortBy: 'updatedAt',
  sortDirection: 'desc',
};

export function ProjectList() {
  const { projects, isLoading, error, loadProjects, toggleFavorite } = useProjects();
  const createModal = useDisclosure();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<ProjectFiltersState>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebouncedValue(filters.search, 300);

  // Load projects on mount and when filters change
  useEffect(() => {
    loadProjects({
      status: filters.status.length > 0 ? filters.status : undefined,
      priority: filters.priority.length > 0 ? filters.priority : undefined,
      search: debouncedSearch || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
    });
  }, [loadProjects, filters.status, filters.priority, filters.tags, debouncedSearch]);

  // Sort and filter projects
  const filteredProjects = useMemo(() => {
    const sorted = [...projects].sort((a, b) => {
      const { sortBy, sortDirection } = filters;
      const dir = sortDirection === 'asc' ? 1 : -1;

      switch (sortBy) {
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'createdAt':
          return dir * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        case 'updatedAt':
          return dir * (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
        case 'progress':
          return dir * (a.progress - b.progress);
        default:
          return 0;
      }
    });

    return sorted;
  }, [projects, filters.sortBy, filters.sortDirection]);

  const handleFilterChange = <K extends keyof ProjectFiltersState>(
    key: K,
    value: ProjectFiltersState[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleStatusFilter = (status: ProjectStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status],
    }));
  };

  const togglePriorityFilter = (priority: ProjectPriority) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority],
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const hasActiveFilters = 
    filters.status.length > 0 || 
    filters.priority.length > 0 || 
    filters.tags.length > 0 || 
    filters.search !== '';

  if (error) {
    return (
      <div className="error-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3>Failed to load projects</h3>
        <p>{error}</p>
        <Button onClick={() => loadProjects()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="project-list-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-title-section">
          <h1 className="page-title">
            <span className="title-icon">📂</span>
            Projects
          </h1>
          <p className="page-subtitle">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="header-actions">
          <Button variant="primary" onClick={createModal.open}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Project
          </Button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          {/* Search */}
          <div className="search-input-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search projects..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
            {filters.search && (
              <button 
                className="clear-search-btn"
                onClick={() => handleFilterChange('search', '')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button 
            variant={showFilters ? 'secondary' : 'ghost'} 
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filters
            {hasActiveFilters && <span className="filter-badge">{filters.status.length + filters.priority.length}</span>}
          </Button>
        </div>

        <div className="toolbar-right">
          {/* Sort */}
          <div className="sort-select">
            <select
              value={`${filters.sortBy}-${filters.sortDirection}`}
              onChange={(e) => {
                const [sortBy, sortDirection] = e.target.value.split('-') as [
                  typeof filters.sortBy,
                  typeof filters.sortDirection
                ];
                setFilters(prev => ({ ...prev, sortBy, sortDirection }));
              }}
              className="input-field select-field"
            >
              <option value="updatedAt-desc">Recently Updated</option>
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="progress-desc">Progress (High to Low)</option>
              <option value="progress-asc">Progress (Low to High)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <h4 className="filter-group-title">Status</h4>
            <div className="filter-options">
              {(['planning', 'active', 'on_hold', 'completed', 'archived'] as const).map(status => (
                <label key={status} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.status.includes(status)}
                    onChange={() => toggleStatusFilter(status)}
                  />
                  <span className="filter-option-label">
                    {status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4 className="filter-group-title">Priority</h4>
            <div className="filter-options">
              {(['low', 'medium', 'high', 'critical'] as const).map(priority => (
                <label key={priority} className="filter-option">
                  <input
                    type="checkbox"
                    checked={filters.priority.includes(priority)}
                    onChange={() => togglePriorityFilter(priority)}
                  />
                  <span className={`filter-option-label priority-${priority}`}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}

      {/* Project Grid/List */}
      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            <line x1="12" y1="11" x2="12" y2="17" />
            <line x1="9" y1="14" x2="15" y2="14" />
          </svg>
          <h3>No projects found</h3>
          <p>
            {hasActiveFilters
              ? 'Try adjusting your filters or search terms'
              : 'Create your first project to get started'}
          </p>
          {!hasActiveFilters && (
            <Button onClick={createModal.open}>
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className={`projects-container ${viewMode}`}>
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => {
                // Navigate to project
                window.location.href = `/projects/${project.id}`;
              }}
              onFavoriteToggle={() => toggleFavorite(project.id)}
            />
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
      />
    </div>
  );
}

