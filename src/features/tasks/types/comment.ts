// Comment types for task discussions

export type CommentStatus = 'active' | 'resolved' | 'archived';

export interface Comment {
  id: string;
  taskId: string;
  author: string;
  content: string;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  reactions: { emoji: string; count: number; users: string[] }[];
  mentions: string[];
  isEdited: boolean;
}

export interface CreateCommentDTO {
  taskId: string;
  author: string;
  content: string;
  mentions?: string[];
}

export interface UpdateCommentDTO {
  content?: string;
  status?: CommentStatus;
}

export interface CommentThread {
  parentComment: Comment;
  replies: Comment[];
  isCollapsed: boolean;
}

