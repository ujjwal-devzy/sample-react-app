/**
 * Task Context - Implements Context Pattern for global state management
 * Provides task state and operations to all child components
 */

import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from '../types';
import { taskRepository } from '../repository/taskRepository';

// State shape
interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  selectedTask: Task | null;
}

// Action types - discriminated union pattern
type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SELECT_TASK'; payload: Task | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Context value shape
interface TaskContextValue {
  state: TaskState;
  actions: {
    loadTasks: () => void;
    createTask: (dto: CreateTaskDTO) => Task;
    updateTask: (id: string, dto: UpdateTaskDTO) => void;
    deleteTask: (id: string) => void;
    moveTask: (taskId: string, newStatus: TaskStatus) => void;
    selectTask: (task: Task | null) => void;
    resetTasks: () => void;
    clearError: () => void;
  };
}

// Initial state
const initialState: TaskState = {
  tasks: [],
  isLoading: true,
  error: null,
  selectedTask: null,
};

// Reducer - pure function for state transitions
function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, isLoading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
        selectedTask: state.selectedTask?.id === action.payload ? null : state.selectedTask,
      };
    case 'SELECT_TASK':
      return { ...state, selectedTask: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

// Create context with undefined default
const TaskContext = createContext<TaskContextValue | undefined>(undefined);

// Provider component
export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Memoized actions
  const loadTasks = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const tasks = taskRepository.findAll();
      dispatch({ type: 'SET_TASKS', payload: tasks });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load tasks' });
      console.error(err);
    }
  }, []);

  const createTask = useCallback((dto: CreateTaskDTO): Task => {
    try {
      const newTask = taskRepository.create(dto);
      dispatch({ type: 'ADD_TASK', payload: newTask });
      return newTask;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create task' });
      throw error;
    }
  }, []);

  const updateTask = useCallback((id: string, dto: UpdateTaskDTO) => {
    const currentTask = state.tasks.find(t => t.id === id);
    if (!currentTask) return;

    const optimisticUpdate: Task = {
      ...currentTask,
      ...dto,
      updatedAt: new Date(),
    };
    
    dispatch({ type: 'UPDATE_TASK', payload: optimisticUpdate });
    
    try {
      const updated = taskRepository.update(id, dto);
      if (updated) {
        dispatch({ type: 'UPDATE_TASK', payload: updated });
      } else {
        dispatch({ type: 'UPDATE_TASK', payload: currentTask });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
      }
    } catch (error) {
      dispatch({ type: 'UPDATE_TASK', payload: currentTask });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update task' });
    }
  }, [state.tasks]);

  const deleteTask = useCallback((id: string) => {
    const taskToDelete = state.tasks.find(t => t.id === id);
    if (!taskToDelete) return;

    dispatch({ type: 'DELETE_TASK', payload: id });
    
    try {
      const success = taskRepository.delete(id);
      if (!success) {
        dispatch({ type: 'ADD_TASK', payload: taskToDelete });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to delete task' });
      }
    } catch (error) {
      dispatch({ type: 'ADD_TASK', payload: taskToDelete });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete task' });
    }
  }, [state.tasks]);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    const currentTask = state.tasks.find(t => t.id === taskId);
    if (!currentTask) return;

    const optimisticUpdate: Task = {
      ...currentTask,
      status: newStatus,
      updatedAt: new Date(),
    };
    
    dispatch({ type: 'UPDATE_TASK', payload: optimisticUpdate });
    
    try {
      const updated = taskRepository.moveTask(taskId, newStatus);
      if (updated) {
        dispatch({ type: 'UPDATE_TASK', payload: updated });
      } else {
        dispatch({ type: 'UPDATE_TASK', payload: currentTask });
        dispatch({ type: 'SET_ERROR', payload: 'Failed to move task' });
      }
    } catch (error) {
      dispatch({ type: 'UPDATE_TASK', payload: currentTask });
      dispatch({ type: 'SET_ERROR', payload: 'Failed to move task' });
    }
  }, [state.tasks]);

  const selectTask = useCallback((task: Task | null) => {
    dispatch({ type: 'SELECT_TASK', payload: task });
  }, []);

  const resetTasks = useCallback(() => {
    const tasks = taskRepository.reset();
    dispatch({ type: 'SET_TASKS', payload: tasks });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  const value: TaskContextValue = {
    state,
    actions: {
      loadTasks,
      createTask,
      updateTask,
      deleteTask,
      moveTask,
      selectTask,
      resetTasks,
      clearError,
    },
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

// Custom hook for consuming context
export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}

