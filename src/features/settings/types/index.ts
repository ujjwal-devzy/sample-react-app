/**
 * Settings Types
 * Types for application settings
 */

import type { UUID } from '../../../core/types';

// ============================================
// USER PREFERENCES
// ============================================

export interface UserPreferences {
  id: UUID;
  userId: UUID;
  theme: ThemePreference;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  firstDayOfWeek: 0 | 1 | 6; // Sunday, Monday, Saturday
  notifications: NotificationPreferences;
  accessibility: AccessibilityPreferences;
  privacy: PrivacyPreferences;
  dashboard: DashboardPreferences;
  keyboard: KeyboardPreferences;
}

export interface ThemePreference {
  mode: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    digest: 'none' | 'daily' | 'weekly';
    taskAssigned: boolean;
    taskCompleted: boolean;
    mentions: boolean;
    projectUpdates: boolean;
    teamUpdates: boolean;
  };
  push: {
    enabled: boolean;
    taskAssigned: boolean;
    taskDue: boolean;
    mentions: boolean;
    comments: boolean;
  };
  desktop: {
    enabled: boolean;
    sound: boolean;
    taskReminders: boolean;
    mentions: boolean;
  };
  inApp: {
    enabled: boolean;
    showBadge: boolean;
    autoMarkRead: boolean;
  };
}

export interface AccessibilityPreferences {
  reducedMotion: boolean;
  screenReaderAnnouncements: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface PrivacyPreferences {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  profileVisibility: 'public' | 'team' | 'private';
  activityVisibility: 'public' | 'team' | 'private';
  allowAnalytics: boolean;
}

export interface DashboardPreferences {
  defaultView: 'list' | 'board' | 'calendar' | 'timeline';
  showCompletedTasks: boolean;
  taskGrouping: 'none' | 'status' | 'priority' | 'assignee' | 'project';
  taskSorting: 'dueDate' | 'priority' | 'createdAt' | 'updatedAt';
  widgetLayout: WidgetConfig[];
}

export interface WidgetConfig {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  settings: Record<string, unknown>;
}

export interface KeyboardPreferences {
  enableShortcuts: boolean;
  customShortcuts: Record<string, string>;
  vimMode: boolean;
}

// ============================================
// ORGANIZATION SETTINGS
// ============================================

export interface OrganizationSettings {
  id: UUID;
  organizationId: UUID;
  general: OrganizationGeneralSettings;
  security: OrganizationSecuritySettings;
  billing: OrganizationBillingSettings;
  integrations: IntegrationSettings[];
  branding: BrandingSettings;
}

export interface OrganizationGeneralSettings {
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  timezone: string;
  language: string;
  defaultProjectVisibility: 'public' | 'private';
}

export interface OrganizationSecuritySettings {
  mfaRequired: boolean;
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  ipAllowlist: string[];
  ssoEnabled: boolean;
  ssoProvider?: string;
  ssoConfig?: Record<string, string>;
  domainVerification: boolean;
  verifiedDomains: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expirationDays: number;
  preventReuse: number;
}

export interface OrganizationBillingSettings {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  billingEmail: string;
  billingAddress?: BillingAddress;
  paymentMethod?: PaymentMethod;
  invoicePrefix?: string;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface PaymentMethod {
  type: 'card' | 'bank' | 'invoice';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface IntegrationSettings {
  id: UUID;
  provider: string;
  enabled: boolean;
  config: Record<string, unknown>;
  scopes: string[];
  lastSyncAt?: Date;
  status: 'connected' | 'disconnected' | 'error';
  error?: string;
}

export interface BrandingSettings {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor?: string;
  customCss?: string;
  emailFooter?: string;
}

// ============================================
// API KEYS
// ============================================

export interface ApiKey {
  id: UUID;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: UUID;
}

export interface CreateApiKeyDTO {
  name: string;
  scopes: string[];
  expiresAt?: Date;
}

// ============================================
// WEBHOOKS
// ============================================

export interface Webhook {
  id: UUID;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
  lastTriggeredAt?: Date;
  failureCount: number;
  createdAt: Date;
}

export interface CreateWebhookDTO {
  url: string;
  events: string[];
  secret?: string;
}

// ============================================
// SETTINGS CONTEXT
// ============================================

export interface SettingsContextValue {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
  
  // Theme
  setTheme: (theme: ThemePreference) => void;
  
  // Notifications
  updateNotificationPreferences: (updates: Partial<NotificationPreferences>) => Promise<void>;
}

