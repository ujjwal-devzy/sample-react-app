/**
 * Settings Service
 * Handles user preferences and organization settings
 */

import type { UUID } from '../../../core/types';
import { api } from '../../../core/api';
import { storage } from '../../../core/utils/storage';
import type {
  UserPreferences,
  ThemePreference,
  NotificationPreferences,
  OrganizationSettings,
  ApiKey,
  CreateApiKeyDTO,
  Webhook,
  CreateWebhookDTO,
} from '../types';

// ============================================
// CONSTANTS
// ============================================

const STORAGE_KEYS = {
  PREFERENCES: 'user_preferences',
  THEME: 'theme_preference',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  id: 'pref_001',
  userId: 'user_001',
  theme: {
    mode: 'system',
    accentColor: '#6366f1',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
  },
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MMM dd, yyyy',
  timeFormat: '12h',
  firstDayOfWeek: 0,
  notifications: {
    email: {
      enabled: true,
      digest: 'daily',
      taskAssigned: true,
      taskCompleted: true,
      mentions: true,
      projectUpdates: true,
      teamUpdates: false,
    },
    push: {
      enabled: true,
      taskAssigned: true,
      taskDue: true,
      mentions: true,
      comments: true,
    },
    desktop: {
      enabled: true,
      sound: true,
      taskReminders: true,
      mentions: true,
    },
    inApp: {
      enabled: true,
      showBadge: true,
      autoMarkRead: false,
    },
  },
  accessibility: {
    reducedMotion: false,
    screenReaderAnnouncements: true,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindMode: 'none',
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    profileVisibility: 'team',
    activityVisibility: 'team',
    allowAnalytics: true,
  },
  dashboard: {
    defaultView: 'board',
    showCompletedTasks: false,
    taskGrouping: 'status',
    taskSorting: 'priority',
    widgetLayout: [],
  },
  keyboard: {
    enableShortcuts: true,
    customShortcuts: {},
    vimMode: false,
  },
};

// ============================================
// MOCK DATA
// ============================================

const USE_MOCK = true;

let mockPreferences: UserPreferences = { ...DEFAULT_PREFERENCES };

// ============================================
// SETTINGS SERVICE
// ============================================

class SettingsService {
  private mockDelay(ms = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==========================================
  // USER PREFERENCES
  // ==========================================

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      // Try to load from storage first
      const stored = storage.get<UserPreferences>(STORAGE_KEYS.PREFERENCES);
      if (stored) {
        mockPreferences = { ...DEFAULT_PREFERENCES, ...stored };
      }
      
      return mockPreferences;
    }

    const response = await api.get<UserPreferences>('/settings/preferences');
    return response.data;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(updates: Partial<UserPreferences>): Promise<UserPreferences> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      mockPreferences = {
        ...mockPreferences,
        ...updates,
        theme: updates.theme ? { ...mockPreferences.theme, ...updates.theme } : mockPreferences.theme,
        notifications: updates.notifications
          ? { ...mockPreferences.notifications, ...updates.notifications }
          : mockPreferences.notifications,
        accessibility: updates.accessibility
          ? { ...mockPreferences.accessibility, ...updates.accessibility }
          : mockPreferences.accessibility,
        privacy: updates.privacy
          ? { ...mockPreferences.privacy, ...updates.privacy }
          : mockPreferences.privacy,
        dashboard: updates.dashboard
          ? { ...mockPreferences.dashboard, ...updates.dashboard }
          : mockPreferences.dashboard,
        keyboard: updates.keyboard
          ? { ...mockPreferences.keyboard, ...updates.keyboard }
          : mockPreferences.keyboard,
      };

      // Persist to storage
      storage.set(STORAGE_KEYS.PREFERENCES, mockPreferences);
      
