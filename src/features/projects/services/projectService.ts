/**
 * Project Service
 * Handles project-related API calls
 */

import type { Project, UUID } from '../../../core/types';
import { API_ENDPOINTS } from '../../../core/constants';
import { api } from '../../../core/api';
import { generateUUID, generateProjectKey } from '../../../core/utils/id';
import type {
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectFilterParams,
  ProjectMember,
  AddProjectMemberDTO,
  UpdateProjectMemberDTO,
  ProjectStats,
  ProjectActivity,
  ProjectActivityType,
  ProjectTemplate,
} from '../types';

// ============================================
// MOCK DATA
// ============================================

const USE_MOCK = true;

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj_001',
    name: 'Website Redesign',
    key: 'WEB',
    slug: 'website-redesign',
    description: 'Complete overhaul of the company website with modern design and improved UX',
    coverImageUrl: null,
    iconEmoji: '🌐',
    color: '#6366f1',
    status: 'active',
    visibility: 'team',
    priority: 'high',
    teamId: 'team_001',
    organizationId: 'org_001',
    startDate: new Date('2024-01-01'),
    targetDate: new Date('2024-03-31'),
    completedDate: null,
    progress: 65,
    taskCount: 42,
    completedTaskCount: 27,
    memberIds: ['user_001', 'user_002', 'user_003'],
    tags: ['frontend', 'design', 'ux'],
    settings: {
      enableTimeTracking: true,
      enableEstimates: true,
      defaultTaskPriority: 'medium',
      enableSubtasks: true,
      enableDependencies: false,
      enableCustomFields: false,
      workflowStages: [
        { id: 'stage_1', name: 'Backlog', color: '#6366f1', order: 0, isDefault: true, isCompleted: false },
        { id: 'stage_2', name: 'In Progress', color: '#f59e0b', order: 1, isDefault: false, isCompleted: false },
        { id: 'stage_3', name: 'Review', color: '#8b5cf6', order: 2, isDefault: false, isCompleted: false },
        { id: 'stage_4', name: 'Done', color: '#10b981', order: 3, isDefault: false, isCompleted: true },
      ],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    createdBy: 'user_001',
    updatedBy: 'user_001',
  },
  {
    id: 'proj_002',
    name: 'Mobile App Development',
    key: 'MOB',
    slug: 'mobile-app-development',
    description: 'Native iOS and Android app for customer engagement',
    coverImageUrl: null,
    iconEmoji: '📱',
    color: '#10b981',
    status: 'active',
    visibility: 'team',
    priority: 'critical',
    teamId: 'team_001',
    organizationId: 'org_001',
    startDate: new Date('2024-02-01'),
    targetDate: new Date('2024-06-30'),
    completedDate: null,
    progress: 35,
    taskCount: 78,
    completedTaskCount: 27,
    memberIds: ['user_001', 'user_004', 'user_005'],
    tags: ['mobile', 'ios', 'android'],
    settings: {
      enableTimeTracking: true,
      enableEstimates: true,
      defaultTaskPriority: 'medium',
      enableSubtasks: true,
      enableDependencies: true,
      enableCustomFields: false,
      workflowStages: [
        { id: 'stage_1', name: 'Backlog', color: '#6366f1', order: 0, isDefault: true, isCompleted: false },
        { id: 'stage_2', name: 'In Progress', color: '#f59e0b', order: 1, isDefault: false, isCompleted: false },
        { id: 'stage_3', name: 'Testing', color: '#8b5cf6', order: 2, isDefault: false, isCompleted: false },
        { id: 'stage_4', name: 'Done', color: '#10b981', order: 3, isDefault: false, isCompleted: true },
      ],
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    createdBy: 'user_001',
    updatedBy: 'user_004',
  },
  {
    id: 'proj_003',
    name: 'API Integration Platform',
    key: 'API',
    slug: 'api-integration-platform',
    description: 'Build a unified API gateway for third-party integrations',
    coverImageUrl: null,
    iconEmoji: '🔗',
    color: '#f59e0b',
    status: 'planning',
    visibility: 'private',
    priority: 'medium',
    teamId: 'team_002',
    organizationId: 'org_001',
    startDate: null,
    targetDate: new Date('2024-09-30'),
    completedDate: null,
    progress: 10,
    taskCount: 23,
    completedTaskCount: 2,
    memberIds: ['user_001', 'user_006'],
    tags: ['backend', 'api', 'integration'],
    settings: {
      enableTimeTracking: false,
      enableEstimates: true,
      defaultTaskPriority: 'medium',
      enableSubtasks: true,
      enableDependencies: false,
      enableCustomFields: false,
      workflowStages: [
        { id: 'stage_1', name: 'Backlog', color: '#6366f1', order: 0, isDefault: true, isCompleted: false },
        { id: 'stage_2', name: 'In Progress', color: '#f59e0b', order: 1, isDefault: false, isCompleted: false },
        { id: 'stage_3', name: 'Done', color: '#10b981', order: 2, isDefault: false, isCompleted: true },
      ],
    },
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
    createdBy: 'user_001',
    updatedBy: 'user_001',
  },
  {
    id: 'proj_004',
    name: 'Q1 Marketing Campaign',
    key: 'MKT',
    slug: 'q1-marketing-campaign',
    description: 'Launch marketing initiatives for Q1 2024',
    coverImageUrl: null,
    iconEmoji: '📣',
    color: '#ec4899',
    status: 'completed',
    visibility: 'organization',
    priority: 'high',
    teamId: 'team_003',
    organizationId: 'org_001',
    startDate: new Date('2024-01-01'),
    targetDate: new Date('2024-03-31'),
    completedDate: new Date('2024-03-28'),
    progress: 100,
    taskCount: 35,
    completedTaskCount: 35,
    memberIds: ['user_002', 'user_007', 'user_008'],
    tags: ['marketing', 'campaign', 'social'],
    settings: {
      enableTimeTracking: false,
      enableEstimates: false,
      defaultTaskPriority: 'medium',
      enableSubtasks: false,
      enableDependencies: false,
      enableCustomFields: false,
      workflowStages: [
        { id: 'stage_1', name: 'To Do', color: '#6366f1', order: 0, isDefault: true, isCompleted: false },
        { id: 'stage_2', name: 'In Progress', color: '#f59e0b', order: 1, isDefault: false, isCompleted: false },
        { id: 'stage_3', name: 'Done', color: '#10b981', order: 2, isDefault: false, isCompleted: true },
      ],
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-28'),
    createdBy: 'user_002',
    updatedBy: 'user_002',
  },
  {
    id: 'proj_005',
    name: 'Security Audit 2024',
    key: 'SEC',
    slug: 'security-audit-2024',
    description: 'Annual security audit and compliance review',
    coverImageUrl: null,
    iconEmoji: '🔒',
    color: '#ef4444',
    status: 'on_hold',
    visibility: 'private',
    priority: 'critical',
    teamId: 'team_002',
    organizationId: 'org_001',
    startDate: new Date('2024-02-01'),
    targetDate: new Date('2024-04-30'),
    completedDate: null,
    progress: 45,
    taskCount: 28,
    completedTaskCount: 12,
    memberIds: ['user_001', 'user_006'],
    tags: ['security', 'audit', 'compliance'],
    settings: {
      enableTimeTracking: true,
      enableEstimates: true,
      defaultTaskPriority: 'high',
      enableSubtasks: true,
      enableDependencies: false,
      enableCustomFields: false,
      workflowStages: [
        { id: 'stage_1', name: 'Backlog', color: '#6366f1', order: 0, isDefault: true, isCompleted: false },
        { id: 'stage_2', name: 'In Progress', color: '#f59e0b', order: 1, isDefault: false, isCompleted: false },
        { id: 'stage_3', name: 'Review', color: '#8b5cf6', order: 2, isDefault: false, isCompleted: false },
        { id: 'stage_4', name: 'Done', color: '#10b981', order: 3, isDefault: false, isCompleted: true },
      ],
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    createdBy: 'user_001',
    updatedBy: 'user_001',
  },
];

const MOCK_PROJECT_MEMBERS: ProjectMember[] = [
  {
    userId: 'user_001',
    projectId: 'proj_001',
    role: 'owner',
    joinedAt: new Date('2024-01-01'),
    invitedBy: 'user_001',
  },
  {
    userId: 'user_002',
    projectId: 'proj_001',
    role: 'editor',
    joinedAt: new Date('2024-01-02'),
    invitedBy: 'user_001',
  },
  {
    userId: 'user_003',
    projectId: 'proj_001',
    role: 'viewer',
    joinedAt: new Date('2024-01-05'),
    invitedBy: 'user_001',
  },
];

// ============================================
// PROJECT SERVICE
// ============================================

class ProjectService {
  private mockDelay(ms = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get all projects
   */
  async getProjects(filters?: ProjectFilterParams): Promise<Project[]> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      let projects = [...MOCK_PROJECTS];

      if (filters) {
        if (filters.status?.length) {
          projects = projects.filter(p => filters.status!.includes(p.status));
        }
        if (filters.visibility?.length) {
          projects = projects.filter(p => filters.visibility!.includes(p.visibility));
        }
        if (filters.priority?.length) {
          projects = projects.filter(p => filters.priority!.includes(p.priority));
        }
        if (filters.teamId) {
          projects = projects.filter(p => p.teamId === filters.teamId);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          projects = projects.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.description?.toLowerCase().includes(search) ||
            p.key.toLowerCase().includes(search)
          );
        }
        if (filters.tags?.length) {
          projects = projects.filter(p => 
            filters.tags!.some(tag => p.tags.includes(tag))
          );
        }
      }

      return projects;
    }

    const response = await api.get<Project[]>(API_ENDPOINTS.PROJECTS, { params: (filters || {}) as unknown as Record<string, unknown> });
    return response.data;
  }

  /**
   * Get project by ID
   */
  async getProject(projectId: UUID): Promise<Project> {
    if (USE_MOCK) {
      await this.mockDelay();
      const project = MOCK_PROJECTS.find(p => p.id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }
      return project;
    }

    const response = await api.get<Project>(`${API_ENDPOINTS.PROJECTS}/${projectId}`);
    return response.data;
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectDTO): Promise<Project> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const existingKeys = MOCK_PROJECTS.map(p => p.key);
      const key = data.key || generateProjectKey(data.name, existingKeys);
      
      const newProject: Project = {
        id: generateUUID(),
        name: data.name,
        key,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description || null,
        coverImageUrl: null,
        iconEmoji: data.iconEmoji || '📁',
        color: data.color || '#6366f1',
        status: 'planning',
        visibility: data.visibility || 'team',
        priority: data.priority || 'medium',
        teamId: data.teamId,
        organizationId: 'org_001',
        startDate: data.startDate || null,
        targetDate: data.targetDate || null,
        completedDate: null,
        progress: 0,
        taskCount: 0,
        completedTaskCount: 0,
        memberIds: ['user_001'],
        tags: data.tags || [],
        settings: {
          enableTimeTracking: false,
          enableEstimates: true,
          defaultTaskPriority: 'medium',
          enableSubtasks: true,
          enableDependencies: false,
          enableCustomFields: false,
          workflowStages: [
            { id: generateUUID(), name: 'Backlog', color: '#6366f1', order: 0, isDefault: true, isCompleted: false },
            { id: generateUUID(), name: 'In Progress', color: '#f59e0b', order: 1, isDefault: false, isCompleted: false },
            { id: generateUUID(), name: 'Review', color: '#8b5cf6', order: 2, isDefault: false, isCompleted: false },
            { id: generateUUID(), name: 'Done', color: '#10b981', order: 3, isDefault: false, isCompleted: true },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user_001',
        updatedBy: 'user_001',
      };

      MOCK_PROJECTS.push(newProject);
      return newProject;
    }

    const response = await api.post<Project>(API_ENDPOINTS.PROJECTS, data);
    return response.data;
  }

  /**
   * Update a project
   */
  async updateProject(projectId: UUID, data: UpdateProjectDTO): Promise<Project> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const index = MOCK_PROJECTS.findIndex(p => p.id === projectId);
      if (index === -1) {
        throw new Error('Project not found');
      }

      const updatedProject = {
        ...MOCK_PROJECTS[index],
        ...data,
        updatedAt: new Date(),
      };

      MOCK_PROJECTS[index] = updatedProject;
      return updatedProject;
    }

    const response = await api.patch<Project>(`${API_ENDPOINTS.PROJECTS}/${projectId}`, data);
    return response.data;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const index = MOCK_PROJECTS.findIndex(p => p.id === projectId);
      if (index === -1) {
        throw new Error('Project not found');
      }

      MOCK_PROJECTS.splice(index, 1);
      return;
    }

    await api.delete(`${API_ENDPOINTS.PROJECTS}/${projectId}`);
  }

  /**
   * Archive a project
   */
  async archiveProject(projectId: UUID): Promise<Project> {
    return this.updateProject(projectId, { status: 'archived' });
  }

  /**
   * Restore an archived project
   */
  async restoreProject(projectId: UUID): Promise<Project> {
    return this.updateProject(projectId, { status: 'active' });
  }

  /**
   * Duplicate a project
   */
  async duplicateProject(projectId: UUID): Promise<Project> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const original = MOCK_PROJECTS.find(p => p.id === projectId);
      if (!original) {
        throw new Error('Project not found');
      }

      const existingKeys = MOCK_PROJECTS.map(p => p.key);
      
      const duplicate: Project = {
        ...original,
        id: generateUUID(),
        name: `${original.name} (Copy)`,
        key: generateProjectKey(`${original.name} Copy`, existingKeys),
        slug: `${original.slug}-copy`,
        status: 'planning',
        progress: 0,
        taskCount: 0,
        completedTaskCount: 0,
        completedDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MOCK_PROJECTS.push(duplicate);
      return duplicate;
    }

    const response = await api.post<Project>(`${API_ENDPOINTS.PROJECTS}/${projectId}/duplicate`);
    return response.data;
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: UUID): Promise<ProjectMember[]> {
    if (USE_MOCK) {
      await this.mockDelay();
      return MOCK_PROJECT_MEMBERS.filter(m => m.projectId === projectId);
    }

    const response = await api.get<ProjectMember[]>(
      API_ENDPOINTS.PROJECT_MEMBERS.replace(':id', projectId)
    );
    return response.data;
  }

  /**
   * Add project member
   */
  async addProjectMember(projectId: UUID, data: AddProjectMemberDTO): Promise<ProjectMember> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const newMember: ProjectMember = {
        userId: data.userId,
        projectId,
        role: data.role,
        joinedAt: new Date(),
        invitedBy: 'user_001',
      };

      MOCK_PROJECT_MEMBERS.push(newMember);
      return newMember;
    }

    const response = await api.post<ProjectMember>(
      API_ENDPOINTS.PROJECT_MEMBERS.replace(':id', projectId),
      data
    );
    return response.data;
  }

  /**
   * Update project member
   */
  async updateProjectMember(
    projectId: UUID, 
    userId: UUID, 
    data: UpdateProjectMemberDTO
  ): Promise<ProjectMember> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const index = MOCK_PROJECT_MEMBERS.findIndex(
        m => m.projectId === projectId && m.userId === userId
      );
      
      if (index === -1) {
        throw new Error('Project member not found');
      }

      MOCK_PROJECT_MEMBERS[index] = {
        ...MOCK_PROJECT_MEMBERS[index],
        role: data.role,
      };

      return MOCK_PROJECT_MEMBERS[index];
    }

    const response = await api.patch<ProjectMember>(
      `${API_ENDPOINTS.PROJECT_MEMBERS.replace(':id', projectId)}/${userId}`,
      data
    );
    return response.data;
  }

  /**
   * Remove project member
   */
  async removeProjectMember(projectId: UUID, userId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const index = MOCK_PROJECT_MEMBERS.findIndex(
        m => m.projectId === projectId && m.userId === userId
      );
      
      if (index !== -1) {
        MOCK_PROJECT_MEMBERS.splice(index, 1);
      }
      return;
    }

    await api.delete(`${API_ENDPOINTS.PROJECT_MEMBERS.replace(':id', projectId)}/${userId}`);
  }

  /**
   * Get project statistics
   */
  async getProjectStats(projectId: UUID): Promise<ProjectStats> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const project = MOCK_PROJECTS.find(p => p.id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      return {
        totalTasks: project.taskCount,
        completedTasks: project.completedTaskCount,
        inProgressTasks: Math.floor(project.taskCount * 0.3),
        overdueTasks: Math.floor(project.taskCount * 0.1),
        totalMembers: project.memberIds.length,
        totalComments: Math.floor(project.taskCount * 2.5),
        totalFiles: Math.floor(project.taskCount * 0.5),
        completionRate: project.progress,
        averageTaskDuration: 4.5,
        tasksCompletedThisWeek: Math.floor(project.completedTaskCount * 0.2),
        tasksCreatedThisWeek: Math.floor(project.taskCount * 0.15),
      };
    }

    const response = await api.get<ProjectStats>(
      API_ENDPOINTS.PROJECT_ANALYTICS.replace(':id', projectId)
    );
    return response.data;
  }

  /**
   * Get project activity
   */
  async getProjectActivity(projectId: UUID, limit = 20): Promise<ProjectActivity[]> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const activities: ProjectActivity[] = [
        {
          id: 'act_001',
          projectId,
          userId: 'user_001',
          type: 'task_completed' as ProjectActivityType,
          description: 'Completed task "Design homepage mockup"',
          metadata: { taskId: 'task_001' },
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: 'act_002',
          projectId,
          userId: 'user_002',
          type: 'task_created' as ProjectActivityType,
          description: 'Created task "Implement authentication"',
          metadata: { taskId: 'task_002' },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
        {
          id: 'act_003',
          projectId,
          userId: 'user_001',
          type: 'member_added' as ProjectActivityType,
          description: 'Added Alice to the project',
          metadata: { memberId: 'user_003' },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
      ];
      return activities.slice(0, limit);
    }

    const response = await api.get<ProjectActivity[]>(
      `${API_ENDPOINTS.PROJECTS}/${projectId}/activity`,
      { params: { limit } }
    );
    return response.data;
  }

  /**
   * Get project templates
   */
  async getProjectTemplates(): Promise<ProjectTemplate[]> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      return [
        {
          id: 'tpl_001',
          name: 'Software Development',
          description: 'Agile software development workflow with sprints',
          icon: '💻',
          color: '#6366f1',
          defaultTasks: [
            { title: 'Project Setup', description: 'Initial project configuration', priority: 'high', stage: 'Backlog' },
            { title: 'Requirements Gathering', priority: 'high', stage: 'Backlog' },
            { title: 'Architecture Design', priority: 'medium', stage: 'Backlog' },
          ],
          defaultWorkflow: [
            { name: 'Backlog', color: '#6366f1', isDefault: true },
            { name: 'In Progress', color: '#f59e0b' },
            { name: 'Code Review', color: '#8b5cf6' },
            { name: 'Testing', color: '#06b6d4' },
            { name: 'Done', color: '#10b981', isCompleted: true },
          ],
          tags: ['agile', 'development'],
          isPublic: true,
          createdBy: 'system',
        },
        {
          id: 'tpl_002',
          name: 'Marketing Campaign',
          description: 'Plan and execute marketing campaigns',
          icon: '📣',
          color: '#ec4899',
          defaultTasks: [
            { title: 'Define Campaign Goals', priority: 'high', stage: 'To Do' },
            { title: 'Identify Target Audience', priority: 'high', stage: 'To Do' },
            { title: 'Create Content Calendar', priority: 'medium', stage: 'To Do' },
          ],
          defaultWorkflow: [
            { name: 'To Do', color: '#6366f1', isDefault: true },
            { name: 'In Progress', color: '#f59e0b' },
            { name: 'Under Review', color: '#8b5cf6' },
            { name: 'Published', color: '#10b981', isCompleted: true },
          ],
          tags: ['marketing', 'campaign'],
          isPublic: true,
          createdBy: 'system',
        },
        {
          id: 'tpl_003',
          name: 'Product Launch',
          description: 'Coordinate product launch activities',
          icon: '🚀',
          color: '#f59e0b',
          defaultTasks: [
            { title: 'Market Research', priority: 'high', stage: 'Planning' },
            { title: 'Competitive Analysis', priority: 'medium', stage: 'Planning' },
            { title: 'Pricing Strategy', priority: 'high', stage: 'Planning' },
          ],
          defaultWorkflow: [
            { name: 'Planning', color: '#6366f1', isDefault: true },
            { name: 'Development', color: '#f59e0b' },
            { name: 'Testing', color: '#8b5cf6' },
            { name: 'Launched', color: '#10b981', isCompleted: true },
          ],
          tags: ['product', 'launch'],
          isPublic: true,
          createdBy: 'system',
        },
      ];
    }

    const response = await api.get<ProjectTemplate[]>('/projects/templates');
    return response.data;
  }
}

export const projectService = new ProjectService();

