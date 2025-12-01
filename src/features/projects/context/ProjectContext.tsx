/**
 * Project Context
 * Global project state management
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Project, UUID } from '../../../core/types';
import type {
  CreateProjectDTO,
  UpdateProjectDTO,
  ProjectFilterParams,
  ProjectMember,
  AddProjectMemberDTO,
  UpdateProjectMemberDTO,
  ProjectStats,
  ProjectContextValue,
} from '../types';
import { projectService } from '../services/projectService';

// ============================================
// STATE
// ============================================

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  favorites: Set<UUID>;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  favorites: new Set(),
};

// ============================================
// ACTIONS
// ============================================

type ProjectAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project | null }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: UUID }
  | { type: 'TOGGLE_FAVORITE'; payload: UUID };

// ============================================
// REDUCER
// ============================================

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, isLoading: false, error: null };

    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload };

    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
        currentProject: state.currentProject?.id === action.payload.id 
          ? action.payload 
          : state.currentProject,
      };

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        currentProject: state.currentProject?.id === action.payload 
          ? null 
          : state.currentProject,
      };

    case 'TOGGLE_FAVORITE': {
      const newFavorites = new Set(state.favorites);
      if (newFavorites.has(action.payload)) {
        newFavorites.delete(action.payload);
      } else {
        newFavorites.add(action.payload);
      }
      return { ...state, favorites: newFavorites };
    }

    default:
      return state;
  }
}

// ============================================
// CONTEXT
// ============================================

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  // Load projects
  const loadProjects = useCallback(async (filters?: ProjectFilterParams) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const projects = await projectService.getProjects(filters);
      dispatch({ type: 'SET_PROJECTS', payload: projects });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load projects' 
      });
    }
  }, []);

  // Load single project
  const loadProject = useCallback(async (projectId: UUID) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const project = await projectService.getProject(projectId);
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error instanceof Error ? error.message : 'Failed to load project' 
      });
    }
  }, []);

  // Create project
  const createProject = useCallback(async (data: CreateProjectDTO): Promise<Project> => {
    const project = await projectService.createProject(data);
    dispatch({ type: 'ADD_PROJECT', payload: project });
    return project;
  }, []);

  // Update project
  const updateProject = useCallback(async (projectId: UUID, data: UpdateProjectDTO): Promise<Project> => {
    const project = await projectService.updateProject(projectId, data);
    dispatch({ type: 'UPDATE_PROJECT', payload: project });
    return project;
  }, []);

  // Delete project
  const deleteProject = useCallback(async (projectId: UUID) => {
    await projectService.deleteProject(projectId);
    dispatch({ type: 'DELETE_PROJECT', payload: projectId });
  }, []);

  // Archive project
  const archiveProject = useCallback(async (projectId: UUID) => {
    const project = await projectService.archiveProject(projectId);
    dispatch({ type: 'UPDATE_PROJECT', payload: project });
  }, []);

  // Restore project
  const restoreProject = useCallback(async (projectId: UUID) => {
    const project = await projectService.restoreProject(projectId);
    dispatch({ type: 'UPDATE_PROJECT', payload: project });
  }, []);

  // Duplicate project
  const duplicateProject = useCallback(async (projectId: UUID): Promise<Project> => {
    const project = await projectService.duplicateProject(projectId);
    dispatch({ type: 'ADD_PROJECT', payload: project });
    return project;
  }, []);

  // Load project members
  const loadProjectMembers = useCallback(async (projectId: UUID): Promise<ProjectMember[]> => {
    return projectService.getProjectMembers(projectId);
  }, []);

  // Add project member
  const addProjectMember = useCallback(async (
    projectId: UUID, 
    data: AddProjectMemberDTO
  ): Promise<ProjectMember> => {
    return projectService.addProjectMember(projectId, data);
  }, []);

  // Update project member
  const updateProjectMember = useCallback(async (
    projectId: UUID, 
    userId: UUID, 
    data: UpdateProjectMemberDTO
  ): Promise<ProjectMember> => {
    return projectService.updateProjectMember(projectId, userId, data);
  }, []);

  // Remove project member
  const removeProjectMember = useCallback(async (projectId: UUID, userId: UUID) => {
    await projectService.removeProjectMember(projectId, userId);
  }, []);

  // Load project stats
  const loadProjectStats = useCallback(async (projectId: UUID): Promise<ProjectStats> => {
    return projectService.getProjectStats(projectId);
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (projectId: UUID) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: projectId });
    // In real app, save to backend
  }, []);

  // Set current project
  const setCurrentProject = useCallback((project: Project | null) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
  }, []);

  // Context value
  const value: ProjectContextValue = useMemo(
    () => ({
      projects: state.projects,
      currentProject: state.currentProject,
      isLoading: state.isLoading,
      error: state.error,
      loadProjects,
      loadProject,
      createProject,
      updateProject,
      deleteProject,
      archiveProject,
      restoreProject,
      duplicateProject,
      loadProjectMembers,
      addProjectMember,
      updateProjectMember,
      removeProjectMember,
      loadProjectStats,
      toggleFavorite,
      setCurrentProject,
    }),
    [
      state,
      loadProjects,
      loadProject,
      createProject,
      updateProject,
      deleteProject,
      archiveProject,
      restoreProject,
      duplicateProject,
      loadProjectMembers,
      addProjectMember,
      updateProjectMember,
      removeProjectMember,
      loadProjectStats,
      toggleFavorite,
      setCurrentProject,
    ]
  );

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useProjects(): ProjectContextValue {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

