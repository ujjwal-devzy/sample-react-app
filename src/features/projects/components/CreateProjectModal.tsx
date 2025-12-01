/**
 * Create Project Modal Component
 */

import { useState } from 'react';
import { useForm } from '../../../core/hooks/useForm';
import { useProjects } from '../context/ProjectContext';
import { Button, Modal } from '../../../shared/components';
import { generateProjectKey } from '../../../core/utils/id';
import { COLORS } from '../../../core/constants';
import type { CreateProjectDTO } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

const EMOJI_OPTIONS = [
  '📁', '📂', '📋', '📊', '📈', '🎯', '🚀', '💻', '🌐', '📱',
  '🛠️', '⚙️', '🔧', '🎨', '📝', '📚', '🔒', '💡', '🎮', '🏆',
];

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const { projects, createProject } = useProjects();
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const existingKeys = projects.map(p => p.key);

  const form = useForm<CreateProjectDTO>({
    initialValues: {
      name: '',
      key: '',
      description: '',
      teamId: 'team_001', // Default team
      visibility: 'team',
      priority: 'medium',
      iconEmoji: '📁',
      color: COLORS.primary,
      tags: [],
    },
    validationSchema: {
      name: {
        required: 'Project name is required',
        minLength: { value: 2, message: 'Name must be at least 2 characters' },
        maxLength: { value: 100, message: 'Name must be less than 100 characters' },
      },
      key: {
        required: 'Project key is required',
        pattern: {
          value: /^[A-Z0-9]{2,10}$/,
          message: 'Key must be 2-10 uppercase letters or numbers',
        },
        custom: [
          (value) => {
            if (existingKeys.includes(value)) {
              return { valid: false, error: 'This key is already in use' };
            }
            return { valid: true };
          },
        ],
      },
    },
    onSubmit: async (values) => {
      try {
        setError(null);
        const project = await createProject(values);
        onClose();
        onSuccess?.(project.id);
        form.handleReset();
        setStep(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create project');
      }
    },
  });

  const handleNameChange = (name: string) => {
    form.setFieldValue('name', name);
    
    // Auto-generate key if not manually edited
    if (!form.touched.key) {
      const key = generateProjectKey(name, existingKeys);
      form.setFieldValue('key', key);
    }
  };

  const handleClose = () => {
    form.handleReset();
    setStep(1);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Create New Project' : 'Project Details'}
    >
      <form onSubmit={form.handleSubmit} className="create-project-form">
        {error && (
          <div className="form-error-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <>
            {/* Icon & Color Selection */}
            <div className="project-appearance">
              <div className="icon-color-preview">
                <div 
                  className="project-icon-large"
                  style={{ 
                    backgroundColor: `${form.values.color}20`,
                    color: form.values.color,
                  }}
                >
                  {form.values.iconEmoji}
                </div>
              </div>

              <div className="appearance-options">
                <div className="input-group">
                  <label className="input-label">Icon</label>
                  <div className="emoji-grid">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        className={`emoji-btn ${form.values.iconEmoji === emoji ? 'selected' : ''}`}
                        onClick={() => form.setFieldValue('iconEmoji', emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Color</label>
                  <div className="color-grid">
                    {COLORS.projectColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-btn ${form.values.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => form.setFieldValue('color', color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Name */}
            <div className="input-group">
              <label htmlFor="projectName" className="input-label">
                Project Name
              </label>
              <input
                id="projectName"
                type="text"
                className={`input-field ${form.touched.name && form.errors.name ? 'input-error' : ''}`}
                placeholder="My Awesome Project"
                value={form.values.name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => form.setFieldTouched('name')}
              />
              {form.touched.name && form.errors.name && (
                <span className="input-error-text">{form.errors.name}</span>
              )}
            </div>

            {/* Project Key */}
            <div className="input-group">
              <label htmlFor="projectKey" className="input-label">
                Project Key
              </label>
              <input
                id="projectKey"
                type="text"
                className={`input-field ${form.touched.key && form.errors.key ? 'input-error' : ''}`}
                placeholder="PROJ"
                value={form.values.key}
                onChange={(e) => form.setFieldValue('key', e.target.value.toUpperCase())}
                onBlur={() => form.setFieldTouched('key')}
                maxLength={10}
              />
              <span className="input-hint">
                Used for task IDs (e.g., {form.values.key || 'PROJ'}-123)
              </span>
              {form.touched.key && form.errors.key && (
                <span className="input-error-text">{form.errors.key}</span>
              )}
            </div>

            {/* Description */}
            <div className="input-group">
              <label htmlFor="description" className="input-label">
                Description <span className="label-optional">(optional)</span>
              </label>
              <textarea
                id="description"
                className="input-field input-textarea"
                placeholder="What's this project about?"
                rows={3}
                value={form.values.description}
                onChange={(e) => form.setFieldValue('description', e.target.value)}
              />
            </div>

            <div className="form-actions">
              <Button variant="secondary" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={() => setStep(2)}
                disabled={!form.values.name || !form.values.key || !!form.errors.name || !!form.errors.key}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Visibility */}
            <div className="input-group">
              <label className="input-label">Visibility</label>
              <div className="radio-group">
                {[
                  { value: 'private', label: 'Private', description: 'Only project members can access' },
                  { value: 'team', label: 'Team', description: 'All team members can view' },
                  { value: 'organization', label: 'Organization', description: 'Everyone in the organization can view' },
                ].map(option => (
                  <label key={option.value} className="radio-option">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={form.values.visibility === option.value}
                      onChange={(e) => form.setFieldValue('visibility', e.target.value as typeof form.values.visibility)}
                    />
                    <div className="radio-content">
                      <span className="radio-label">{option.label}</span>
                      <span className="radio-description">{option.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="input-group">
              <label htmlFor="priority" className="input-label">Priority</label>
              <select
                id="priority"
                className="input-field select-field"
                value={form.values.priority}
                onChange={(e) => form.setFieldValue('priority', e.target.value as typeof form.values.priority)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Dates */}
            <div className="form-row">
              <div className="input-group">
                <label htmlFor="startDate" className="input-label">
                  Start Date <span className="label-optional">(optional)</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="input-field"
                  value={form.values.startDate ? new Date(form.values.startDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => form.setFieldValue('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>

              <div className="input-group">
                <label htmlFor="targetDate" className="input-label">
                  Target Date <span className="label-optional">(optional)</span>
                </label>
                <input
                  id="targetDate"
                  type="date"
                  className="input-field"
                  value={form.values.targetDate ? new Date(form.values.targetDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => form.setFieldValue('targetDate', e.target.value ? new Date(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="form-actions">
              <Button variant="ghost" type="button" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="secondary" type="button" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                isLoading={form.isSubmitting}
              >
                Create Project
              </Button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}

