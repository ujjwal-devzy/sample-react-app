/**
 * Authentication Types
 * Types for authentication and authorization
 */

import type { User, UserRole, AuthTokens } from '../../../core/types';

// ============================================
// AUTH STATE
// ============================================

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  tokens: AuthTokens | null;
  error: string | null;
  isInitialized: boolean;
}

// ============================================
// AUTH REQUESTS
// ============================================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username?: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string | null;
  phone?: string;
  timezone?: string;
  language?: string;
}

export interface TwoFactorSetupData {
  method: 'authenticator' | 'sms' | 'email';
}

export interface TwoFactorVerifyData {
  code: string;
  method: 'authenticator' | 'sms' | 'email';
}

// ============================================
// AUTH RESPONSES
// ============================================

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface TwoFactorSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// ============================================
// SESSION TYPES
// ============================================

export interface Session {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  lastActiveAt: Date;
  createdAt: Date;
  isCurrent: boolean;
}

// ============================================
// PERMISSION TYPES
// ============================================

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}

// ============================================
// OAUTH TYPES
// ============================================

export type OAuthProvider = 'google' | 'github' | 'microsoft' | 'slack';

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  redirectUri: string;
  scope: string[];
}

export interface OAuthCallbackData {
  provider: OAuthProvider;
  code: string;
  state?: string;
}

// ============================================
// INVITATION TYPES
// ============================================

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  teamId?: string;
  projectId?: string;
  invitedBy: string;
  invitedByUser?: User;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  expiresAt: Date;
  createdAt: Date;
  acceptedAt?: Date;
}

export interface InviteUserData {
  email: string;
  role: UserRole;
  teamId?: string;
  projectId?: string;
  message?: string;
}

// ============================================
// AUTH CONTEXT
// ============================================

export interface AuthContextValue {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  refreshTokens: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: () => Promise<void>;
  setupTwoFactor: (data: TwoFactorSetupData) => Promise<TwoFactorSetupResponse>;
  verifyTwoFactor: (data: TwoFactorVerifyData) => Promise<void>;
  disableTwoFactor: (code: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
}

