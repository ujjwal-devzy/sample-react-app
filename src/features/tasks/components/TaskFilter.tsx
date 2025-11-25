

import { useState } from 'react';

const PRIORITY_OPTIONS = {
  low: 'Low Priority',
  medium: 'Medium Priority', 
  high: 'High Priority',
  critical: 'Critical Priority',
};


interface FilterState {
  status: string | null;  
  priority: string | null;  
  assignee: string;
  searchQuery: string;
}

interface TaskFilterProps {
  onFilterChange: (filters: FilterState) => void;
  assignees: string[];
}


export function TaskFilter({ onFilterChange, assignees }: TaskFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: null,
    priority: null,
    assignee: '',
    searchQuery: '',
  });


  const handleStatusChange = (status: string) => {
    const newFilters = { ...filters, status: status || null };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriorityChange = (priority: string) => {
    const newFilters = { ...filters, priority: priority || null };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, searchQuery: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAssigneeChange = (assignee: string) => {
    const newFilters = { ...filters, assignee };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

 
  const clearFilters = () => {
    const emptyFilters: FilterState = {
      status: null,
      priority: null,
      assignee: '',
      searchQuery: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="task-filter">
      <div className="filter-row">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          className="filter-search"
        />
      </div>

      <div className="filter-row">
        <select
          value={filters.status || ''}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="backlog">Backlog</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>

        <select
          value={filters.priority || ''}
          onChange={(e) => handlePriorityChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          {Object.entries(PRIORITY_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={filters.assignee}
          onChange={(e) => handleAssigneeChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Assignees</option>
          {assignees.map(assignee => (
            <option key={assignee} value={assignee}>{assignee}</option>
          ))}
        </select>
      </div>

      <button onClick={clearFilters} className="filter-clear-btn">
        Clear Filters
      </button>
    </div>
  );
}

