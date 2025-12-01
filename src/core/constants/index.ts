/**
 * Application Constants
 * Centralized configuration values and magic numbers
 */

// ============================================
// APPLICATION INFO
// ============================================

export const APP_CONFIG = {
  name: 'TaskFlow Pro',
  version: '2.4.1',
  description: 'Enterprise Project Management Platform',
  company: 'Acme Corporation',
  supportEmail: 'support@taskflowpro.io',
  docsUrl: 'https://docs.taskflowpro.io',
  apiVersion: 'v1',
} as const;

// ============================================
// API CONFIGURATION
// ============================================

export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: '/auth/reset-password',
  AUTH_VERIFY_EMAIL: '/auth/verify-email',
  AUTH_TWO_FACTOR: '/auth/two-factor',
  
  // Users
  USERS: '/users',
  USERS_ME: '/users/me',
  USERS_PROFILE: '/users/profile',
  USERS_PREFERENCES: '/users/preferences',
  USERS_AVATAR: '/users/avatar',
  
  // Organizations
  ORGANIZATIONS: '/organizations',
  ORGANIZATION_MEMBERS: '/organizations/:id/members',
  ORGANIZATION_SETTINGS: '/organizations/:id/settings',
  
  // Teams
  TEAMS: '/teams',
  TEAM_MEMBERS: '/teams/:id/members',
  
  // Projects
  PROJECTS: '/projects',
  PROJECT_MEMBERS: '/projects/:id/members',
  PROJECT_SETTINGS: '/projects/:id/settings',
  PROJECT_ANALYTICS: '/projects/:id/analytics',
  
  // Tasks
  TASKS: '/tasks',
  TASK_COMMENTS: '/tasks/:id/comments',
  TASK_ATTACHMENTS: '/tasks/:id/attachments',
  TASK_ACTIVITY: '/tasks/:id/activity',
  TASK_SUBTASKS: '/tasks/:id/subtasks',
  
  // Comments
  COMMENTS: '/comments',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_MARK_READ: '/notifications/mark-read',
  NOTIFICATIONS_PREFERENCES: '/notifications/preferences',
  
  // Search
  SEARCH: '/search',
  SEARCH_SUGGESTIONS: '/search/suggestions',
  
  // Files
  FILES_UPLOAD: '/files/upload',
  FILES_DOWNLOAD: '/files/:id/download',
  
  // Analytics
  ANALYTICS_DASHBOARD: '/analytics/dashboard',
  ANALYTICS_REPORTS: '/analytics/reports',
  ANALYTICS_EXPORT: '/analytics/export',
  
  // Activity
  ACTIVITY_FEED: '/activity/feed',
  ACTIVITY_LOG: '/activity/log',
} as const;

// ============================================
// STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: 'taskflow_access_token',
  REFRESH_TOKEN: 'taskflow_refresh_token',
  USER: 'taskflow_user',
  SESSION: 'taskflow_session',
  
  // Preferences
  THEME: 'taskflow_theme',
  LANGUAGE: 'taskflow_language',
  SIDEBAR_COLLAPSED: 'taskflow_sidebar_collapsed',
  
  // Cache
  PROJECTS_CACHE: 'taskflow_projects_cache',
  TEAMS_CACHE: 'taskflow_teams_cache',
  
  // Data
  TASKS: 'taskflow_tasks',
  DRAFT_TASKS: 'taskflow_draft_tasks',
  RECENT_SEARCHES: 'taskflow_recent_searches',
  RECENT_PROJECTS: 'taskflow_recent_projects',
} as const;

