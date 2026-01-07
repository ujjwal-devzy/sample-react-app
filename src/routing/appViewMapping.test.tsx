import { describe, expect, it } from 'vitest';
import { ROUTES } from '../core/constants';
import { getPathForView, getViewFromPath } from './appViewMapping';

describe('appViewMapping', () => {
  it('maps views to paths', () => {
    expect(getPathForView('tasks')).toBe(ROUTES.TASKS);
    expect(getPathForView('projects')).toBe(ROUTES.PROJECTS);
    expect(getPathForView('teams')).toBe(ROUTES.TEAMS);
    expect(getPathForView('analytics')).toBe(ROUTES.ANALYTICS);
    expect(getPathForView('settings')).toBe(ROUTES.SETTINGS);
  });

  it('derives views from base paths', () => {
    expect(getViewFromPath(ROUTES.TASKS)).toBe('tasks');
    expect(getViewFromPath(ROUTES.PROJECTS)).toBe('projects');
    expect(getViewFromPath(ROUTES.TEAMS)).toBe('teams');
    expect(getViewFromPath(ROUTES.ANALYTICS)).toBe('analytics');
    expect(getViewFromPath(ROUTES.SETTINGS)).toBe('settings');
  });

  it('derives views from nested paths', () => {
    expect(getViewFromPath('/tasks/task_123')).toBe('tasks');
    expect(getViewFromPath('/projects/project_123')).toBe('projects');
    expect(getViewFromPath('/teams/team_123')).toBe('teams');
    expect(getViewFromPath('/analytics/overview')).toBe('analytics');
    expect(getViewFromPath('/settings/profile')).toBe('settings');
  });
});


