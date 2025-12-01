/**
 * Create Team Modal Component
 * Modal for creating a new team
 */

import { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { teamService } from '../services/teamService';
import type { CreateTeamDTO, Team } from '../types';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (team: Team) => void;
  organizationId?: string;
}

export function CreateTeamModal({
  isOpen,
  onClose,
  onSuccess,
  organizationId,
}: CreateTeamModalProps) {
  const [formData, setFormData] = useState<CreateTeamDTO>({
    name: '',
    description: '',
    organizationId: organizationId || 'org_001',
    isPrivate: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Team name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const team = await teamService.createTeam(formData);
      onSuccess?.(team);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      organizationId: organizationId || 'org_001',
      isPrivate: false,
    });
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Team">
      <form onSubmit={handleSubmit} className="create-team-form">
        {error && (
          <div className="form-error-banner">{error}</div>
        )}

        <Input
          label="Team Name"
          placeholder="e.g., Engineering, Design, Marketing"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <div className="form-group">
          <label className="input-label">Description</label>
          <textarea
            className="input"
            placeholder="What does this team do?"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <Input
          label="Department (optional)"
          placeholder="e.g., Product, Engineering"
          value={formData.department || ''}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
        />

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
            />
            <span>Make this team private</span>
          </label>
          <p className="form-help-text">
            Private teams are only visible to their members
          </p>
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Team
          </Button>
        </div>
      </form>
    </Modal>
  );
}

