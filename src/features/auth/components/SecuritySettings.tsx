/**
 * Security Settings Component
 * Password, 2FA, and session management
 */

import { useState, useEffect } from 'react';
import { useForm } from '../../../core/hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { useDisclosure } from '../../../core/hooks/useDisclosure';
import { validatePassword, getPasswordStrengthLabel } from '../../../core/utils/validation';
import { formatRelativeTime } from '../../../core/utils/date';
import { Button, Modal } from '../../../shared/components';
import { authService } from '../services/authService';
import type { ChangePasswordData, TwoFactorSetupResponse, Session } from '../types';

export function SecuritySettings() {
  const { state, changePassword, setupTwoFactor, verifyTwoFactor, disableTwoFactor } = useAuth();
  const { user } = state;
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);

  const changePasswordModal = useDisclosure();
  const twoFactorModal = useDisclosure();
  const disableTwoFactorModal = useDisclosure();
  const revokeSessionModal = useDisclosure();
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);

  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await authService.getSessions();
        setSessions(data as unknown as Session[]);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, []);

  // Change password form
  const passwordForm = useForm<ChangePasswordData>({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: {
      currentPassword: {
        required: 'Current password is required',
      },
      newPassword: {
        required: 'New password is required',
        custom: [
          (value: string) => {
            const strength = validatePassword(value);
            if (!strength.isValid) {
              return { valid: false, error: strength.feedback[0] || 'Password is too weak' };
            }
            return { valid: true };
          },
        ],
      },
      confirmPassword: {
        required: 'Please confirm your new password',
        custom: [
          (value: string) => {
            if (value !== passwordForm.values.newPassword) {
              return { valid: false, error: 'Passwords do not match' };
            }
            return { valid: true };
          },
        ],
      },
    },
    onSubmit: async (values) => {
      try {
        await changePassword(values);
        changePasswordModal.close();
        passwordForm.handleReset();
      } catch {
        // Error handled by form
      }
    },
  });

  const passwordStrength = validatePassword(passwordForm.values.newPassword);

  // Handle 2FA setup
  const handleSetupTwoFactor = async () => {
    try {
      setSetupError(null);
      const response = await setupTwoFactor({ method: 'authenticator' });
      setTwoFactorSetup(response);
      twoFactorModal.open();
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : 'Failed to setup 2FA');
    }
  };

  // Handle 2FA verification
  const handleVerifyTwoFactor = async () => {
    try {
      setSetupError(null);
      await verifyTwoFactor({ code: verificationCode, method: 'authenticator' });
      setTwoFactorSetup(null);
      setVerificationCode('');
      twoFactorModal.close();
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : 'Invalid verification code');
    }
  };

  // Handle 2FA disable
  const handleDisableTwoFactor = async () => {
    try {
      setSetupError(null);
      await disableTwoFactor(verificationCode);
      setVerificationCode('');
      disableTwoFactorModal.close();
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : 'Invalid verification code');
    }
  };

  // Handle session revoke
  const handleRevokeSession = async () => {
    if (!sessionToRevoke) return;
    
    try {
      await authService.revokeSession(sessionToRevoke);
      setSessions(prev => prev.filter(s => s.id !== sessionToRevoke));
      setSessionToRevoke(null);
      revokeSessionModal.close();
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  };

  if (!user) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="security-settings">
      <div className="settings-header">
        <h2 className="settings-title">Security Settings</h2>
        <p className="settings-description">
          Manage your password, two-factor authentication, and active sessions.
        </p>
      </div>

      {/* Password Section */}
      <div className="settings-section">
        <h3 className="section-title">Password</h3>
        <div className="security-card">
          <div className="security-card-content">
            <div className="security-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div className="security-card-info">
              <h4>Password</h4>
              <p>Last changed 30 days ago</p>
            </div>
          </div>
          <Button variant="secondary" onClick={changePasswordModal.open}>
            Change Password
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="settings-section">
        <h3 className="section-title">Two-Factor Authentication</h3>
        <div className="security-card">
          <div className="security-card-content">
            <div className={`security-card-icon ${user.twoFactorEnabled ? 'enabled' : ''}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                {user.twoFactorEnabled && <polyline points="9 12 11 14 15 10" />}
              </svg>
            </div>
            <div className="security-card-info">
              <h4>Two-Factor Authentication</h4>
              <p>
                {user.twoFactorEnabled 
                  ? 'Enabled - Your account has an extra layer of security' 
                  : 'Add an extra layer of security to your account'}
              </p>
            </div>
          </div>
          {user.twoFactorEnabled ? (
            <Button variant="danger" onClick={disableTwoFactorModal.open}>
              Disable 2FA
            </Button>
          ) : (
            <Button onClick={handleSetupTwoFactor}>
              Enable 2FA
            </Button>
          )}
        </div>
        {setupError && !twoFactorModal.isOpen && !disableTwoFactorModal.isOpen && (
          <div className="form-error-banner">{setupError}</div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="settings-section">
        <h3 className="section-title">Active Sessions</h3>
        {loadingSessions ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <span>Loading sessions...</span>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.map((session) => (
              <div key={session.id} className="session-item">
                <div className="session-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div className="session-info">
                  <h4 className="session-device">
                    {session.deviceName}
                    {session.isCurrent && <span className="current-badge">Current</span>}
                  </h4>
                  <p className="session-meta">
                    Last active {formatRelativeTime(session.lastActiveAt)}
                  </p>
                </div>
                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSessionToRevoke(session.id);
                      revokeSessionModal.open();
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={changePasswordModal.isOpen}
        onClose={changePasswordModal.close}
        title="Change Password"
      >
        <form onSubmit={passwordForm.handleSubmit} className="modal-form">
          <div className="input-group">
            <label htmlFor="currentPassword" className="input-label">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              className={`input-field ${passwordForm.touched.currentPassword && passwordForm.errors.currentPassword ? 'input-error' : ''}`}
              {...passwordForm.register('currentPassword')}
            />
            {passwordForm.touched.currentPassword && passwordForm.errors.currentPassword && (
              <span className="input-error-text">{passwordForm.errors.currentPassword}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="newPassword" className="input-label">New Password</label>
            <input
              id="newPassword"
              type="password"
              className={`input-field ${passwordForm.touched.newPassword && passwordForm.errors.newPassword ? 'input-error' : ''}`}
              {...passwordForm.register('newPassword')}
            />
            {passwordForm.values.newPassword && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill strength-${passwordStrength.score}`}
                    style={{ width: `${(passwordStrength.score + 1) * 20}%` }}
                  />
                </div>
                <span className={`strength-label strength-${passwordStrength.score}`}>
                  {getPasswordStrengthLabel(passwordStrength.score)}
                </span>
              </div>
            )}
            {passwordForm.touched.newPassword && passwordForm.errors.newPassword && (
              <span className="input-error-text">{passwordForm.errors.newPassword}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword" className="input-label">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              className={`input-field ${passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword ? 'input-error' : ''}`}
              {...passwordForm.register('confirmPassword')}
            />
            {passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword && (
              <span className="input-error-text">{passwordForm.errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-actions">
            <Button variant="secondary" onClick={changePasswordModal.close} type="button">
              Cancel
            </Button>
            <Button type="submit" isLoading={passwordForm.isSubmitting}>
              Change Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2FA Setup Modal */}
      <Modal
        isOpen={twoFactorModal.isOpen}
        onClose={() => {
          twoFactorModal.close();
          setTwoFactorSetup(null);
          setVerificationCode('');
          setSetupError(null);
        }}
        title="Setup Two-Factor Authentication"
      >
        {twoFactorSetup && (
          <div className="two-factor-setup">
            <div className="setup-steps">
              <div className="setup-step">
                <span className="step-number">1</span>
                <div className="step-content">
                  <h4>Download an authenticator app</h4>
                  <p>Use Google Authenticator, Authy, or 1Password</p>
                </div>
              </div>
              
              <div className="setup-step">
                <span className="step-number">2</span>
                <div className="step-content">
                  <h4>Scan this QR code</h4>
                  <div className="qr-code">
                    <img src={twoFactorSetup.qrCode} alt="2FA QR Code" />
                  </div>
                  <p className="secret-key">
                    Or enter this code manually: <code>{twoFactorSetup.secret}</code>
                  </p>
                </div>
              </div>
              
              <div className="setup-step">
                <span className="step-number">3</span>
                <div className="step-content">
                  <h4>Enter verification code</h4>
                  <input
                    type="text"
                    className="input-field verification-input"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            </div>

            {setupError && (
              <div className="form-error-banner">{setupError}</div>
            )}

            <div className="backup-codes-warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
              </svg>
              <p>
                <strong>Save your backup codes!</strong> You'll need them if you lose access to your authenticator app.
              </p>
            </div>

            <div className="backup-codes">
              {twoFactorSetup.backupCodes.map((code, index) => (
                <code key={index}>{code}</code>
              ))}
            </div>

            <div className="form-actions">
              <Button variant="secondary" onClick={() => {
                twoFactorModal.close();
                setTwoFactorSetup(null);
                setVerificationCode('');
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleVerifyTwoFactor}
                disabled={verificationCode.length !== 6}
              >
                Enable 2FA
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        isOpen={disableTwoFactorModal.isOpen}
        onClose={() => {
          disableTwoFactorModal.close();
          setVerificationCode('');
          setSetupError(null);
        }}
        title="Disable Two-Factor Authentication"
      >
        <div className="disable-2fa">
          <div className="warning-banner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
            </svg>
            <p>
              Disabling two-factor authentication will make your account less secure. 
              Are you sure you want to continue?
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">Enter your 2FA code to confirm</label>
            <input
              type="text"
              className="input-field verification-input"
              placeholder="000000"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          {setupError && (
            <div className="form-error-banner">{setupError}</div>
          )}

          <div className="form-actions">
            <Button variant="secondary" onClick={() => {
              disableTwoFactorModal.close();
              setVerificationCode('');
            }}>
              Cancel
            </Button>
            <Button 
              variant="danger"
              onClick={handleDisableTwoFactor}
              disabled={verificationCode.length !== 6}
            >
              Disable 2FA
            </Button>
          </div>
        </div>
      </Modal>

      {/* Revoke Session Modal */}
      <Modal
        isOpen={revokeSessionModal.isOpen}
        onClose={() => {
          revokeSessionModal.close();
          setSessionToRevoke(null);
        }}
        title="Revoke Session"
      >
        <div className="revoke-session">
          <p>
            Are you sure you want to revoke this session? The device will be logged out immediately.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => {
              revokeSessionModal.close();
              setSessionToRevoke(null);
            }}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevokeSession}>
              Revoke Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

