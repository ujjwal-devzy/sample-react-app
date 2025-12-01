/**
 * Team Types
 * Types for team management
 */

import type { Team, TeamMember, TeamRole, User, UUID } from '../../../core/types';

// Re-export core types for convenience
export type { Team, TeamMember, TeamRole, User, UUID };

// ============================================
// TEAM DTOs
// ============================================

export interface CreateTeamDTO {
  name: string;
  description?: string;
  organizationId: UUID;
  leadId?: UUID;
  avatarUrl?: string;
  department?: string;
  isPrivate?: boolean;
}

export interface UpdateTeamDTO {
  name?: string;
  description?: string;
  leadId?: UUID;
  avatarUrl?: string;
  department?: string;
  isPrivate?: boolean;
}

export interface TeamFilterParams {
  organizationId?: UUID;
  search?: string;
  includeArchived?: boolean;
}

export type TeamFilters = TeamFilterParams;
export type TeamSortBy = 'name' | 'memberCount' | 'newest' | 'oldest';

// ============================================
// TEAM MEMBER DTOs
// ============================================

export interface AddTeamMemberDTO {
  userId: UUID;
  role: TeamRole;
}

export interface UpdateTeamMemberDTO {
  role: TeamRole;
}

export interface TeamMemberWithUser extends TeamMember {
  user: User;
}

// ============================================
// TEAM INVITATION
// ============================================

export interface TeamInvitation {
  id: UUID;
  teamId: UUID;
  email: string;
  role: TeamRole;
  invitedBy: UUID;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

export interface InviteToTeamDTO {
  email: string;
  role: TeamRole;
  message?: string;
}

// ============================================
// TEAM STATISTICS
// ============================================

export interface TeamStats {
  totalMembers: number;
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  averageProjectCompletion: number;
  membersJoinedThisMonth: number;
}

// ============================================
// TEAM ACTIVITY
// ============================================

export type TeamActivityType =
  | 'team_created'
  | 'team_updated'
  | 'member_joined'
  | 'member_left'
  | 'member_role_changed'
  | 'project_created'
  | 'project_completed';

export interface TeamActivity {
  id: UUID;
  teamId: UUID;
  userId: UUID;
  type: TeamActivityType;
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  user?: User;
}

// ============================================
// TEAM CONTEXT
// ============================================

export interface TeamContextValue {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTeams: (filters?: TeamFilterParams) => Promise<void>;
  loadTeam: (teamId: UUID) => Promise<void>;
  createTeam: (data: CreateTeamDTO) => Promise<Team>;
  updateTeam: (teamId: UUID, data: UpdateTeamDTO) => Promise<Team>;
  deleteTeam: (teamId: UUID) => Promise<void>;
  
  // Members
  loadTeamMembers: (teamId: UUID) => Promise<TeamMemberWithUser[]>;
  addTeamMember: (teamId: UUID, data: AddTeamMemberDTO) => Promise<TeamMember>;
  updateTeamMember: (teamId: UUID, userId: UUID, data: UpdateTeamMemberDTO) => Promise<TeamMember>;
  removeTeamMember: (teamId: UUID, userId: UUID) => Promise<void>;
  
  // Invitations
  inviteToTeam: (teamId: UUID, data: InviteToTeamDTO) => Promise<TeamInvitation>;
  cancelInvitation: (invitationId: UUID) => Promise<void>;
  
  // Stats
  loadTeamStats: (teamId: UUID) => Promise<TeamStats>;
  
  // Selection
  setCurrentTeam: (team: Team | null) => void;
}

// ============================================
// TEAM LIST ITEM
// ============================================

export interface TeamListItem extends Team {
  role: TeamRole;
  unreadNotifications: number;
  recentProjects: Array<{
    id: UUID;
    name: string;
    status: string;
  }>;
}

// ============================================
// EXTENDED TEAM (with optional extra fields)
// ============================================

export interface ExtendedTeam extends Team {
  department?: string;
  isPrivate?: boolean;
  members?: TeamMemberWithUser[];
}
