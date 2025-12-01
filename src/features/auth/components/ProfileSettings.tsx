/**
 * Profile Settings Component
 * User profile management
 */

import { useState, useRef } from 'react';
import { useForm } from '../../../core/hooks/useForm';
import { useAuth } from '../context/AuthContext';
import { Button } from '../../../shared/components';
import { getInitials } from '../../../core/utils/string';
import type { UpdateProfileData } from '../types';

export function ProfileSettings() {
  const { state, updateProfile } = useAuth();
  const { user } = state;
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UpdateProfileData>({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      displayName: user?.displayName || '',
      username: user?.username || '',
      bio: '',
      timezone: user?.preferences.timezone || 'America/New_York',
      language: user?.preferences.language || 'en',
    },
    validationSchema: {
      firstName: {
        required: 'First name is required',
        minLength: { value: 2, message: 'First name must be at least 2 characters' },
      },
      lastName: {
        required: 'Last name is required',
        minLength: { value: 2, message: 'Last name must be at least 2 characters' },
      },
      displayName: {
        maxLength: { value: 100, message: 'Display name must be less than 100 characters' },
      },
      username: {
        minLength: { value: 3, message: 'Username must be at least 3 characters' },
        maxLength: { value: 30, message: 'Username must be less than 30 characters' },
        pattern: {
          value: /^[a-zA-Z0-9_-]+$/,
          message: 'Username can only contain letters, numbers, underscores, and hyphens',
        },
      },
    },
    onSubmit: async (values) => {
      try {
        await updateProfile(values);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        console.error('Failed to update profile:', error);
      }
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return <div className="loading-state">Loading...</div>;
  }

  return (
    <div className="profile-settings">
      <div className="settings-header">
        <h2 className="settings-title">Profile Settings</h2>
        <p className="settings-description">
          Manage your personal information and how others see you.
        </p>
      </div>

      <form onSubmit={form.handleSubmit} className="settings-form">
        {/* Avatar Section */}
        <div className="settings-section">
          <h3 className="section-title">Profile Photo</h3>
          <div className="avatar-section">
            <div className="avatar-preview">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  {getInitials(`${user.firstName} ${user.lastName}`)}
                </div>
              )}
            </div>
            <div className="avatar-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden-input"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="btn btn-secondary btn-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload Photo
              </label>
              {avatarPreview && (
                <Button variant="ghost" size="sm" onClick={handleRemoveAvatar}>
                  Remove
                </Button>
              )}
              {uploadError && <span className="input-error-text">{uploadError}</span>}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="settings-section">
          <h3 className="section-title">Personal Information</h3>
          
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="firstName" className="input-label">First Name</label>
              <input
                id="firstName"
                type="text"
                className={`input-field ${form.touched.firstName && form.errors.firstName ? 'input-error' : ''}`}
                {...form.register('firstName')}
              />
              {form.touched.firstName && form.errors.firstName && (
                <span className="input-error-text">{form.errors.firstName}</span>
              )}
            </div>

            <div className="input-group">
              <label htmlFor="lastName" className="input-label">Last Name</label>
              <input
                id="lastName"
                type="text"
                className={`input-field ${form.touched.lastName && form.errors.lastName ? 'input-error' : ''}`}
                {...form.register('lastName')}
              />
              {form.touched.lastName && form.errors.lastName && (
                <span className="input-error-text">{form.errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="displayName" className="input-label">
              Display Name <span className="label-optional">(optional)</span>
            </label>
            <input
              id="displayName"
              type="text"
              className={`input-field ${form.touched.displayName && form.errors.displayName ? 'input-error' : ''}`}
              placeholder="How you want to be called"
              {...form.register('displayName')}
            />
            {form.touched.displayName && form.errors.displayName && (
              <span className="input-error-text">{form.errors.displayName}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="username" className="input-label">Username</label>
            <div className="input-with-prefix">
              <span className="input-prefix">@</span>
              <input
                id="username"
                type="text"
                className={`input-field ${form.touched.username && form.errors.username ? 'input-error' : ''}`}
                {...form.register('username')}
              />
            </div>
            {form.touched.username && form.errors.username && (
              <span className="input-error-text">{form.errors.username}</span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="email" className="input-label">Email Address</label>
            <input
              id="email"
              type="email"
              className="input-field"
              value={user.email}
              disabled
            />
            <span className="input-hint">
              Contact support to change your email address
            </span>
          </div>

          <div className="input-group">
            <label htmlFor="bio" className="input-label">
              Bio <span className="label-optional">(optional)</span>
            </label>
            <textarea
              id="bio"
              className="input-field input-textarea"
              placeholder="Tell us a bit about yourself"
              rows={3}
              {...form.register('bio')}
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <h3 className="section-title">Preferences</h3>
          
          <div className="form-row">
            <div className="input-group">
              <label htmlFor="timezone" className="input-label">Timezone</label>
              <select
                id="timezone"
                className="input-field select-field"
                {...form.register('timezone')}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                <option value="Europe/Paris">Central European Time (CET)</option>
                <option value="Asia/Kolkata">India Standard Time (IST)</option>
                <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="language" className="input-label">Language</label>
              <select
                id="language"
                className="input-field select-field"
                {...form.register('language')}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          {saveSuccess && (
            <span className="success-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Changes saved successfully
            </span>
          )}
          <Button variant="secondary" type="button" onClick={() => form.handleReset()}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={form.isSubmitting}
            disabled={!form.isDirty || form.isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

