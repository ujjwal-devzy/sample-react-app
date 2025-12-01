/**
 * Notification Service
 * Handles notification-related API calls
 */

import type { NotificationType, UUID } from '../../../core/types';
import { API_ENDPOINTS } from '../../../core/constants';
import { api } from '../../../core/api';
import type {
  NotificationWithMeta,
  NotificationFilters,
  NotificationPreferences,
  NotificationStats,
} from '../types';

// ============================================
// MOCK DATA
// ============================================

const USE_MOCK = true;

const MOCK_NOTIFICATIONS: NotificationWithMeta[] = [
  {
    id: 'notif_001',
    userId: 'user_001',
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: 'Alice assigned you to "Implement user authentication"',
    data: { taskId: 'task_001', projectId: 'proj_001' },
    read: false,
    readAt: null,
    actionUrl: '/projects/proj_001/tasks/task_001',
    expiresAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5),
    icon: '📋',
    actions: [
      { id: 'view', label: 'View Task', type: 'primary' },
      { id: 'dismiss', label: 'Dismiss', type: 'secondary' },
    ],
  },
  {
    id: 'notif_002',
    userId: 'user_001',
    type: 'comment_mentioned',
    title: 'Mentioned in Comment',
    message: 'Bob mentioned you in a comment on "Design System Updates"',
    data: { taskId: 'task_002', commentId: 'comment_001' },
    read: false,
    readAt: null,
    actionUrl: '/projects/proj_001/tasks/task_002#comment_001',
    expiresAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    icon: '💬',
  },
  {
    id: 'notif_003',
    userId: 'user_001',
    type: 'task_completed',
    title: 'Task Completed',
    message: 'Carol completed "API Integration" in Website Redesign',
    data: { taskId: 'task_003', projectId: 'proj_001' },
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 45),
    actionUrl: '/projects/proj_001/tasks/task_003',
    expiresAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 45),
    icon: '✅',
  },
  {
    id: 'notif_004',
    userId: 'user_001',
    type: 'task_due_soon',
    title: 'Task Due Soon',
    message: '"Review PR #123" is due tomorrow',
    data: { taskId: 'task_004', projectId: 'proj_002' },
    read: false,
    readAt: null,
    actionUrl: '/projects/proj_002/tasks/task_004',
    expiresAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    icon: '⏰',
  },
  {
    id: 'notif_005',
    userId: 'user_001',
    type: 'project_invitation',
    title: 'Project Invitation',
    message: 'You\'ve been invited to join "Mobile App Development"',
    data: { projectId: 'proj_002', invitationId: 'inv_001' },
    read: false,
    readAt: null,
    actionUrl: '/invitations/inv_001',
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // Expires in 7 days
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    icon: '📩',
    actions: [
      { id: 'accept', label: 'Accept', type: 'primary' },
      { id: 'decline', label: 'Decline', type: 'danger' },
    ],
  },
  {
    id: 'notif_006',
    userId: 'user_001',
    type: 'member_joined',
    title: 'New Team Member',
    message: 'David joined the Engineering team',
    data: { teamId: 'team_001', memberId: 'user_005' },
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
    actionUrl: '/teams/team_001',
    expiresAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
    icon: '👋',
  },
  {
    id: 'notif_007',
    userId: 'user_001',
    type: 'system_announcement',
    title: 'System Update',
    message: 'TaskFlow Pro has been updated to version 2.4.1 with new features!',
    data: { version: '2.4.1' },
    read: true,
    readAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    actionUrl: '/changelog',
    expiresAt: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    icon: '🚀',
  },
];

const MOCK_PREFERENCES: NotificationPreferences = {
  categories: {
    tasks: { email: true, push: true, desktop: true, inApp: true },
    projects: { email: true, push: false, desktop: true, inApp: true },
    teams: { email: false, push: false, desktop: true, inApp: true },
    comments: { email: true, push: true, desktop: true, inApp: true },
    mentions: { email: true, push: true, desktop: true, inApp: true },
    system: { email: true, push: false, desktop: false, inApp: true },
  },
  schedule: {
    enabled: true,
    startTime: '09:00',
    endTime: '18:00',
    timezone: 'America/New_York',
    weekdays: [1, 2, 3, 4, 5],
  },
  emailDigest: 'daily',
  mutedProjects: [],
  mutedTeams: [],
};

