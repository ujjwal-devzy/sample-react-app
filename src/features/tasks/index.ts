// Feature barrel export - Public API for the tasks feature
export { TaskBoard, CommentCard, CommentStats } from './components';
export { TaskProvider } from './context/TaskContext';
export { useTasks } from './hooks/useTasks';
export { useComments } from './hooks/useComments';
export type { Task, TaskStatus, TaskPriority, CreateTaskDTO, UpdateTaskDTO } from './types';
export type { Comment, CommentStatus, CreateCommentDTO, UpdateCommentDTO } from './types/comment';

