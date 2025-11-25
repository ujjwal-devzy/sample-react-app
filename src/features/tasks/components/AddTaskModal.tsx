/**
 * AddTaskModal Component - Form for creating new tasks
 */

import { useState, type FormEvent } from 'react';
import { Modal, Button, Input, Select } from '../../../shared/components';
import type { CreateTaskDTO, TaskPriority } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateTaskDTO) => void;
}

const priorityOptions = [
  { value: 'low', label: '🟢 Low' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'high', label: '🟠 High' },
  { value: 'critical', label: '🔴 Critical' },
];

export function AddTaskModal({ isOpen, onClose, onSubmit }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignee, setAssignee] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignee: assignee.trim() || undefined,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setAssignee('');
    setTags('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form className="add-task-form" onSubmit={handleSubmit}>
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          required
          autoFocus
        />

        <Input
          label="Description"
          multiline
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task..."
          rows={3}
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
            placeholder="Who's responsible?"
          />
        </div>

        <Input
          label="Tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="frontend, bug, urgent (comma separated)"
        />

        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}

