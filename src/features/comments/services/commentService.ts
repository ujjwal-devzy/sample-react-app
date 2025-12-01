/**
 * Comment Service
 * Handles comment-related API calls
 */

import type { UUID } from '../../../core/types';
import { api } from '../../../core/api';
import { generateUUID } from '../../../core/utils/id';
import type {
  Comment,
  CreateCommentDTO,
  UpdateCommentDTO,
  CommentFilters,
  ReactionType,
} from '../types';

// ============================================
// MOCK DATA
// ============================================

const USE_MOCK = true;

const MOCK_COMMENTS: Comment[] = [
  {
    id: 'comment_001',
    content: 'Great progress on this task! The implementation looks clean.',
    entityType: 'task',
    entityId: 'task_001',
    authorId: 'user_001',
    parentId: null,
    replyCount: 2,
    attachments: [],
    mentions: [],
    reactions: [
      { type: '👍', userId: 'user_002', createdAt: new Date() },
      { type: '🎉', userId: 'user_003', createdAt: new Date() },
    ],
    isEdited: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    deletedAt: null,
  },
  {
    id: 'comment_002',
    content: '@alice Can you review the authentication flow? I think we need to add some additional validation.',
    entityType: 'task',
    entityId: 'task_001',
    authorId: 'user_002',
    parentId: null,
    replyCount: 1,
    attachments: [],
    mentions: ['user_002'],
    reactions: [
      { type: '👀', userId: 'user_002', createdAt: new Date() },
    ],
    isEdited: true,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    deletedAt: null,
  },
  {
    id: 'comment_003',
    content: 'Thanks for the feedback! I\'ll make those changes.',
    entityType: 'task',
    entityId: 'task_001',
    authorId: 'user_001',
    parentId: 'comment_001',
    replyCount: 0,
    attachments: [],
    mentions: [],
    reactions: [],
    isEdited: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45),
    deletedAt: null,
  },
  {
    id: 'comment_004',
    content: 'I\'ve identified a potential issue with the current approach. Let me share my thoughts:\n\n1. The error handling needs improvement\n2. We should add retry logic\n3. Consider caching the results',
    entityType: 'task',
    entityId: 'task_001',
    authorId: 'user_003',
    parentId: null,
    replyCount: 0,
    attachments: [],
    mentions: [],
    reactions: [
      { type: '👍', userId: 'user_001', createdAt: new Date() },
      { type: '👍', userId: 'user_002', createdAt: new Date() },
    ],
    isEdited: false,
    isPinned: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    deletedAt: null,
  },
];

// ============================================
// COMMENT SERVICE
// ============================================

class CommentService {
  private mockDelay(ms = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get comments for an entity
   */
  async getComments(
    entityType: string,
    entityId: UUID,
    filters?: CommentFilters,
    page = 1,
    limit = 20
  ): Promise<{ comments: Comment[]; hasMore: boolean }> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      let filtered = MOCK_COMMENTS.filter(
        c => c.entityType === entityType && c.entityId === entityId && c.parentId === null
      );

      if (filters) {
        if (filters.authorId) {
          filtered = filtered.filter(c => c.authorId === filters.authorId);
        }
        if (filters.isPinned !== undefined) {
          filtered = filtered.filter(c => c.isPinned === filters.isPinned);
        }
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(c => c.content.toLowerCase().includes(search));
        }
      }

      const start = (page - 1) * limit;
      const end = start + limit;

