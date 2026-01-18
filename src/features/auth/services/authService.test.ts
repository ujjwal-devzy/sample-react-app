import { describe, expect, it } from 'vitest';
import { authService } from './authService';

describe('authService', () => {
  it('logs in with mock mode and returns user + tokens', async () => {
    const result = await authService.login({
      email: 'john.doe@example.com',
      password: 'password123',
      rememberMe: true,
    });

    expect(result.user.email).toBe('john.doe@example.com');
    expect(result.tokens.accessToken.length).toBeGreaterThan(0);
    expect(result.tokens.refreshToken.length).toBeGreaterThan(0);
  });

  it('changePassword resolves with correct current password', async () => {
    await expect(authService.changePassword('password123', 'newPassword123!')).resolves.toBeUndefined();
  });

  it('changePassword rejects with incorrect current password', async () => {
    await expect(authService.changePassword('wrong', 'newPassword123!')).rejects.toThrow(
      'Current password is incorrect'
    );
  });
});