      return mockPreferences;
    }

    const response = await api.patch<UserPreferences>('/settings/preferences', updates);
    return response.data;
  }

  /**
   * Reset preferences to defaults
   */
  async resetPreferences(): Promise<UserPreferences> {
    if (USE_MOCK) {
      await this.mockDelay();
      mockPreferences = { ...DEFAULT_PREFERENCES };
      storage.remove(STORAGE_KEYS.PREFERENCES);
      return mockPreferences;
    }

    const response = await api.post<UserPreferences>('/settings/preferences/reset');
    return response.data;
  }

  // ==========================================
  // THEME
  // ==========================================

  /**
   * Get theme preference
   */
  getTheme(): ThemePreference {
    const stored = storage.get<ThemePreference>(STORAGE_KEYS.THEME);
    return stored || DEFAULT_PREFERENCES.theme;
  }

  /**
   * Set theme preference
   */
  async setTheme(theme: ThemePreference): Promise<void> {
    storage.set(STORAGE_KEYS.THEME, theme);
    
    // Apply theme to document
    this.applyTheme(theme);

    // Sync with server
    if (!USE_MOCK) {
      await api.patch('/settings/preferences', { theme });
    }
  }

  /**
   * Apply theme to document
   */
  applyTheme(theme: ThemePreference): void {
    const root = document.documentElement;
    
    // Determine actual theme mode
    let mode = theme.mode;
    if (mode === 'system') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    // Set data attribute for CSS
    root.setAttribute('data-theme', mode);
    root.setAttribute('data-accent', theme.accentColor);
    
    // Font size
    const fontSizes = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', fontSizes[theme.fontSize]);
    
    // Reduced motion
    if (theme.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // High contrast
    if (theme.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }

  // ==========================================
  // NOTIFICATION PREFERENCES
  // ==========================================

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    updates: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const preferences = await this.updatePreferences({
      notifications: updates as UserPreferences['notifications'],
    });
    return preferences.notifications;
  }

  // ==========================================
  // ORGANIZATION SETTINGS
  // ==========================================

  /**
   * Get organization settings
   */
  async getOrganizationSettings(orgId: UUID): Promise<OrganizationSettings> {
    if (USE_MOCK) {
      await this.mockDelay();
      return {
        id: 'settings_001',
        organizationId: orgId,
        general: {
          name: 'Acme Inc',
          slug: 'acme',
          description: 'Building the future',
          website: 'https://acme.com',
          industry: 'Technology',
          size: '50-100',
          timezone: 'America/New_York',
          language: 'en',
          defaultProjectVisibility: 'private',
        },
        security: {
          mfaRequired: false,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            expirationDays: 0,
            preventReuse: 3,
          },
          sessionTimeout: 24 * 60,
          ipAllowlist: [],
          ssoEnabled: false,
          domainVerification: false,
          verifiedDomains: [],
        },
        billing: {
          plan: 'professional',
          billingEmail: 'billing@acme.com',
        },
        integrations: [],
        branding: {
          primaryColor: '#6366f1',
        },
      };
    }

    const response = await api.get<OrganizationSettings>(
      `/organizations/${orgId}/settings`
    );
    return response.data;
  }

  /**
   * Update organization settings
   */
  async updateOrganizationSettings(
    orgId: UUID,
    updates: Partial<OrganizationSettings>
  ): Promise<OrganizationSettings> {
    if (USE_MOCK) {
      await this.mockDelay();
      throw new Error('Mock update not implemented');
    }

    const response = await api.patch<OrganizationSettings>(
      `/organizations/${orgId}/settings`,
      updates
    );
    return response.data;
  }

  // ==========================================
  // API KEYS
  // ==========================================

  /**
   * Get API keys
   */
  async getApiKeys(): Promise<ApiKey[]> {
    if (USE_MOCK) {
      await this.mockDelay();
      return [
        {
          id: 'key_001',
          name: 'Production API Key',
          prefix: 'pk_live_',
          scopes: ['read', 'write'],
          lastUsedAt: new Date(Date.now() - 1000 * 60 * 60),
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
          createdBy: 'user_001',
        },
        {
          id: 'key_002',
          name: 'Development Key',
          prefix: 'pk_test_',
          scopes: ['read'],
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          createdBy: 'user_001',
        },
      ];
    }

    const response = await api.get<ApiKey[]>('/settings/api-keys');
    return response.data;
  }

  /**
   * Create API key
   */
  async createApiKey(data: CreateApiKeyDTO): Promise<{ key: ApiKey; secret: string }> {
    if (USE_MOCK) {
      await this.mockDelay();
      return {
        key: {
          id: 'key_new',
          name: data.name,
          prefix: 'pk_live_',
          scopes: data.scopes,
          expiresAt: data.expiresAt,
          createdAt: new Date(),
          createdBy: 'user_001',
        },
        secret: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      };
    }

    const response = await api.post<{ key: ApiKey; secret: string }>(
      '/settings/api-keys',
      data
    );
    return response.data;
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      return;
    }

    await api.delete(`/settings/api-keys/${keyId}`);
  }

  // ==========================================
  // WEBHOOKS
  // ==========================================

  /**
   * Get webhooks
   */
  async getWebhooks(): Promise<Webhook[]> {
    if (USE_MOCK) {
      await this.mockDelay();
      return [
        {
          id: 'webhook_001',
          url: 'https://api.example.com/webhooks/tasks',
          events: ['task.created', 'task.updated', 'task.completed'],
          secret: 'whsec_xxxxx',
          enabled: true,
          lastTriggeredAt: new Date(Date.now() - 1000 * 60 * 5),
          failureCount: 0,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        },
      ];
    }

    const response = await api.get<Webhook[]>('/settings/webhooks');
    return response.data;
  }

  /**
   * Create webhook
   */
  async createWebhook(data: CreateWebhookDTO): Promise<Webhook> {
    if (USE_MOCK) {
      await this.mockDelay();
      return {
        id: 'webhook_new',
        url: data.url,
        events: data.events,
        secret: data.secret || 'whsec_generated',
        enabled: true,
        failureCount: 0,
        createdAt: new Date(),
      };
    }

    const response = await api.post<Webhook>('/settings/webhooks', data);
    return response.data;
  }

  /**
   * Update webhook
   */
  async updateWebhook(webhookId: UUID, updates: Partial<Webhook>): Promise<Webhook> {
    if (USE_MOCK) {
      await this.mockDelay();
      throw new Error('Mock update not implemented');
    }

    const response = await api.patch<Webhook>(`/settings/webhooks/${webhookId}`, updates);
    return response.data;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(webhookId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      return;
    }

    await api.delete(`/settings/webhooks/${webhookId}`);
  }

  /**
   * Test webhook
   */
  async testWebhook(webhookId: UUID): Promise<{ success: boolean; statusCode: number }> {
    if (USE_MOCK) {
      await this.mockDelay(1000);
      return { success: true, statusCode: 200 };
    }

    const response = await api.post<{ success: boolean; statusCode: number }>(
      `/settings/webhooks/${webhookId}/test`
    );
    return response.data;
  }
}

export const settingsService = new SettingsService();

