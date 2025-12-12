/**
 * Project Analytics Service
 * Aggregates project data for reporting - demonstrates various usage patterns
 */

import { projectService } from './projectService';
import { teamService } from '../../teams/services/teamService';
import { isEmail, validatePassword } from '../../../core/utils/validation';
import type { Project } from '../../../core/types';

// ============================================
// ANALYTICS SERVICE
// ============================================

export interface ProjectAnalytics {
  projectId: string;
  projectName: string;
  health: 'healthy' | 'at-risk' | 'critical';
  metrics: {
    velocity: number;
    burndownRate: number;
    teamProductivity: number;
  };
}

class ProjectAnalyticsService {
  /**
   * Get comprehensive analytics for a project
   * This demonstrates null-checking pattern on getProject result
   */
  async getProjectAnalytics(projectId: string): Promise<ProjectAnalytics | null> {
    // Usage pattern: Null check on result
    const project = await projectService.getProject(projectId, { includeArchived: false });
    
    if (!project) {
      console.warn(`Project ${projectId} not found`);
      return null;
    }
    
    // Usage pattern: Destructuring
    const { name, progress, taskCount, completedTaskCount } = project;
    
    return {
      projectId,
      projectName: name,
      health: this.calculateHealth(progress),
      metrics: {
        velocity: this.calculateVelocity(completedTaskCount, taskCount),
        burndownRate: progress / 100,
        teamProductivity: 0.85,
      },
    };
  }

  /**
   * Get analytics for multiple projects  
   * Demonstrates error handling and transformation patterns
   */
  async getBulkProjectAnalytics(projectIds: string[]): Promise<ProjectAnalytics[]> {
    const results: ProjectAnalytics[] = [];
    
    for (const id of projectIds) {
      try {
        // Usage pattern: Awaited + Error handled
        const analytics = await this.getProjectAnalytics(id);
        if (analytics) {
          results.push(analytics);
        }
      } catch (error) {
        // Usage pattern: Error handled
        console.error(`Failed to get analytics for project ${id}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Validate team member email before adding to project
   * Shows breaking change impact - isEmail now requires strictMode param
   */
  validateMemberEmail(email: string, corporateOnly: boolean = false): boolean {
    // BREAKING: isEmail now requires second param
    return isEmail(email, corporateOnly);
  }

  /**
   * Validate project admin password
   * Shows breaking change - validatePassword returns null for empty
   */
  validateAdminAccess(password: string): { valid: boolean; reason?: string } {
    // BREAKING: validatePassword now returns PasswordStrength | null
    const strength = validatePassword(password);
    
    // Need null check now!
    if (!strength) {
      return { valid: false, reason: 'Password is required' };
    }
    
    if (!strength.isValid) {
      return { valid: false, reason: strength.feedback[0] };
    }
    
    return { valid: true };
  }

  /**
   * Get project with stats - demonstrates chained async calls
   * Shows transitive impact - getProjectStats now requires dateRange
   */
  async getProjectWithStats(projectId: string) {
    const project = await projectService.getProject(projectId, { includeArchived: true });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // BREAKING: getProjectStats now requires dateRange parameter
    const stats = await projectService.getProjectStats(projectId, {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(),
    });
    
    return { project, stats };
  }

  /**
   * Compare project to team average
   * Shows cross-service dependencies
   */
  async compareToTeamAverage(projectId: string, teamId: string): Promise<{
    projectProgress: number;
    teamAverageProgress: number;
    percentile: number;
  }> {
    // Usage: Fire and forget style (logging)
    teamService.getTeam(teamId).then(team => {
      console.log(`Comparing project to team: ${team.name}`);
    });
    
    const project = await projectService.getProject(projectId, { includeArchived: false });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Simplified comparison
    return {
      projectProgress: project.progress,
      teamAverageProgress: 60, // Mock
      percentile: 75, // Mock
    };
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private calculateHealth(progress: number): 'healthy' | 'at-risk' | 'critical' {
    if (progress >= 70) return 'healthy';
    if (progress >= 40) return 'at-risk';
    return 'critical';
  }

  private calculateVelocity(completed: number, total: number): number {
    if (total === 0) return 0;
    return completed / total;
  }
}

export const projectAnalyticsService = new ProjectAnalyticsService();

// ============================================
// REPORT GENERATORS - More usage patterns
// ============================================

/**
 * Generate weekly project report
 * Shows direct return pattern
 */
export async function generateWeeklyReport(projectId: string) {
  // Usage pattern: Direct return (no intermediate variable)
  return projectService.getProject(projectId, { includeArchived: false });
}

/**
 * Quick project lookup with caching
 * Shows cached/memoized pattern
 */
const projectCache = new Map<string, Project>();

export async function getCachedProject(projectId: string): Promise<Project | null> {
  // Usage pattern: Cached
  if (projectCache.has(projectId)) {
    return projectCache.get(projectId)!;
  }
  
  const project = await projectService.getProject(projectId, { includeArchived: true });
  
  if (project) {
    projectCache.set(projectId, project);
  }
  
  return project;
}

/**
 * Export project data for external systems
 * Shows passed-through pattern
 */
export async function exportProjectForIntegration(
  projectId: string,
  exporter: (project: Project) => void
): Promise<void> {
  const project = await projectService.getProject(projectId, { includeArchived: true });
  
  if (project) {
    // Usage pattern: Passed through to callback
    exporter(project);
  }
}

