/**
 * Team Service
 * Handles team-related API calls
 */

import type { Team, UUID } from '../../../core/types';
import { API_ENDPOINTS } from '../../../core/constants';
import { api } from '../../../core/api';
import { generateUUID, slugify } from '../../../core/utils/id';
import type {
  CreateTeamDTO,
  UpdateTeamDTO,
  TeamFilterParams,
  TeamMemberWithUser,
  AddTeamMemberDTO,
  UpdateTeamMemberDTO,
  TeamInvitation,
  InviteToTeamDTO,
  TeamStats,
  TeamActivity,
  TeamActivityType,
} from '../types';

// ============================================
// MOCK DATA
// ============================================

const USE_MOCK = true;

const MOCK_TEAMS: Team[] = [
  {
    id: 'team_001',
    name: 'Engineering',
    slug: 'engineering',
    description: 'Core engineering team responsible for product development',
    avatarUrl: null,
    organizationId: 'org_001',
    leadId: 'user_001',
    memberCount: 12,
    projectCount: 5,
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date(),
  },
  {
    id: 'team_002',
    name: 'Design',
    slug: 'design',
    description: 'UX/UI design team creating beautiful experiences',
    avatarUrl: null,
    organizationId: 'org_001',
    leadId: 'user_002',
    memberCount: 6,
    projectCount: 3,
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date(),
  },
  {
    id: 'team_003',
    name: 'Marketing',
    slug: 'marketing',
    description: 'Marketing and growth team',
    avatarUrl: null,
    organizationId: 'org_001',
    leadId: 'user_007',
    memberCount: 8,
    projectCount: 4,
    createdAt: new Date('2023-07-01'),
    updatedAt: new Date(),
  },
  {
    id: 'team_004',
    name: 'DevOps',
    slug: 'devops',
    description: 'Infrastructure and operations team',
    avatarUrl: null,
    organizationId: 'org_001',
    leadId: 'user_006',
    memberCount: 4,
    projectCount: 2,
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date(),
  },
];

const MOCK_TEAM_MEMBERS: TeamMemberWithUser[] = [
  {
    userId: 'user_001',
    teamId: 'team_001',
    role: 'owner',
    joinedAt: new Date('2023-06-01'),
    invitedBy: 'user_001',
    user: {
      id: 'user_001',
      email: 'john.doe@example.com',
      username: 'johndoe',
      displayName: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: null,
      role: 'admin',
      status: 'active',
      lastLoginAt: new Date(),
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date(),
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'America/New_York',
        notifications: { email: true, push: true, desktop: true, taskAssigned: true, taskMentioned: true, projectUpdates: true, weeklyDigest: true },
        accessibility: { reducedMotion: false, highContrast: false, fontSize: 'medium' },
      },
    },
  },
  {
    userId: 'user_002',
    teamId: 'team_001',
    role: 'admin',
    joinedAt: new Date('2023-06-05'),
    invitedBy: 'user_001',
    user: {
      id: 'user_002',
      email: 'alice@example.com',
      username: 'alice',
      displayName: 'Alice Smith',
      firstName: 'Alice',
      lastName: 'Smith',
      avatarUrl: null,
      role: 'manager',
      status: 'active',
      lastLoginAt: new Date(),
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: new Date('2023-02-01'),
      updatedAt: new Date(),
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'America/New_York',
        notifications: { email: true, push: true, desktop: true, taskAssigned: true, taskMentioned: true, projectUpdates: true, weeklyDigest: true },
        accessibility: { reducedMotion: false, highContrast: false, fontSize: 'medium' },
      },
    },
  },
  {
    userId: 'user_003',
    teamId: 'team_001',
    role: 'member',
    joinedAt: new Date('2023-06-10'),
    invitedBy: 'user_001',
    user: {
      id: 'user_003',
      email: 'bob@example.com',
      username: 'bob',
      displayName: 'Bob Johnson',
      firstName: 'Bob',
      lastName: 'Johnson',
      avatarUrl: null,
      role: 'member',
      status: 'active',
      lastLoginAt: new Date(),
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date('2023-03-01'),
      updatedAt: new Date(),
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'America/Los_Angeles',
        notifications: { email: true, push: false, desktop: true, taskAssigned: true, taskMentioned: true, projectUpdates: false, weeklyDigest: true },
        accessibility: { reducedMotion: false, highContrast: false, fontSize: 'medium' },
      },
    },
  },
];

// ============================================
// TEAM SERVICE
// ============================================

