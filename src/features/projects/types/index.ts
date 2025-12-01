/**
 * Project Types
 * Types for project management
 */

import type { 
  Project, 
  ProjectStatus, 
  ProjectVisibility, 
  ProjectPriority,
  User,
  UUID 
} from '../../../core/types';

// ============================================
// PROJECT DTOs
// ============================================

export interface CreateProjectDTO {
  name: string;
  key: string;
  description?: string;
  teamId: UUID;
  visibility?: ProjectVisibility;
  priority?: ProjectPriority;
  startDate?: Date;
  targetDate?: Date;
  iconEmoji?: string;
  color?: string;
  tags?: string[];
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  visibility?: ProjectVisibility;
  priority?: ProjectPriority;
  startDate?: Date | null;
  targetDate?: Date | null;
  iconEmoji?: string;
  color?: string;
  tags?: string[];
  coverImageUrl?: string | null;
}

export interface ProjectFilterParams {
  status?: ProjectStatus[];
  visibility?: ProjectVisibility[];
  priority?: ProjectPriority[];
  teamId?: UUID;
  search?: string;
  tags?: string[];
  createdAfter?: Date;
  createdBefore?: Date;
}

// ============================================
// PROJECT MEMBER
// ============================================

export type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface ProjectMember {
  userId: UUID;
  projectId: UUID;
  role: ProjectRole;
  joinedAt: Date;
  invitedBy: UUID;
  user?: User;
}

export interface AddProjectMemberDTO {
  userId: UUID;
  role: ProjectRole;
}

export interface UpdateProjectMemberDTO {
  role: ProjectRole;
}

// ============================================
// PROJECT ACTIVITY
// ============================================

export type ProjectActivityType = 
  | 'project_created'
  | 'project_updated'
  | 'project_archived'
  | 'project_deleted'
  | 'member_added'
  | 'member_removed'
  | 'member_role_changed'
  | 'task_created'
  | 'task_completed'
  | 'milestone_reached';

export interface ProjectActivity {
  id: UUID;
  projectId: UUID;
  userId: UUID;
  type: ProjectActivityType;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  user?: User;
}

// ============================================
// PROJECT STATISTICS
// ============================================

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalMembers: number;
  totalComments: number;
  totalFiles: number;
  completionRate: number;
  averageTaskDuration: number;
  tasksCompletedThisWeek: number;
  tasksCreatedThisWeek: number;
}

export interface ProjectProgressData {
  date: string;
  completed: number;
  created: number;
  total: number;
}

// ============================================
// PROJECT VIEWS
// ============================================

export type ProjectViewType = 'board' | 'list' | 'timeline' | 'calendar' | 'files';

export interface ProjectView {
  id: UUID;
  projectId: UUID;
  name: string;
  type: ProjectViewType;
  isDefault: boolean;
  config: ProjectViewConfig;
  createdBy: UUID;
  createdAt: Date;
}

export interface ProjectViewConfig {
  columns?: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  groupBy?: string;
  showSubtasks?: boolean;
  showCompletedTasks?: boolean;
}

// ============================================
// PROJECT TEMPLATES
// ============================================

export interface ProjectTemplate {
  id: UUID;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultTasks: TemplateTask[];
  defaultWorkflow: WorkflowStageTemplate[];
  tags: string[];
  isPublic: boolean;
  createdBy: UUID;
}

export interface TemplateTask {
  title: string;
  description?: string;
  priority?: ProjectPriority;
  stage?: string;
  subtasks?: { title: string }[];
}

export interface WorkflowStageTemplate {
  name: string;
  color: string;
  isDefault?: boolean;
  isCompleted?: boolean;
}

// ============================================
// PROJECT CONTEXT
// ============================================

export interface ProjectContextValue {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadProjects: (filters?: ProjectFilterParams) => Promise<void>;
  loadProject: (projectId: UUID) => Promise<void>;
  createProject: (data: CreateProjectDTO) => Promise<Project>;
  updateProject: (projectId: UUID, data: UpdateProjectDTO) => Promise<Project>;
  deleteProject: (projectId: UUID) => Promise<void>;
  archiveProject: (projectId: UUID) => Promise<void>;
  restoreProject: (projectId: UUID) => Promise<void>;
  duplicateProject: (projectId: UUID) => Promise<Project>;
  
  // Members
  loadProjectMembers: (projectId: UUID) => Promise<ProjectMember[]>;
  addProjectMember: (projectId: UUID, data: AddProjectMemberDTO) => Promise<ProjectMember>;
  updateProjectMember: (projectId: UUID, userId: UUID, data: UpdateProjectMemberDTO) => Promise<ProjectMember>;
  removeProjectMember: (projectId: UUID, userId: UUID) => Promise<void>;
  
  // Stats
  loadProjectStats: (projectId: UUID) => Promise<ProjectStats>;
  
  // Favorites
  toggleFavorite: (projectId: UUID) => Promise<void>;
  
  // Selection
  setCurrentProject: (project: Project | null) => void;
}

// ============================================
// PROJECT LIST ITEM
// ============================================

export interface ProjectListItem extends Project {
  isFavorite: boolean;
  unreadNotifications: number;
  recentActivity?: ProjectActivity[];
}

// ============================================
// PROJECT FILTERS STATE
// ============================================

export interface ProjectFiltersState {
  status: ProjectStatus[];
  visibility: ProjectVisibility[];
  priority: ProjectPriority[];
  teamId: UUID | null;
  search: string;
  tags: string[];
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'progress';
  sortDirection: 'asc' | 'desc';
}

