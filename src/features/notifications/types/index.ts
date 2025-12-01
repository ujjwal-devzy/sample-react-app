/**
 * Notification Types
 * Types for the notification system
 */

import type { Notification, NotificationType, UUID } from '../../../core/types';

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

export interface NotificationChannel {
  email: boolean;
  push: boolean;
  desktop: boolean;
  inApp: boolean;
}

export interface NotificationCategoryPreferences {
  tasks: NotificationChannel;
  projects: NotificationChannel;
  teams: NotificationChannel;
  comments: NotificationChannel;
  mentions: NotificationChannel;
  system: NotificationChannel;
}

export interface NotificationSchedule {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string;
  timezone: string;
  weekdays: number[]; // 0-6, Sunday = 0
}

export interface NotificationPreferences {
  categories: NotificationCategoryPreferences;
  schedule: NotificationSchedule;
  emailDigest: 'none' | 'daily' | 'weekly';
  mutedProjects: UUID[];
  mutedTeams: UUID[];
}

// ============================================
// NOTIFICATION ACTIONS
// ============================================

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  href?: string;
  onClick?: () => void;
}

// ============================================
// NOTIFICATION WITH METADATA
// ============================================

export interface NotificationWithMeta extends Notification {
  icon?: string;
  image?: string;
  actions?: NotificationAction[];
  groupId?: string;
  groupCount?: number;
}

// ============================================
// GROUPED NOTIFICATIONS
// ============================================

export interface NotificationGroup {
  id: string;
  type: NotificationType;
  notifications: NotificationWithMeta[];
  latestAt: Date;
  unreadCount: number;
}

// ============================================
// NOTIFICATION FILTERS
// ============================================

export interface NotificationFilters {
  types?: NotificationType[];
  read?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  projectId?: UUID;
  teamId?: UUID;
}

// ============================================
// NOTIFICATION STATS
// ============================================

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  recentCount: number;
}

// ============================================
// PUSH NOTIFICATION
// ============================================

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string }>;
  tag?: string;
  requireInteraction?: boolean;
}

// ============================================
// NOTIFICATION CONTEXT
// ============================================

export interface NotificationContextValue {
  notifications: NotificationWithMeta[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  preferences: NotificationPreferences | null;
  
  // Actions
  loadNotifications: (filters?: NotificationFilters) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  markAsRead: (notificationId: UUID) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: UUID) => Promise<void>;
  clearAll: () => Promise<void>;
  
  // Preferences
  loadPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  muteProject: (projectId: UUID) => Promise<void>;
  unmuteProject: (projectId: UUID) => Promise<void>;
  muteTeam: (teamId: UUID) => Promise<void>;
  unmuteTeam: (teamId: UUID) => Promise<void>;
  
  // Push notifications
  requestPushPermission: () => Promise<boolean>;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