// ============================================
// ROUTE PATHS
// ============================================

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  
  // Protected
  DASHBOARD: '/dashboard',
  
  // Projects
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:projectId',
  PROJECT_BOARD: '/projects/:projectId/board',
  PROJECT_LIST: '/projects/:projectId/list',
  PROJECT_TIMELINE: '/projects/:projectId/timeline',
  PROJECT_CALENDAR: '/projects/:projectId/calendar',
  PROJECT_FILES: '/projects/:projectId/files',
  PROJECT_SETTINGS: '/projects/:projectId/settings',
  
  // Tasks
  TASKS: '/tasks',
  TASK_DETAIL: '/tasks/:taskId',
  MY_TASKS: '/my-tasks',
  
  // Teams
  TEAMS: '/teams',
  TEAM_DETAIL: '/teams/:teamId',
  TEAM_MEMBERS: '/teams/:teamId/members',
  
  // Users
  PROFILE: '/profile',
  SETTINGS: '/settings',
  SETTINGS_ACCOUNT: '/settings/account',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_APPEARANCE: '/settings/appearance',
  SETTINGS_INTEGRATIONS: '/settings/integrations',
  
  // Analytics
  ANALYTICS: '/analytics',
  REPORTS: '/reports',
  
  // Admin
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_TEAMS: '/admin/teams',
  ADMIN_BILLING: '/admin/billing',
  ADMIN_AUDIT_LOG: '/admin/audit-log',
  
  // Misc
  NOTIFICATIONS: '/notifications',
  SEARCH: '/search',
  HELP: '/help',
  
  // Error
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
  SERVER_ERROR: '/500',
} as const;

// ============================================
// VALIDATION CONSTRAINTS
// ============================================

export const VALIDATION = {
  // User
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  EMAIL_MAX_LENGTH: 255,
  DISPLAY_NAME_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
  
  // Organization
  ORG_NAME_MIN_LENGTH: 2,
  ORG_NAME_MAX_LENGTH: 100,
  ORG_SLUG_MIN_LENGTH: 2,
  ORG_SLUG_MAX_LENGTH: 50,
  
  // Team
  TEAM_NAME_MIN_LENGTH: 2,
  TEAM_NAME_MAX_LENGTH: 100,
  
  // Project
  PROJECT_NAME_MIN_LENGTH: 2,
  PROJECT_NAME_MAX_LENGTH: 100,
  PROJECT_KEY_LENGTH: 2,
  PROJECT_KEY_MAX_LENGTH: 10,
  PROJECT_DESCRIPTION_MAX_LENGTH: 2000,
  
  // Task
  TASK_TITLE_MIN_LENGTH: 1,
  TASK_TITLE_MAX_LENGTH: 255,
  TASK_DESCRIPTION_MAX_LENGTH: 10000,
  
  // Comment
  COMMENT_MIN_LENGTH: 1,
  COMMENT_MAX_LENGTH: 5000,
  
  // Tags
  TAG_MIN_LENGTH: 1,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS_PER_ENTITY: 10,
  
  // Files
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES_PER_UPLOAD: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
} as const;

// ============================================
// PAGINATION DEFAULTS
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  TASKS_PER_PAGE: 25,
  COMMENTS_PER_PAGE: 20,
  NOTIFICATIONS_PER_PAGE: 15,
  ACTIVITY_PER_PAGE: 30,
  SEARCH_RESULTS_PER_PAGE: 20,
} as const;

// ============================================
// DATE & TIME
// ============================================

export const DATE_FORMATS = {
  SHORT_DATE: 'MMM d',
  MEDIUM_DATE: 'MMM d, yyyy',
  LONG_DATE: 'MMMM d, yyyy',
  SHORT_TIME: 'h:mm a',
  LONG_TIME: 'h:mm:ss a',
  DATETIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  RELATIVE: 'relative',
} as const;

export const TIME_ZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  CST: 'America/Chicago',
  MST: 'America/Denver',
  PST: 'America/Los_Angeles',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  IST: 'Asia/Kolkata',
  JST: 'Asia/Tokyo',
} as const;

// ============================================
// COLORS
// ============================================

