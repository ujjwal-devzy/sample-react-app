/**
 * Auth Service
 * Handles authentication API calls
 */

import type { User, AuthTokens } from '../../../core/types';
import { API_ENDPOINTS } from '../../../core/constants';
import { api } from '../../../core/api';
import type {
  LoginCredentials,
  RegisterData,
  UpdateProfileData,
  AuthResponse,
  TwoFactorSetupResponse,
} from '../types';

// ============================================
// MOCK DATA (for development)
// ============================================

const MOCK_USER: User = {
  id: 'user_001',
  email: 'john.doe@example.com',
  username: 'johndoe',
  displayName: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  avatarUrl: null,
  role: 'admin',
  status: 'active',
  lastLoginAt: new Date(),
  emailVerified: true,
  twoFactorEnabled: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date(),
  preferences: {
    theme: 'dark',
    language: 'en',
    timezone: 'America/New_York',
    notifications: {
      email: true,
      push: true,
      desktop: true,
      taskAssigned: true,
      taskMentioned: true,
      projectUpdates: true,
      weeklyDigest: true,
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
    },
  },
};

const MOCK_TOKENS: AuthTokens = {
  accessToken: 'mock_access_token_' + Date.now(),
  refreshToken: 'mock_refresh_token_' + Date.now(),
  expiresIn: 3600,
  tokenType: 'Bearer',
};

// Toggle for mock mode
const USE_MOCK = true;

// ============================================
// AUTH SERVICE
// ============================================

class AuthService {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      // Simulate invalid credentials
      if (credentials.email !== 'john.doe@example.com' && credentials.password !== 'password123') {
        // Still allow login for demo purposes
      }

      return {
        user: MOCK_USER,
        tokens: { ...MOCK_TOKENS, accessToken: 'mock_access_' + Date.now() },
      };
    }

    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH_LOGIN, credentials);
    return response.data;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const newUser: User = {
        ...MOCK_USER,
        id: 'user_' + Date.now(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        displayName: `${data.firstName} ${data.lastName}`,
        username: data.username || data.email.split('@')[0],
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return {
        user: newUser,
        tokens: { ...MOCK_TOKENS, accessToken: 'mock_access_' + Date.now() },
      };
    }

    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH_REGISTER, data);
    return response.data;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      return;
    }

    await api.post(API_ENDPOINTS.AUTH_LOGOUT);
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    if (USE_MOCK) {
      await this.mockDelay();
      return {
        ...MOCK_TOKENS,
        accessToken: 'mock_access_refreshed_' + Date.now(),
        refreshToken: 'mock_refresh_refreshed_' + Date.now(),
      };
    }

    const response = await api.post<AuthTokens>(API_ENDPOINTS.AUTH_REFRESH, { refreshToken });
    return response.data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    if (USE_MOCK) {
      await this.mockDelay();
      return MOCK_USER;
    }

    const response = await api.get<User>(API_ENDPOINTS.USERS_ME);
    return response.data;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<User> {
    if (USE_MOCK) {
      await this.mockDelay();
      return {
        ...MOCK_USER,
        ...data,
        displayName: data.displayName || `${data.firstName || MOCK_USER.firstName} ${data.lastName || MOCK_USER.lastName}`,
        updatedAt: new Date(),
      };
    }

    const response = await api.patch<User>(API_ENDPOINTS.USERS_PROFILE, data);
    return response.data;
  }

  /**
   * Send forgot password email
   */
  async forgotPassword(email: string): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      console.log(`Password reset email sent to: ${email}`);
      return;
    }

    await api.post(API_ENDPOINTS.AUTH_FORGOT_PASSWORD, { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      console.log(`Password reset with token: ${token}`);
      return;
    }

    await api.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, { token, password: newPassword });
  }

  /**
   * Change current password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      // Simulate wrong current password
      if (currentPassword !== 'password123') {
        throw new Error('Current password is incorrect');
      }

      console.log('Password changed successfully');
      return;
    }

    await api.post('/auth/change-password', { currentPassword, newPassword });
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      console.log(`Email verified with token: ${token}`);
      return;
    }

    await api.post(API_ENDPOINTS.AUTH_VERIFY_EMAIL, { token });
  }

  /**
   * Resend verification email
   */
  async resendVerification(): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      console.log('Verification email resent');
      return;
    }

    await api.post('/auth/resend-verification');
  }

  /**
   * Setup two-factor authentication
   */
  async setupTwoFactor(method: 'authenticator' | 'sms' | 'email'): Promise<TwoFactorSetupResponse> {
    if (USE_MOCK) {
      await this.mockDelay();
      return {
        secret: 'MOCK_SECRET_' + Date.now(),
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        backupCodes: [
          'BACKUP-CODE-001',
          'BACKUP-CODE-002',
          'BACKUP-CODE-003',
          'BACKUP-CODE-004',
          'BACKUP-CODE-005',
        ],
      };
    }

    const response = await api.post<TwoFactorSetupResponse>(API_ENDPOINTS.AUTH_TWO_FACTOR, { method });
    return response.data;
  }

  /**
   * Verify two-factor code
   */
  async verifyTwoFactor(code: string, method: 'authenticator' | 'sms' | 'email'): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      // Simulate invalid code
      if (code !== '123456' && code.length !== 6) {
        throw new Error('Invalid verification code');
      }

      console.log(`2FA verified with method: ${method}`);
      return;
    }

    await api.post('/auth/two-factor/verify', { code, method });
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(code: string): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      if (code !== '123456') {
        throw new Error('Invalid verification code');
      }

      console.log('2FA disabled');
      return;
    }

    await api.post('/auth/two-factor/disable', { code });
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    if (USE_MOCK) {
      await this.mockDelay(1000);
      
      // Create a mock URL
      return URL.createObjectURL(file);
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post<{ url: string }>(API_ENDPOINTS.USERS_AVATAR, formData);
    return response.data.url;
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      if (password !== 'password123') {
        throw new Error('Password is incorrect');
      }

      console.log('Account deleted');
      return;
    }

    await api.delete('/users/me', { data: { password } });
  }

  /**
   * Get active sessions
   */
  async getSessions(): Promise<Array<{
    id: string;
    deviceName: string;
    lastActiveAt: Date;
    isCurrent: boolean;
  }>> {
    if (USE_MOCK) {
      await this.mockDelay();
      return [
        {
          id: 'session_001',
          deviceName: 'Chrome on MacOS',
          lastActiveAt: new Date(),
          isCurrent: true,
        },
        {
          id: 'session_002',
          deviceName: 'Safari on iPhone',
          lastActiveAt: new Date(Date.now() - 86400000),
          isCurrent: false,
        },
      ];
    }

    const response = await api.get<Array<{
      id: string;
      deviceName: string;
      lastActiveAt: Date;
      isCurrent: boolean;
    }>>('/auth/sessions');
    return response.data;
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      console.log(`Session ${sessionId} revoked`);
      return;
    }

    await api.delete(`/auth/sessions/${sessionId}`);
  }

  /**
   * Mock delay helper
   */
  private mockDelay(ms = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const authService = new AuthService();

