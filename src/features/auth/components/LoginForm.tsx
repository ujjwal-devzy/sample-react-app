/**
 * Login Form Component
 * Handles user authentication
 */

import { useState } from 'react';
import { useForm } from '../../../core/hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { Button } from '../../../shared/components';
import type { LoginCredentials } from '../types';

interface LoginFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

export function LoginForm({ onSuccess, onForgotPassword, onRegister }: LoginFormProps) {
  const { login, state } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginCredentials>({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: {
      email: {
        required: 'Email is required',
        email: 'Please enter a valid email',
      },
      password: {
        required: 'Password is required',
        minLength: { value: 6, message: 'Password must be at least 6 characters' },
      },
    },
    onSubmit: async (values) => {
      try {
        await login(values);
        onSuccess?.();
      } catch {
        // Error is handled by auth context
      }
    },
  });

  return (
    <div className="login-form-container">
      <div className="login-form-header">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue to TaskFlow Pro</p>
      </div>

      <form onSubmit={form.handleSubmit} className="login-form">
        {state.error && (
          <div className="form-error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
            </svg>
            <span>{state.error}</span>
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
            <span className="input-error-text" id="email-error">
              {form.errors.email}
            </span>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="password" className="input-label">
            Password
          </label>
          <div className="input-with-icon">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`input-field ${form.touched.password && form.errors.password ? 'input-error' : ''}`}
              placeholder="Enter your password"
              autoComplete="current-password"
              {...form.register('password')}
            />
            <button
              type="button"
              className="input-icon-button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {form.touched.password && form.errors.password && (
            <span className="input-error-text" id="password-error">
              {form.errors.password}
            </span>
          )}
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.values.rememberMe}
              onChange={(e) => form.setFieldValue('rememberMe', e.target.checked)}
            />
            <span className="checkbox-text">Remember me</span>
          </label>
          <button
            type="button"
            className="link-button"
            onClick={onForgotPassword}
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="login-submit-btn"
          isLoading={form.isSubmitting}
          disabled={!form.isValid || form.isSubmitting}
        >
          Sign In
        </Button>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-login-buttons">
          <button type="button" className="social-login-btn google">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button" className="social-login-btn github">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        <p className="login-footer">
          Don't have an account?{' '}
          <button type="button" className="link-button" onClick={onRegister}>
            Sign up for free
          </button>
        </p>
      </form>
    </div>
  );
}

