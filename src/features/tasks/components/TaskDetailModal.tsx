/**
 * TaskDetailModal Component - View/Edit task details
 */

import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../../../shared/components';
import type { Task, TaskPriority, UpdateTaskDTO } from '../types';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  onUpdate: (id: string, dto: UpdateTaskDTO) => void;
  onDelete: (id: string) => void;
}

const priorityOptions = [
  { value: 'low', label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high', label: '🟠 High' },
  { value: 'critical', label: '🔴 Critical' },
];

export function TaskDetailModal({ task, onClose, onUpdate, onDelete }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignee, setAssignee] = useState('');
  const [tags, setTags] = useState('');

  // Sync form with task data
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setAssignee(task.assignee || '');
      setTags(task.tags.join(', '));
      setIsEditing(false);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    onUpdate(task.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assignee.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  };

  return (
    <Modal isOpen={!!task} onClose={onClose} title={isEditing ? 'Edit Task' : 'Task Details'}>
      <div className="task-detail">
        {isEditing ? (
          <div className="task-detail-form">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Description"
              multiline
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <div className="form-row">
              <Select
                label="Priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                options={priorityOptions}
              />
              <Input
                label="Assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </div>
            <Input
              label="Tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Comma separated"
            />
          </div>
        ) : (
          <div className="task-detail-view">
            <h3 className="detail-title">{task.title}</h3>
            <p className="detail-description">{task.description || 'No description provided.'}</p>
            
            <div className="detail-meta">
              <div className="meta-item">
                <span className="meta-label">Priority</span>
                <span className={`meta-value priority-badge priority-${task.priority}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Assignee</span>
                <span className="meta-value">{task.assignee || 'Unassigned'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Status</span>
                <span className="meta-value status-badge">{task.status.replace('_', ' ')}</span>
              </div>
            </div>

            {task.tags.length > 0 && (
              <div className="detail-tags">
                <span className="meta-label">Tags</span>
                <div className="tags-list">
                  {task.tags.map(tag => (
                    <span key={tag} className="task-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-dates">
              <span>Created: {formatDate(task.createdAt)}</span>
              <span>Updated: {formatDate(task.updatedAt)}</span>
            </div>
          </div>
        )}

        <div className="detail-actions">
          {isEditing ? (
            <>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </>
          ) : (
            <>
              <Button variant="danger" onClick={handleDelete}>Delete</Button>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

