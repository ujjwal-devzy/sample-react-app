/**
 * Project Settings Component
 * Configure project settings, members, and workflow
 */

import { useState, useEffect } from 'react';
import { useForm } from '../../../core/hooks/useForm';
import { useProjects } from '../context/ProjectContext';
import { useDisclosure } from '../../../core/hooks/useDisclosure';
import { Button, Modal } from '../../../shared/components';
import { COLORS } from '../../../core/constants';
import { formatRelativeTime } from '../../../core/utils/date';
import { getInitials } from '../../../core/utils/string';
import type { UpdateProjectDTO, ProjectMember, ProjectRole } from '../types';

interface ProjectSettingsProps {
  projectId: string;
}

const EMOJI_OPTIONS = [
  '📁', '📂', '📋', '📊', '📈', '🎯', '🚀', '💻', '🌐', '📱',
  '🛠️', '⚙️', '🔧', '🎨', '📝', '📚', '🔒', '💡', '🎮', '🏆',
];

export function ProjectSettings({ projectId }: ProjectSettingsProps) {
  const { 
    currentProject, 
    loadProject, 
    updateProject, 
    loadProjectMembers,
    removeProjectMember,
    updateProjectMember,
    deleteProject,
    archiveProject,
  } = useProjects();

  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'workflow' | 'danger'>('general');
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const addMemberModal = useDisclosure();
  const deleteModal = useDisclosure();
  const archiveModal = useDisclosure();

  // Load project data
  useEffect(() => {
    loadProject(projectId);
  }, [projectId, loadProject]);

  // Load members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await loadProjectMembers(projectId);
        setMembers(data);
      } catch (error) {
        console.error('Failed to load members:', error);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [projectId, loadProjectMembers]);

  const form = useForm<UpdateProjectDTO>({
    initialValues: {
      name: currentProject?.name || '',
      description: currentProject?.description || '',
      visibility: currentProject?.visibility || 'team',
      priority: currentProject?.priority || 'medium',
      iconEmoji: currentProject?.iconEmoji || '📁',
      color: currentProject?.color || '#6366f1',
      tags: currentProject?.tags || [],
    },
    onSubmit: async (values) => {
      try {
        await updateProject(projectId, values);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (error) {
        console.error('Failed to update project:', error);
      }
    },
  });

  // Update form when project loads
  useEffect(() => {
    if (currentProject) {
      form.setValues({
        name: currentProject.name,
        description: currentProject.description || '',
        visibility: currentProject.visibility,
        priority: currentProject.priority,
        iconEmoji: currentProject.iconEmoji,
        color: currentProject.color,
        tags: currentProject.tags,
      });
    }
  }, [currentProject, form]);

  const handleRoleChange = async (userId: string, newRole: ProjectRole) => {
    try {
      await updateProjectMember(projectId, userId, { role: newRole });
      setMembers(prev => 
        prev.map(m => m.userId === userId ? { ...m, role: newRole } : m)
      );
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeProjectMember(projectId, userId);
      setMembers(prev => prev.filter(m => m.userId !== userId));
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleArchive = async () => {
    try {
      await archiveProject(projectId);
      archiveModal.close();
      window.location.href = '/projects';
    } catch (error) {
      console.error('Failed to archive project:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(projectId);
      deleteModal.close();
      window.location.href = '/projects';
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (!currentProject) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading project...</span>
      </div>
    );
  }

  return (
    <div className="project-settings">
      <div className="settings-header">
        <div className="settings-title-section">
          <h2 className="settings-title">Project Settings</h2>
          <p className="settings-subtitle">{currentProject.name}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`settings-tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button
          className={`settings-tab ${activeTab === 'workflow' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflow')}
        >
          Workflow
        </button>
        <button
          className={`settings-tab danger ${activeTab === 'danger' ? 'active' : ''}`}
          onClick={() => setActiveTab('danger')}
        >
          Danger Zone
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <form onSubmit={form.handleSubmit} className="settings-form">
          <div className="settings-section">
            <h3 className="section-title">Project Appearance</h3>
            
            <div className="project-appearance">
              <div 
                className="project-icon-large"
                style={{ 
                  backgroundColor: `${form.values.color}20`,
                  color: form.values.color,
                }}
              >
                {form.values.iconEmoji}
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
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="section-title">Project Information</h3>

            <div className="input-group">
              <label htmlFor="name" className="input-label">Project Name</label>
              <input
                id="name"
                type="text"
                className="input-field"
                {...form.register('name')}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Project Key</label>
              <input
                type="text"
                className="input-field"
                value={currentProject.key}
                disabled
              />
              <span className="input-hint">Project key cannot be changed</span>
            </div>

            <div className="input-group">
              <label htmlFor="description" className="input-label">Description</label>
              <textarea
                id="description"
                className="input-field input-textarea"
                rows={4}
                {...form.register('description')}
              />
            </div>
          </div>

          <div className="settings-section">
            <h3 className="section-title">Access & Priority</h3>

            <div className="form-row">
              <div className="input-group">
                <label htmlFor="visibility" className="input-label">Visibility</label>
                <select
                  id="visibility"
                  className="input-field select-field"
                  {...form.register('visibility')}
                >
                  <option value="private">Private</option>
                  <option value="team">Team</option>
                  <option value="organization">Organization</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="priority" className="input-label">Priority</label>
                <select
                  id="priority"
                  className="input-field select-field"
                  {...form.register('priority')}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            {saveSuccess && (
              <span className="success-message">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Changes saved
              </span>
            )}
            <Button variant="secondary" type="button" onClick={() => form.handleReset()}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={form.isSubmitting}
              disabled={!form.isDirty}
            >
              Save Changes
            </Button>
          </div>
        </form>
      )}

      {/* Members Settings */}
      {activeTab === 'members' && (
        <div className="settings-form">
          <div className="settings-section">
            <div className="section-header">
              <h3 className="section-title">Project Members</h3>
              <Button size="sm" onClick={addMemberModal.open}>
                Add Member
              </Button>
            </div>

            {loadingMembers ? (
              <div className="loading-state">
                <div className="loading-spinner" />
                <span>Loading members...</span>
              </div>
            ) : (
              <div className="members-list">
                {members.map(member => (
                  <div key={member.userId} className="member-item">
                    <div className="member-avatar">
                      {getInitials(`User ${member.userId.slice(-3)}`)}
                    </div>
                    <div className="member-info">
                      <span className="member-name">User {member.userId.slice(-3)}</span>
                      <span className="member-meta">
                        Joined {formatRelativeTime(member.joinedAt)}
                      </span>
                    </div>
                    <select
                      className="role-select"
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.userId, e.target.value as ProjectRole)}
                      disabled={member.role === 'owner'}
                    >
                      <option value="owner" disabled>Owner</option>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    {member.role !== 'owner' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Workflow Settings */}
      {activeTab === 'workflow' && (
        <div className="settings-form">
          <div className="settings-section">
            <h3 className="section-title">Workflow Stages</h3>
            <p className="section-description">
              Customize the stages tasks move through in this project.
            </p>

            <div className="workflow-stages">
              {currentProject.settings.workflowStages.map((stage, index) => (
                <div key={stage.id} className="workflow-stage">
                  <div 
                    className="stage-indicator" 
                    style={{ backgroundColor: stage.color }} 
                  />
                  <span className="stage-name">{stage.name}</span>
                  <span className="stage-order">#{index + 1}</span>
                  {stage.isDefault && (
                    <span className="stage-badge default">Default</span>
                  )}
                  {stage.isCompleted && (
                    <span className="stage-badge completed">Completed</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <h3 className="section-title">Project Features</h3>
            
            <div className="feature-toggles">
              <label className="feature-toggle">
                <input 
                  type="checkbox" 
                  checked={currentProject.settings.enableSubtasks} 
                  onChange={() => {}}
                />
                <div className="feature-info">
                  <span className="feature-name">Subtasks</span>
                  <span className="feature-description">Break tasks into smaller items</span>
                </div>
              </label>

              <label className="feature-toggle">
                <input 
                  type="checkbox" 
                  checked={currentProject.settings.enableTimeTracking} 
                  onChange={() => {}}
                />
                <div className="feature-info">
                  <span className="feature-name">Time Tracking</span>
                  <span className="feature-description">Track time spent on tasks</span>
                </div>
              </label>

              <label className="feature-toggle">
                <input 
                  type="checkbox" 
                  checked={currentProject.settings.enableEstimates} 
                  onChange={() => {}}
                />
                <div className="feature-info">
                  <span className="feature-name">Estimates</span>
                  <span className="feature-description">Add time estimates to tasks</span>
                </div>
              </label>

              <label className="feature-toggle">
                <input 
                  type="checkbox" 
                  checked={currentProject.settings.enableDependencies} 
                  onChange={() => {}}
                />
                <div className="feature-info">
                  <span className="feature-name">Dependencies</span>
                  <span className="feature-description">Link tasks that depend on each other</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {activeTab === 'danger' && (
        <div className="settings-form">
          <div className="settings-section danger-section">
            <h3 className="section-title danger">Danger Zone</h3>
            
            <div className="danger-action">
              <div className="danger-action-info">
                <h4>Archive this project</h4>
                <p>Mark this project as archived. You can restore it later.</p>
              </div>
              <Button variant="secondary" onClick={archiveModal.open}>
                Archive Project
              </Button>
            </div>

            <div className="danger-action">
              <div className="danger-action-info">
                <h4>Delete this project</h4>
                <p>Permanently delete this project and all its data. This cannot be undone.</p>
              </div>
              <Button variant="danger" onClick={deleteModal.open}>
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      <Modal
        isOpen={archiveModal.isOpen}
        onClose={archiveModal.close}
        title="Archive Project"
      >
        <div className="confirm-modal">
          <p>
            Are you sure you want to archive <strong>{currentProject.name}</strong>?
            The project will be hidden but can be restored later.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={archiveModal.close}>Cancel</Button>
            <Button onClick={handleArchive}>Archive Project</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Delete Project"
      >
        <div className="confirm-modal">
          <div className="warning-banner danger">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" />
            </svg>
            <p>
              This action <strong>cannot be undone</strong>. This will permanently delete 
              the <strong>{currentProject.name}</strong> project and all of its tasks, 
              comments, and files.
            </p>
          </div>
          <div className="input-group">
            <label className="input-label">
              Type <strong>{currentProject.key}</strong> to confirm
            </label>
            <input type="text" className="input-field" placeholder={currentProject.key} />
          </div>
          <div className="form-actions">
            <Button variant="secondary" onClick={deleteModal.close}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete Project</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

