/**
 * Team Settings Component
 * Settings panel for team configuration
 */

import { useState } from 'react';
import type { Team, UpdateTeamDTO } from '../types';
import { teamService } from '../services/teamService';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../shared/components/Card';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '../../../shared/components/Tabs';

interface TeamSettingsProps {
  team: Team;
  onUpdate?: (team: Team) => void;
  onDelete?: () => void;
  className?: string;
}

export function TeamSettings({
  team,
  onUpdate,
  onDelete,
  className = '',
}: TeamSettingsProps) {
  const [formData, setFormData] = useState<UpdateTeamDTO>({
    name: team.name,
    description: team.description ?? undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await teamService.updateTeam(team.id, formData);
      onUpdate?.(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      await teamService.deleteTeam(team.id);
      onDelete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`team-settings ${className}`}>
      <Tabs defaultTab="general">
        <TabList>
          <Tab id="general">General</Tab>
          <Tab id="permissions">Permissions</Tab>
          <Tab id="integrations">Integrations</Tab>
          <Tab id="danger">Danger Zone</Tab>
        </TabList>

        <TabPanels>
          <TabPanel id="general">
            <Card>
              <CardHeader>
                <CardTitle>Team Details</CardTitle>
              </CardHeader>
              <CardContent>
                {error && <div className="form-error-banner">{error}</div>}
                
                <Input
                  label="Team Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                
                <div className="form-group">
                  <label className="input-label">Description</label>
                  <textarea
                    className="input"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <Input
                  label="Department"
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isPrivate || false}
                      onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    />
                    <span>Private team</span>
                  </label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} isLoading={isLoading}>
                  {isSaved ? 'Saved!' : 'Save Changes'}
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>

          <TabPanel id="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Default Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="permissions-grid">
                  <div className="permission-item">
                    <div className="permission-info">
                      <strong>Create Projects</strong>
                      <p>Members can create new projects in this team</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                  
                  <div className="permission-item">
                    <div className="permission-info">
                      <strong>Invite Members</strong>
                      <p>Members can invite new people to the team</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                  
                  <div className="permission-item">
                    <div className="permission-info">
                      <strong>Manage Tasks</strong>
                      <p>Members can create, edit, and delete tasks</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                  
                  <div className="permission-item">
                    <div className="permission-info">
                      <strong>View Analytics</strong>
                      <p>Members can access team analytics</p>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel id="integrations">
            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="integrations-list">
                  <div className="integration-item">
                    <div className="integration-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
                      </svg>
                    </div>
                    <div className="integration-info">
                      <strong>GitHub</strong>
                      <p>Connect your GitHub repositories</p>
                    </div>
                    <Button variant="secondary" size="sm">Connect</Button>
                  </div>
                  
                  <div className="integration-item">
                    <div className="integration-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z" />
                        <path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                        <path d="M9.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.33 8 20.5v-5c0-.83.67-1.5 1.5-1.5z" />
                        <path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z" />
                        <path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" />
                        <path d="M15.5 19H14v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z" />
                        <path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z" />
                        <path d="M8.5 5H10V3.5C10 2.67 9.33 2 8.5 2S7 2.67 7 3.5 7.67 5 8.5 5z" />
                      </svg>
                    </div>
                    <div className="integration-info">
                      <strong>Slack</strong>
                      <p>Get notifications in Slack</p>
                    </div>
                    <Button variant="secondary" size="sm">Connect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabPanel>

          <TabPanel id="danger">
            <Card variant="outlined" className="danger-card">
              <CardHeader>
                <CardTitle>Delete Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="danger-text">
                  Once you delete a team, there is no going back. All projects, tasks, and data
                  associated with this team will be permanently deleted.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="danger" onClick={handleDelete} isLoading={isLoading}>
                  Delete Team
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
}
