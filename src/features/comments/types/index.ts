/**
 * Comment Types
 * Types for the commenting system
 */

import type { User, UUID, FileAttachment } from '../../../core/types';

// ============================================
// COMMENT ENTITY
// ============================================

export interface Comment {
  id: UUID;
  content: string;
  htmlContent?: string;
  entityType: 'task' | 'project' | 'file';
  entityId: UUID;
  authorId: UUID;
  author?: User;
  parentId: UUID | null;
  replies?: Comment[];
  replyCount: number;
  attachments: FileAttachment[];
  mentions: UUID[];
  reactions: CommentReaction[];
  isEdited: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ============================================
// COMMENT DTOs
// ============================================

export interface CreateCommentDTO {
  content: string;
  entityType: 'task' | 'project' | 'file';
  entityId: UUID;
  parentId?: UUID;
  attachmentIds?: UUID[];
  mentions?: UUID[];
}

export interface UpdateCommentDTO {
  content: string;
  attachmentIds?: UUID[];
  mentions?: UUID[];
}

// ============================================
// REACTIONS
// ============================================

export type ReactionType = '👍' | '👎' | '❤️' | '🎉' | '😄' | '😕' | '👀' | '🚀';

export interface CommentReaction {
  type: ReactionType;
  userId: UUID;
  createdAt: Date;
}

export interface ReactionSummary {
  type: ReactionType;
  count: number;
  users: Array<{ id: UUID; name: string }>;
  hasReacted: boolean;
}

// ============================================
// COMMENT THREAD
// ============================================

export interface CommentThread {
  rootComment: Comment;
  replies: Comment[];
  totalReplies: number;
  participants: User[];
  lastReplyAt: Date | null;
  isResolved: boolean;
  resolvedBy?: UUID;
  resolvedAt?: Date;
}

// ============================================
// FILTERS & SORTING
// ============================================

export interface CommentFilters {
  authorId?: UUID;
  hasAttachments?: boolean;
  hasMentions?: boolean;
  isPinned?: boolean;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export type CommentSortBy = 'newest' | 'oldest' | 'mostReplies' | 'mostReactions';

// ============================================
// COMMENT CONTEXT
// ============================================

export interface CommentContextValue {
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Actions
  loadComments: (entityType: string, entityId: UUID, filters?: CommentFilters) => Promise<void>;
  loadMoreComments: () => Promise<void>;
  createComment: (data: CreateCommentDTO) => Promise<Comment>;
  updateComment: (commentId: UUID, data: UpdateCommentDTO) => Promise<Comment>;
  deleteComment: (commentId: UUID) => Promise<void>;
  
  // Replies
  loadReplies: (commentId: UUID) => Promise<Comment[]>;
  
  // Reactions
  addReaction: (commentId: UUID, reaction: ReactionType) => Promise<void>;
  removeReaction: (commentId: UUID, reaction: ReactionType) => Promise<void>;
  
  // Pinning
  pinComment: (commentId: UUID) => Promise<void>;
  unpinComment: (commentId: UUID) => Promise<void>;
  
  // Thread resolution
  resolveThread: (commentId: UUID) => Promise<void>;
  unresolveThread: (commentId: UUID) => Promise<void>;
}

// ============================================
// RICH TEXT MENTIONS
// ============================================

export interface MentionSuggestion {
  id: UUID;
  type: 'user' | 'team' | 'project';
  name: string;
  avatarUrl?: string;
  description?: string;
}

// ============================================
// COMMENT NOTIFICATIONS
// ============================================

export interface CommentNotificationData {
  commentId: UUID;
  entityType: string;
  entityId: UUID;
  entityTitle: string;
  authorId: UUID;
  authorName: string;
  preview: string;
  mentionedUsers: UUID[];
}

