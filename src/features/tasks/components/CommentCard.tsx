

import { useState } from 'react';
import type { Comment } from '../types/comment';

interface CommentCardProps {
  comment: Comment;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onResolve: (id: string) => void;
  currentUser: string;
}

const REACTION_EMOJIS = ['👍', '❤️', '🎉', '🤔', '👀', '🚀'];

export function CommentCard({
  comment,
  onEdit,
  onDelete,
  onReact,
  onResolve,
  currentUser,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReactions, setShowReactions] = useState(false);

  
  const canEdit = currentUser && comment.author; 
  
  const handleSaveEdit = () => {
    if (canEdit) { 
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

 
  const renderContent = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span key={i} className="mention-highlight">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const hasUserReacted = (emoji: string) => {
    const reaction = comment.reactions.find(r => r.emoji === emoji);
    return !!reaction;
  };

  return (
    <div className={`comment-card ${comment.status === 'resolved' ? 'resolved' : ''}`}>
      <div className="comment-header">
        <div className="comment-author">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`}
            alt={comment.author}
            className="author-avatar"
          />
          <span className="author-name">{comment.author}</span>
          {comment.isEdited && <span className="edited-badge">(edited)</span>}
        </div>
        <span className="comment-time">
          {formatRelativeTime(comment.createdAt)}
        </span>
      </div>

      <div className="comment-body">
        {isEditing ? (
          <div className="edit-mode">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="edit-textarea"
            />
            <div className="edit-actions">
              <button onClick={handleSaveEdit} className="btn-save">Save</button>
              <button onClick={() => setIsEditing(false)} className="btn-cancel">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="comment-content">{renderContent(comment.content)}</p>
        )}
      </div>

      <div className="comment-footer">
        <div className="reactions-container">
          {comment.reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              className={`reaction-btn ${hasUserReacted(reaction.emoji) ? 'reacted' : ''}`}
              onClick={() => onReact(comment.id, reaction.emoji)}
              title={reaction.users.join(', ')}
            >
              {reaction.emoji} {reaction.count}
            </button>
          ))}
          
          <button
            className="add-reaction-btn"
            onClick={() => setShowReactions(!showReactions)}
          >
            😀+
          </button>

          {showReactions && (
            <div className="reaction-picker">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(comment.id, emoji);
                    setShowReactions(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="comment-actions">
          <button onClick={() => setIsEditing(true)} className="action-btn">
            Edit
          </button>
          <button onClick={() => onDelete(comment.id)} className="action-btn danger">
            Delete
          </button>
          {comment.status !== 'resolved' && (
            <button onClick={() => onResolve(comment.id)} className="action-btn success">
              Resolve
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