// ============================================
// NOTIFICATION SERVICE
// ============================================

class NotificationService {
  private mockDelay(ms = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get notifications
   */
  async getNotifications(
    filters?: NotificationFilters,
    page = 1,
    limit = 20
  ): Promise<{ notifications: NotificationWithMeta[]; hasMore: boolean }> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      let filtered = [...MOCK_NOTIFICATIONS];

      if (filters) {
        if (filters.types?.length) {
          filtered = filtered.filter(n => filters.types!.includes(n.type));
        }
        if (filters.read !== undefined) {
          filtered = filtered.filter(n => n.read === filters.read);
        }
        if (filters.dateFrom) {
          filtered = filtered.filter(n => n.createdAt >= filters.dateFrom!);
        }
        if (filters.dateTo) {
          filtered = filtered.filter(n => n.createdAt <= filters.dateTo!);
        }
      }

      const start = (page - 1) * limit;
      const end = start + limit;
      
      return {
        notifications: filtered.slice(start, end),
        hasMore: end < filtered.length,
      };
    }

    const response = await api.get<{ notifications: NotificationWithMeta[]; hasMore: boolean }>(
      API_ENDPOINTS.NOTIFICATIONS,
      { params: { ...filters, page, limit } }
    );
    return response.data;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      return MOCK_NOTIFICATIONS.filter(n => !n.read).length;
    }

    const response = await api.get<{ count: number }>(`${API_ENDPOINTS.NOTIFICATIONS}/unread-count`);
    return response.data.count;
  }

  /**
   * Get notification stats
   */
  async getStats(): Promise<NotificationStats> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const byType = MOCK_NOTIFICATIONS.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<NotificationType, number>);

      return {
        total: MOCK_NOTIFICATIONS.length,
        unread: MOCK_NOTIFICATIONS.filter(n => !n.read).length,
        byType,
        recentCount: MOCK_NOTIFICATIONS.filter(
          n => n.createdAt > new Date(Date.now() - 1000 * 60 * 60 * 24)
        ).length,
      };
    }

    const response = await api.get<NotificationStats>(`${API_ENDPOINTS.NOTIFICATIONS}/stats`);
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      
      const notification = MOCK_NOTIFICATIONS.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        notification.readAt = new Date();
      }
      return;
    }

    await api.post(API_ENDPOINTS.NOTIFICATIONS_MARK_READ, { notificationIds: [notificationId] });
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      MOCK_NOTIFICATIONS.forEach(n => {
        if (!n.read) {
          n.read = true;
          n.readAt = new Date();
        }
      });
      return;
    }

    await api.post(API_ENDPOINTS.NOTIFICATIONS_MARK_READ, { all: true });
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      
      const index = MOCK_NOTIFICATIONS.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        MOCK_NOTIFICATIONS.splice(index, 1);
      }
      return;
    }

    await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      MOCK_NOTIFICATIONS.length = 0;
      return;
    }

    await api.delete(API_ENDPOINTS.NOTIFICATIONS);
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    if (USE_MOCK) {
      await this.mockDelay();
      return { ...MOCK_PREFERENCES };
    }

    const response = await api.get<NotificationPreferences>(API_ENDPOINTS.NOTIFICATIONS_PREFERENCES);
    return response.data;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    if (USE_MOCK) {
      await this.mockDelay();
      Object.assign(MOCK_PREFERENCES, preferences);
      return { ...MOCK_PREFERENCES };
    }

    const response = await api.patch<NotificationPreferences>(
      API_ENDPOINTS.NOTIFICATIONS_PREFERENCES,
      preferences
    );
    return response.data;
  }

  /**
   * Request push notification permission
   */
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications are not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    
    // In a real app, get VAPID key from server
    const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY';
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey,
    });

    // Send subscription to server
    if (!USE_MOCK) {
      await api.post('/notifications/push/subscribe', subscription);
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      if (!USE_MOCK) {
        await api.post('/notifications/push/unsubscribe', { endpoint: subscription.endpoint });
      }
    }
  }

  /**
   * Show browser notification
   */
  showDesktopNotification(
    title: string,
    options?: NotificationOptions
  ): globalThis.Notification | null {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return null;
    }

    return new window.Notification(title, {
      icon: '/icon-192.png',
      badge: '/badge.png',
      ...options,
    });
  }
}

export const notificationService = new NotificationService();