      return {
        comments: filtered.slice(start, end),
        hasMore: end < filtered.length,
      };
    }

    const response = await api.get<{ comments: Comment[]; hasMore: boolean }>(
      `/comments`,
      { params: { entityType, entityId, ...filters, page, limit } }
    );
    return response.data;
  }

  /**
   * Get comment by ID
   */
  async getComment(commentId: UUID): Promise<Comment> {
    if (USE_MOCK) {
      await this.mockDelay();
      const comment = MOCK_COMMENTS.find(c => c.id === commentId);
      if (!comment) {
        throw new Error('Comment not found');
      }
      return comment;
    }

    const response = await api.get<Comment>(`/comments/${commentId}`);
    return response.data;
  }

  /**
   * Create a comment
   */
  async createComment(data: CreateCommentDTO): Promise<Comment> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const newComment: Comment = {
        id: generateUUID(),
        content: data.content,
        entityType: data.entityType,
        entityId: data.entityId,
        authorId: 'user_001',
        parentId: data.parentId || null,
        replyCount: 0,
        attachments: [],
        mentions: data.mentions || [],
        reactions: [],
        isEdited: false,
        isPinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      MOCK_COMMENTS.unshift(newComment);

      // Update parent's reply count
      if (data.parentId) {
        const parent = MOCK_COMMENTS.find(c => c.id === data.parentId);
        if (parent) {
          parent.replyCount++;
        }
      }

      return newComment;
    }

    const response = await api.post<Comment>('/comments', data);
    return response.data;
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: UUID, data: UpdateCommentDTO): Promise<Comment> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const index = MOCK_COMMENTS.findIndex(c => c.id === commentId);
      if (index === -1) {
        throw new Error('Comment not found');
      }

      MOCK_COMMENTS[index] = {
        ...MOCK_COMMENTS[index],
        content: data.content,
        mentions: data.mentions || MOCK_COMMENTS[index].mentions,
        isEdited: true,
        updatedAt: new Date(),
      };

      return MOCK_COMMENTS[index];
    }

    const response = await api.patch<Comment>(`/comments/${commentId}`, data);
    return response.data;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay();
      
      const comment = MOCK_COMMENTS.find(c => c.id === commentId);
      if (comment) {
        comment.deletedAt = new Date();
        comment.content = '[This comment has been deleted]';

        // Update parent's reply count
        if (comment.parentId) {
          const parent = MOCK_COMMENTS.find(c => c.id === comment.parentId);
          if (parent && parent.replyCount > 0) {
            parent.replyCount--;
          }
        }
      }
      return;
    }

    await api.delete(`/comments/${commentId}`);
  }

  /**
   * Get replies to a comment
   */
  async getReplies(commentId: UUID): Promise<Comment[]> {
    if (USE_MOCK) {
      await this.mockDelay();
      return MOCK_COMMENTS.filter(c => c.parentId === commentId);
    }

    const response = await api.get<Comment[]>(`/comments/${commentId}/replies`);
    return response.data;
  }

  /**
   * Add reaction to comment
   */
  async addReaction(commentId: UUID, reaction: ReactionType): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      
      const comment = MOCK_COMMENTS.find(c => c.id === commentId);
      if (comment) {
        // Remove existing reaction of same type from user
        comment.reactions = comment.reactions.filter(
          r => !(r.userId === 'user_001' && r.type === reaction)
        );
        // Add new reaction
        comment.reactions.push({
          type: reaction,
          userId: 'user_001',
          createdAt: new Date(),
        });
      }
      return;
    }

    await api.post(`/comments/${commentId}/reactions`, { reaction });
  }

  /**
   * Remove reaction from comment
   */
  async removeReaction(commentId: UUID, reaction: ReactionType): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      
      const comment = MOCK_COMMENTS.find(c => c.id === commentId);
      if (comment) {
        comment.reactions = comment.reactions.filter(
          r => !(r.userId === 'user_001' && r.type === reaction)
        );
      }
      return;
    }

    await api.delete(`/comments/${commentId}/reactions/${reaction}`);
  }

  /**
   * Pin a comment
   */
  async pinComment(commentId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      
      const comment = MOCK_COMMENTS.find(c => c.id === commentId);
      if (comment) {
        comment.isPinned = true;
      }
      return;
    }

    await api.post(`/comments/${commentId}/pin`);
  }

  /**
   * Unpin a comment
   */
  async unpinComment(commentId: UUID): Promise<void> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      
      const comment = MOCK_COMMENTS.find(c => c.id === commentId);
      if (comment) {
        comment.isPinned = false;
      }
      return;
    }

    await api.delete(`/comments/${commentId}/pin`);
  }

  /**
   * Get comment count for an entity
   */
  async getCommentCount(entityType: string, entityId: UUID): Promise<number> {
    if (USE_MOCK) {
      await this.mockDelay(200);
      return MOCK_COMMENTS.filter(
        c => c.entityType === entityType && c.entityId === entityId && !c.deletedAt
      ).length;
    }

    const response = await api.get<{ count: number }>(`/comments/count`, {
      params: { entityType, entityId },
    });
    return response.data.count;
  }
}

export const commentService = new CommentService();

