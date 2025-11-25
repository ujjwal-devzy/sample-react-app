/**
 * Comment Repository - Data access for task comments
 * NOTE: This follows similar pattern to taskRepository
 */

import type { Comment, CreateCommentDTO, UpdateCommentDTO, CommentStatus } from '../types/comment';

const STORAGE_KEY = 'task_comments';

const generateId = (): string => {
  return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Seed data for demo
const SEED_COMMENTS: Comment[] = [
  {
    id: 'comment_1',
    taskId: 'task_1',
    author: 'Alice',
    content: 'I think we should use a more modern design approach here.',
    status: 'active',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    reactions: [{ emoji: '👍', count: 3, users: ['Bob', 'Charlie', 'Dana'] }],
    mentions: [],
    isEdited: false,
  },
  {
    id: 'comment_2',
    taskId: 'task_2',
    author: 'Bob',
    content: '@Charlie can you review the OAuth implementation?',
    status: 'active',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    reactions: [],
    mentions: ['Charlie'],
    isEdited: false,
  },
];

// BUG: Missing date serialization - taskRepository has this but we forgot it here!
// This will cause dates to become strings after localStorage round-trip
const serializeComments = (comments: Comment[]): string => {
  return JSON.stringify(comments);
};

const deserializeComments = (json: string): Comment[] => {
  return JSON.parse(json);
};

class CommentRepository {
  private getStoredComments(): Comment[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.saveComments(SEED_COMMENTS);
      return SEED_COMMENTS;
    }
    return deserializeComments(stored);
  }

  private saveComments(comments: Comment[]): void {
    localStorage.setItem(STORAGE_KEY, serializeComments(comments));
  }

  findAll(): Comment[] {
    return this.getStoredComments();
  }

  findByTaskId(taskId: string): Comment[] {
    return this.getStoredComments().filter(c => c.taskId === taskId);
  }

  findById(id: string): Comment | undefined {
    return this.getStoredComments().find(c => c.id === id);
  }

  // BUG: No input validation - author and content could be empty strings
  create(dto: CreateCommentDTO): Comment {
    const comments = this.getStoredComments();
    const now = new Date();

    const newComment: Comment = {
      id: generateId(),
      taskId: dto.taskId,
      author: dto.author,
      content: dto.content,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      reactions: [],
      mentions: dto.mentions || [],
      isEdited: false,
    };

    comments.push(newComment);
    this.saveComments(comments);
    return newComment;
  }

  update(id: string, dto: UpdateCommentDTO): Comment | null {
    const comments = this.getStoredComments();
    const index = comments.findIndex(c => c.id === id);

    if (index === -1) return null;

    // BUG: Not setting isEdited flag when content changes
    const updatedComment: Comment = {
      ...comments[index],
      ...dto,
      updatedAt: new Date(),
    };

    comments[index] = updatedComment;
    this.saveComments(comments);
    return updatedComment;
  }

  delete(id: string): boolean {
    const comments = this.getStoredComments();
    const filtered = comments.filter(c => c.id !== id);

    if (filtered.length === comments.length) return false;

    this.saveComments(filtered);
    return true;
  }

  // BUG: This doesn't handle the case where comment is already archived
  archiveComment(id: string): Comment | null {
    return this.update(id, { status: 'archived' });
  }

  addReaction(commentId: string, emoji: string, userId: string): Comment | null {
    const comments = this.getStoredComments();
    const index = comments.findIndex(c => c.id === commentId);

    if (index === -1) return null;

    const comment = comments[index];
    const reactionIndex = comment.reactions.findIndex(r => r.emoji === emoji);

    if (reactionIndex === -1) {
      comment.reactions.push({ emoji, count: 1, users: [userId] });
    } else {
      // BUG: Doesn't check if user already reacted - allows duplicate reactions
      comment.reactions[reactionIndex].count++;
      comment.reactions[reactionIndex].users.push(userId);
    }

    comments[index] = comment;
    this.saveComments(comments);
    return comment;
  }

  // Get comment statistics for a task
  getTaskCommentStats(taskId: string) {
    const comments = this.findByTaskId(taskId);
    const activeComments = comments.filter(c => c.status === 'active');
    const resolvedComments = comments.filter(c => c.status === 'resolved');

    // BUG: Division by zero if no comments exist (similar to TaskMetrics issue)
    // useTasks.ts handles this correctly at line 40-42, but we forgot here
    const resolutionRate = (resolvedComments.length / comments.length) * 100;

    return {
      total: comments.length,
      active: activeComments.length,
      resolved: resolvedComments.length,
      resolutionRate,
      // BUG: Accessing .getTime() on potentially deserialized string dates
      avgResponseTime: this.calculateAvgResponseTime(comments),
    };
  }

  private calculateAvgResponseTime(comments: Comment[]): number {
    if (comments.length < 2) return 0;

    let totalTime = 0;
    for (let i = 1; i < comments.length; i++) {
      // BUG: createdAt might be a string after deserialization, not a Date object
      const timeDiff = comments[i].createdAt.getTime() - comments[i - 1].createdAt.getTime();
      totalTime += timeDiff;
    }

    return totalTime / (comments.length - 1);
  }
}

export const commentRepository = new CommentRepository();

