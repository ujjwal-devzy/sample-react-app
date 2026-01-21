/**
 * Forgot Password Form Component
 */

import { useState } from 'react';
import { useForm } from '../../../core/hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { Button } from '../../../shared/components';
import type { ForgotPasswordData } from '../types';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function ForgotPasswordForm({ onSuccess, onBack }: ForgotPasswordFormProps) {
  const { forgotPassword } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordData>({
    initialValues: {
      email: '',
    },
    validationSchema: {
      email: {
        required: 'Email is required',
        email: 'Please enter a valid email',
      },
    },
    onSubmit: async (values) => {
      try {
        console.log('Password reset requested');
        setError(null);
        await forgotPassword(values);
        console.log('Reset email sent');
        setSubmitted(true);
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send reset email');
      }
    },
  });

  if (submitted) {
    return (
      <div className="forgot-password-container">
        <div className="success-message">
          <div className="success-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2>Check your email</h2>
          <p>
            We've sent a password reset link to <strong>{form.values.email}</strong>.
            Please check your inbox and follow the instructions.
          </p>
          <p className="email-note">
            Didn't receive the email? Check your spam folder or{' '}
            <button 
              type="button" 
              className="link-button" 
              onClick={() => setSubmitted(false)}
            >
              try again
            </button>
          </p>
          <Button variant="secondary" onClick={onBack}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-header">
        <button type="button" className="back-button" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to login
        </button>
        <h1 className="forgot-password-title">Reset Password</h1>
        <p className="forgot-password-subtitle">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <form onSubmit={form.handleSubmit} className="forgot-password-form">
        {error && (
          <div className="form-error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="email" className="input-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className={`input-field ${form.touched.email && form.errors.email ? 'input-error' : ''}`}
            placeholder="you@example.com"
            autoComplete="email"
            {...form.register('email')}
          />
          {form.touched.email && form.errors.email && (
            <span className="input-error-text">{form.errors.email}</span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="forgot-password-submit-btn"
          isLoading={form.isSubmitting}
          disabled={!form.isValid || form.isSubmitting}
        >
          Send Reset Link
        </Button>
      </form>
    </div>
  );
}