export const COLORS = {
  // Brand
  primary: '#8b5cf6',
  secondary: '#06b6d4',
  accent: '#f59e0b',
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  
  // Priority
  priorityLow: '#10b981',
  priorityMedium: '#f59e0b',
  priorityHigh: '#f97316',
  priorityCritical: '#ef4444',
  
  // Project Colors
  projectColors: [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ],
  
  // Column Colors
  columnBacklog: '#6366f1',
  columnProgress: '#f59e0b',
  columnReview: '#8b5cf6',
  columnDone: '#10b981',
} as const;

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

export const KEYBOARD_SHORTCUTS = {
  // Global
  SEARCH: 'mod+k',
  QUICK_ADD: 'mod+shift+n',
  TOGGLE_SIDEBAR: 'mod+b',
  GO_TO_DASHBOARD: 'g d',
  GO_TO_PROJECTS: 'g p',
  GO_TO_TASKS: 'g t',
  GO_TO_SETTINGS: 'g s',
  
  // Task Actions
  CREATE_TASK: 'c',
  EDIT_TASK: 'e',
  DELETE_TASK: 'mod+backspace',
  ASSIGN_TASK: 'a',
  SET_PRIORITY: 'p',
  SET_STATUS: 's',
  ADD_COMMENT: 'm',
  
  // Navigation
  NEXT_ITEM: 'j',
  PREV_ITEM: 'k',
  OPEN_ITEM: 'enter',
  CLOSE_MODAL: 'escape',
} as const;

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURE_FLAGS = {
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_FILE_UPLOADS: true,
  ENABLE_COMMENTS: true,
  ENABLE_TIME_TRACKING: false,
  ENABLE_SUBTASKS: true,
  ENABLE_DEPENDENCIES: false,
  ENABLE_CUSTOM_FIELDS: false,
  ENABLE_WEBHOOKS: false,
  ENABLE_API_ACCESS: false,
  ENABLE_SSO: false,
  ENABLE_AUDIT_LOG: true,
  ENABLE_EXPORT: true,
  ENABLE_ANALYTICS: true,
  ENABLE_AI_FEATURES: false,
} as const;

// ============================================
// ERROR CODES
// ============================================

export const ERROR_CODES = {
  // Authentication
  AUTH_INVALID_CREDENTIALS: 'AUTH001',
  AUTH_TOKEN_EXPIRED: 'AUTH002',
  AUTH_TOKEN_INVALID: 'AUTH003',
  AUTH_UNAUTHORIZED: 'AUTH004',
  AUTH_FORBIDDEN: 'AUTH005',
  AUTH_ACCOUNT_DISABLED: 'AUTH006',
  AUTH_EMAIL_NOT_VERIFIED: 'AUTH007',
  
  // Validation
  VALIDATION_FAILED: 'VAL001',
  VALIDATION_REQUIRED: 'VAL002',
  VALIDATION_MIN_LENGTH: 'VAL003',
  VALIDATION_MAX_LENGTH: 'VAL004',
  VALIDATION_PATTERN: 'VAL005',
  VALIDATION_UNIQUE: 'VAL006',
  
  // Resource
  RESOURCE_NOT_FOUND: 'RES001',
  RESOURCE_ALREADY_EXISTS: 'RES002',
  RESOURCE_CONFLICT: 'RES003',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE001',
  
  // Server
  INTERNAL_ERROR: 'SRV001',
  SERVICE_UNAVAILABLE: 'SRV002',
  DATABASE_ERROR: 'SRV003',
  
  // Network
  NETWORK_ERROR: 'NET001',
  TIMEOUT_ERROR: 'NET002',
} as const;

// ============================================
// REGEX PATTERNS
// ============================================

export const PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  USERNAME: /^[a-zA-Z0-9_-]{3,30}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  PROJECT_KEY: /^[A-Z]{2,10}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  MENTION: /@\[([^\]]+)\]\(([^)]+)\)/g,
  HASHTAG: /#([a-zA-Z0-9_]+)/g,
} as const;

