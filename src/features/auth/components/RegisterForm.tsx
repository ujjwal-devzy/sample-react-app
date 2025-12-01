/**
 * Register Form Component
 * Handles new user registration
 */

import { useState } from 'react';
import { useForm } from '../../../core/hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { validatePassword, getPasswordStrengthLabel } from '../../../core/utils/validation';
import { Button } from '../../../shared/components';
import type { RegisterData } from '../types';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

export function RegisterForm({ onSuccess, onLogin }: RegisterFormProps) {
  const { register: registerUser, state } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterData>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      username: '',
      acceptTerms: false,
    },
    validationSchema: {
      firstName: {
        required: 'First name is required',
        minLength: { value: 2, message: 'First name must be at least 2 characters' },
        maxLength: { value: 50, message: 'First name must be less than 50 characters' },
      },
      lastName: {
        required: 'Last name is required',
        minLength: { value: 2, message: 'Last name must be at least 2 characters' },
        maxLength: { value: 50, message: 'Last name must be less than 50 characters' },
      },
      email: {
        required: 'Email is required',
        email: 'Please enter a valid email',
      },
      password: {
        required: 'Password is required',
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
        required: 'Please confirm your password',
        custom: [
          (value: string) => {
            if (value !== form.values.password) {
              return { valid: false, error: 'Passwords do not match' };
            }
            return { valid: true };
          },
        ],
      },
      acceptTerms: {
        custom: [
          (value: boolean) => {
            if (!value) {
              return { valid: false, error: 'You must accept the terms and conditions' };
            }
            return { valid: true };
          },
        ],
      },
    },
    onSubmit: async (values) => {
      try {
        await registerUser(values);
        onSuccess?.();
      } catch {
        // Error handled by auth context
      }
    },
  });

  const passwordStrength = validatePassword(form.values.password);

  return (
    <div className="register-form-container">
      <div className="register-form-header">
        <h1 className="register-title">Create Account</h1>
        <p className="register-subtitle">Join TaskFlow Pro and start managing your projects</p>
      </div>

      <form onSubmit={form.handleSubmit} className="register-form">
        {state.error && (
          <div className="form-error-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
            </svg>
            <span>{state.error}</span>
          </div>
        )}

        <div className="form-row">
          <div className="input-group">
            <label htmlFor="firstName" className="input-label">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              className={`input-field ${form.touched.firstName && form.errors.firstName ? 'input-error' : ''}`}
              placeholder="John"
              autoComplete="given-name"
              {...form.register('firstName')}
            />
            {form.touched.firstName && form.errors.firstName && (
              <span className="input-error-text">{form.errors.firstName}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="lastName" className="input-label">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              className={`input-field ${form.touched.lastName && form.errors.lastName ? 'input-error' : ''}`}
              placeholder="Doe"
              autoComplete="family-name"
              {...form.register('lastName')}
            />
            {form.touched.lastName && form.errors.lastName && (
              <span className="input-error-text">{form.errors.lastName}</span>
            )}
          </div>
        </div>

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

        <div className="input-group">
          <label htmlFor="username" className="input-label">
            Username <span className="label-optional">(optional)</span>
          </label>
          <input
            id="username"
            type="text"
            className={`input-field ${form.touched.username && form.errors.username ? 'input-error' : ''}`}
            placeholder="johndoe"
            autoComplete="username"
            {...form.register('username')}
          />
          {form.touched.username && form.errors.username && (
            <span className="input-error-text">{form.errors.username}</span>
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
              placeholder="Create a strong password"
              autoComplete="new-password"
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
          
          {form.values.password && (
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
          
          {form.touched.password && form.errors.password && (
            <span className="input-error-text">{form.errors.password}</span>
          )}
        </div>

        <div className="input-group">
          <label htmlFor="confirmPassword" className="input-label">
            Confirm Password
          </label>
          <div className="input-with-icon">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              className={`input-field ${form.touched.confirmPassword && form.errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="Confirm your password"
              autoComplete="new-password"
              {...form.register('confirmPassword')}
            />
            <button
              type="button"
              className="input-icon-button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
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
          {form.touched.confirmPassword && form.errors.confirmPassword && (
            <span className="input-error-text">{form.errors.confirmPassword}</span>
          )}
        </div>

        <div className="input-group">
          <label className="checkbox-label terms-checkbox">
            <input
              type="checkbox"
              checked={form.values.acceptTerms}
              onChange={(e) => form.setFieldValue('acceptTerms', e.target.checked)}
            />
            <span className="checkbox-text">
              I agree to the{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
            </span>
          </label>
          {form.touched.acceptTerms && form.errors.acceptTerms && (
            <span className="input-error-text">{form.errors.acceptTerms}</span>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="register-submit-btn"
          isLoading={form.isSubmitting}
          disabled={!form.isValid || form.isSubmitting}
        >
          Create Account
        </Button>

        <p className="register-footer">
          Already have an account?{' '}
          <button type="button" className="link-button" onClick={onLogin}>
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
}