class TeamService {
  private mockDelay(ms = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get all teams
   */
  async getTeams(filters?: TeamFilterParams, sortBy: 'name' | 'memberCount' | 'newest' | 'oldest' = 'name'): Promise<Team[]> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      let teams = [...MOCK_TEAMS];

      if (filters) {
        if (filters.organizationId) {
          teams = teams.filter(t => t.organizationId === filters.organizationId);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          teams = teams.filter(t => 
            t.name.toLowerCase().includes(search) ||
            t.description?.toLowerCase().includes(search)
          );
        }
      }

      // Sorting
      switch (sortBy) {
        case 'name':
          teams.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'memberCount':
          teams.sort((a, b) => b.memberCount - a.memberCount);
          break;
        case 'newest':
          teams.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          break;
        case 'oldest':
          teams.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          break;
      }

      return teams;
    }

    const response = await api.get<Team[]>(API_ENDPOINTS.TEAMS, { params: { ...(filters || {}), sortBy } as unknown as Record<string, unknown> });
    return response.data;
  }

  /**
   * Get team by ID
   */
  async getTeam(teamId: UUID): Promise<Team> {
    if (USE_MOCK) {
      await this.mockDelay();
      const team = MOCK_TEAMS.find(t => t.id === teamId);
      if (!team) {
        throw new Error('Team not found');
      }
      return team;
    }

    const response = await api.get<Team>(`${API_ENDPOINTS.TEAMS}/${teamId}`);
    return response.data;
  }

  /**
   * Create a new team
   */
  async createTeam(data: CreateTeamDTO): Promise<Team> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const newTeam: Team = {
        id: generateUUID(),
        name: data.name,
        slug: slugify(data.name),
        description: data.description || null,
        avatarUrl: data.avatarUrl || null,
        organizationId: data.organizationId,
        leadId: data.leadId || 'user_001',
        memberCount: 1,
        projectCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      MOCK_TEAMS.push(newTeam);
      return newTeam;
    }

    const response = await api.post<Team>(API_ENDPOINTS.TEAMS, data);
    return response.data;
  }

  /**
   * Update a team
   */
  async updateTeam(teamId: UUID, data: UpdateTeamDTO): Promise<Team> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const index = MOCK_TEAMS.findIndex(t => t.id === teamId);
      if (index === -1) {
        throw new Error('Team not found');
      }

      const updatedTeam = {
        ...MOCK_TEAMS[index],
        ...data,
        updatedAt: new Date(),
      };

      MOCK_TEAMS[index] = updatedTeam;
      return updatedTeam;
    }

    const response = await api.patch<Team>(`${API_ENDPOINTS.TEAMS}/${teamId}`, data);
    return response.data;
  }

  /**
   * Delete a team
   */
  async deleteTeam(teamId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const index = MOCK_TEAMS.findIndex(t => t.id === teamId);
      if (index === -1) {
        throw new Error('Team not found');
      }

      MOCK_TEAMS.splice(index, 1);
      return;
    }

    await api.delete(`${API_ENDPOINTS.TEAMS}/${teamId}`);
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: UUID): Promise<TeamMemberWithUser[]> {
    if (USE_MOCK) {
      await this.mockDelay();
      return MOCK_TEAM_MEMBERS.filter(m => m.teamId === teamId);
    }

    const response = await api.get<TeamMemberWithUser[]>(
      API_ENDPOINTS.TEAM_MEMBERS.replace(':id', teamId)
    );
    return response.data;
  }

  /**
   * Add team member
   */
  async addTeamMember(teamId: UUID, data: AddTeamMemberDTO): Promise<TeamMemberWithUser> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const newMember: TeamMemberWithUser = {
        userId: data.userId,
        teamId,
        role: data.role,
        joinedAt: new Date(),
        invitedBy: 'user_001',
        user: {
          id: data.userId,
          email: `user_${data.userId}@example.com`,
          username: `user_${data.userId}`,
          displayName: `User ${data.userId}`,
          firstName: 'New',
          lastName: 'User',
          avatarUrl: null,
          role: 'member',
          status: 'active',
          lastLoginAt: null,
          emailVerified: false,
          twoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          preferences: {
            theme: 'dark',
            language: 'en',
            timezone: 'UTC',
            notifications: { email: true, push: true, desktop: true, taskAssigned: true, taskMentioned: true, projectUpdates: true, weeklyDigest: true },
            accessibility: { reducedMotion: false, highContrast: false, fontSize: 'medium' },
          },
        },
      };

      MOCK_TEAM_MEMBERS.push(newMember);
      
      // Update team member count
      const teamIndex = MOCK_TEAMS.findIndex(t => t.id === teamId);
      if (teamIndex !== -1) {
        MOCK_TEAMS[teamIndex].memberCount++;
      }

      return newMember;
    }

    const response = await api.post<TeamMemberWithUser>(
      API_ENDPOINTS.TEAM_MEMBERS.replace(':id', teamId),
      data
    );
    return response.data;
  }

  /**
   * Update team member
   */
  async updateTeamMember(
    teamId: UUID,
    userId: UUID,
    data: UpdateTeamMemberDTO
  ): Promise<TeamMemberWithUser> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const index = MOCK_TEAM_MEMBERS.findIndex(
        m => m.teamId === teamId && m.userId === userId
      );
      
      if (index === -1) {
        throw new Error('Team member not found');
      }

      MOCK_TEAM_MEMBERS[index] = {
        ...MOCK_TEAM_MEMBERS[index],
        role: data.role,
      };

      return MOCK_TEAM_MEMBERS[index];
    }

    const response = await api.patch<TeamMemberWithUser>(
      `${API_ENDPOINTS.TEAM_MEMBERS.replace(':id', teamId)}/${userId}`,
      data
    );
    return response.data;
  }

  /**
   * Remove team member
   */
  async removeTeamMember(teamId: UUID, userId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const index = MOCK_TEAM_MEMBERS.findIndex(
        m => m.teamId === teamId && m.userId === userId
      );
      
      if (index !== -1) {
        MOCK_TEAM_MEMBERS.splice(index, 1);
        
        // Update team member count
        const teamIndex = MOCK_TEAMS.findIndex(t => t.id === teamId);
        if (teamIndex !== -1) {
          MOCK_TEAMS[teamIndex].memberCount--;
        }
      }
      return;
    }

    await api.delete(`${API_ENDPOINTS.TEAM_MEMBERS.replace(':id', teamId)}/${userId}`);
  }

  /**
   * Invite user to team
   */
  async inviteToTeam(teamId: UUID, data: InviteToTeamDTO): Promise<TeamInvitation> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      return {
        id: generateUUID(),
        teamId,
        email: data.email,
        role: data.role,
        invitedBy: 'user_001',
        status: 'pending',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdAt: new Date(),
      };
    }

    const response = await api.post<TeamInvitation>(
      `${API_ENDPOINTS.TEAMS}/${teamId}/invitations`,
      data
    );
    return response.data;
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(invitationId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      return;
    }

    await api.delete(`/invitations/${invitationId}`);
  }

  /**
   * Get team statistics
   */
  async getTeamStats(teamId: UUID): Promise<TeamStats> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const team = MOCK_TEAMS.find(t => t.id === teamId);
      if (!team) {
        throw new Error('Team not found');
      }

      return {
        totalMembers: team.memberCount,
        totalProjects: team.projectCount,
        activeProjects: Math.ceil(team.projectCount * 0.7),
        completedProjects: Math.floor(team.projectCount * 0.3),
        totalTasks: team.projectCount * 25,
        completedTasks: team.projectCount * 15,
        averageProjectCompletion: 65,
        membersJoinedThisMonth: Math.floor(team.memberCount * 0.2),
      };
    }

    const response = await api.get<TeamStats>(`${API_ENDPOINTS.TEAMS}/${teamId}/stats`);
    return response.data;
  }

  /**
   * Get team activity
   */
  async getTeamActivity(teamId: UUID, limit = 20): Promise<TeamActivity[]> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const activities: TeamActivity[] = [
        {
          id: 'act_001',
          teamId,
          userId: 'user_001',
          type: 'project_created' as TeamActivityType,
          description: 'Created project "Website Redesign"',
          metadata: { projectId: 'proj_001' },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
        {
          id: 'act_002',
          teamId,
          userId: 'user_002',
          type: 'member_joined' as TeamActivityType,
          description: 'Alice Smith joined the team',
          metadata: { memberId: 'user_002' },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        },
        {
          id: 'act_003',
          teamId,
          userId: 'user_001',
          type: 'project_completed' as TeamActivityType,
          description: 'Completed project "Q1 Marketing Campaign"',
          metadata: { projectId: 'proj_004' },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        },
      ];
      
      return activities.slice(0, limit);
    }

    const response = await api.get<TeamActivity[]>(
      `${API_ENDPOINTS.TEAMS}/${teamId}/activity`,
      { params: { limit } }
    );
    return response.data;
  }
}

export const teamService = new TeamService();
