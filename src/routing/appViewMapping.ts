import { ROUTES } from '../core/constants';

export type AppView = 'tasks' | 'projects' | 'teams' | 'analytics' | 'settings';

export function getPathForView(view: AppView): string {
  switch (view) {
    case 'projects':
      return ROUTES.PROJECTS;
    case 'teams':
      return ROUTES.TEAMS;
    case 'analytics':
      return ROUTES.ANALYTICS;
    case 'settings':
      return ROUTES.SETTINGS;
    default:
      return ROUTES.TASKS;
  }
}

export function getViewFromPath(pathname: string): AppView {
  if (pathname.startsWith(ROUTES.PROJECTS)) {
    return 'projects';
  }
  if (pathname.startsWith(ROUTES.TEAMS)) {
    return 'teams';
  }
  if (pathname.startsWith(ROUTES.ANALYTICS)) {
    return 'analytics';
  }
  if (pathname.startsWith(ROUTES.SETTINGS) || pathname.startsWith(ROUTES.PROFILE)) {
    return 'settings';
  }
  if (pathname.startsWith(ROUTES.MY_TASKS) || pathname.startsWith(ROUTES.TASKS)) {
    return 'tasks';
  }
  return 'tasks';
}


