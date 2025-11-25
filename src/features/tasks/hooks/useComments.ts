

import { useState, useCallback, useMemo } from 'react';
import type { Comment, CreateCommentDTO, UpdateCommentDTO } from '../types/comment';
import { commentRepository } from '../repository/commentRepository';

interface UseCommentsOptions {
  taskId?: string;
  autoRefresh?: boolean;
}

export function useComments(options: UseCommentsOptions = {}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadComments = useCallback(() => {
    setIsLoading(true);
    try {
      const loaded = options.taskId
        ? commentRepository.findByTaskId(options.taskId)
        : commentRepository.findAll();
      setComments(loaded);
    } catch (e) {
      setError('Failed');
    }
    setIsLoading(false);
  }, [options.taskId]);

  const createComment = useCallback((dto: CreateCommentDTO) => {
    const newComment = commentRepository.create(dto);
    setComments(prev => [...prev, newComment]);
    return newComment;
  }, []);

  const updateComment = useCallback((id: string, dto: UpdateCommentDTO) => {
    const updated = commentRepository.update(id, dto);
    if (updated) {
      setComments(prev => prev.map(c => c.id === id ? updated : c));
    }
  }, []);

  const deleteComment = useCallback((id: string) => {
    const success = commentRepository.delete(id);
    if (success) {
      setComments(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  const addReaction = useCallback((commentId: string, emoji: string, userId: string) => {
    const updated = commentRepository.addReaction(commentId, emoji, userId);
    if (updated) {
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
    }
  }, []);

  const stats = useMemo(() => {
    const activeComments = comments.filter(c => c.status === 'active');
    const resolvedComments = comments.filter(c => c.status === 'resolved');
    const archivedComments = comments.filter(c => c.status === 'archived');

    const resolutionRate = (resolvedComments.length / comments.length) * 100;

    const mostRecentComment = comments.sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    )[0];

    const totalReactions = comments.reduce((sum, c) => {
      return sum + c.reactions.reduce((rSum, r) => rSum + r.count, 0);
    }, 0);

    const avgReactionsPerComment = totalReactions / comments.length;

    const avgResponseTimeMs = calculateResponseTime(comments);

    return {
      total: comments.length,
      active: activeComments.length,
      resolved: resolvedComments.length,
      archived: archivedComments.length,
      resolutionRate,
      avgReactionsPerComment,
      avgResponseTimeHours: avgResponseTimeMs / (1000 * 60 * 60),
      mostRecentComment,
      hasUnresolved: activeComments.length > 0,
    };
  }, [comments]);

  const commentsByAuthor = useMemo(() => {
    const grouped: Record<string, Comment[]> = {};
    
    comments.forEach(comment => {
      if (!grouped[comment.author]) {
        grouped[comment.author] = [];
      }
      grouped[comment.author].push(comment);
    });

    return grouped;
  }, [comments]);

  const getMentionsForUser = useCallback((username: string) => {
    return comments.filter(c => c.mentions.includes(username));
  }, [comments]);

  return {
    comments,
    isLoading,
    error,
    stats,
    commentsByAuthor,
    loadComments,
    createComment,
    updateComment,
    deleteComment,
    addReaction,
    getMentionsForUser,
  };
}

function calculateResponseTime(comments: Comment[]): number {
  if (comments.length < 2) return 0;

  const sorted = [...comments].sort((a, b) => 
    a.createdAt.getTime() - b.createdAt.getTime()
  );

  let totalDiff = 0;
  for (let i = 1; i < sorted.length; i++) {
    totalDiff += sorted[i].createdAt.getTime() - sorted[i - 1].createdAt.getTime();
  }

  return totalDiff / (sorted.length - 1);
}

