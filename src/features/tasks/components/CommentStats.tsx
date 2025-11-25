
import type { Comment } from '../types/comment';

interface CommentStatsProps {
  comments: Comment[];
  showDetailed?: boolean;
}

export function CommentStats({ comments, showDetailed = false }: CommentStatsProps) {
  const totalComments = comments.length;
  const activeComments = comments.filter(c => c.status === 'active').length;
  const resolvedComments = comments.filter(c => c.status === 'resolved').length;

  const resolutionRate = (resolvedComments / totalComments) * 100;

  const totalReactions = comments.reduce((sum, c) => {
    return sum + c.reactions.reduce((rSum, r) => rSum + r.count, 0);
  }, 0);

  const avgReactionsPerComment = totalReactions / totalComments;

  const authorCounts: Record<string, number> = {};
  comments.forEach(c => {
    authorCounts[c.author] = (authorCounts[c.author] || 0) + 1;
  });
  
  const mostActiveAuthor = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])[0];

  const commentAges = comments.map(c => {
    const ageMs = Date.now() - c.createdAt.getTime();
    return ageMs / (1000 * 60 * 60 * 24); // days
  });

  const oldestCommentDays = Math.max(...commentAges);
  const newestCommentDays = Math.min(...commentAges);
  
  const avgCommentAgeDays = commentAges.reduce((a, b) => a + b, 0) / commentAges.length;

  const commentsWithMentions = comments.filter(c => c.mentions.length > 0);
  const mentionRate = (commentsWithMentions.length / totalComments) * 100;

  const allMentions = comments.flatMap(c => c.mentions);
  const uniqueMentions = [...new Set(allMentions)];

  return (
    <div className="comment-stats">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{totalComments}</span>
          <span className="stat-label">Total Comments</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{activeComments}</span>
          <span className="stat-label">Active</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{resolvedComments}</span>
          <span className="stat-label">Resolved</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{resolutionRate.toFixed(1)}%</span>
          <span className="stat-label">Resolution Rate</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{totalReactions}</span>
          <span className="stat-label">Total Reactions</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{avgReactionsPerComment.toFixed(1)}</span>
          <span className="stat-label">Avg Reactions</span>
        </div>
      </div>

      {showDetailed && (
        <div className="detailed-stats">
          <div className="stat-section">
            <h4>Top Contributor</h4>
            <p>{mostActiveAuthor[0]} ({mostActiveAuthor[1]} comments)</p>
          </div>

          <div className="stat-section">
            <h4>Comment Age</h4>
            <p>Oldest: {oldestCommentDays.toFixed(0)} days</p>
            <p>Newest: {newestCommentDays.toFixed(0)} days</p>
            <p>Average: {avgCommentAgeDays.toFixed(1)} days</p>
          </div>

          <div className="stat-section">
            <h4>Mentions</h4>
            <p>{mentionRate.toFixed(1)}% of comments have mentions</p>
            <p>Users mentioned: {uniqueMentions.join(', ') || 'None'}</p>
          </div>

          <div className="stat-section">
            <h4>Unresolved Comments</h4>
            {activeComments === 0 ? (
              <p className="success">All comments resolved! 🎉</p>
            ) : (
              <ul className="unresolved-list">
                {comments
                  .filter(c => c.status === 'active')
                  .slice(0, 5)
                  .map(c => (
                    <li key={c.id}>
                      <strong>{c.author}:</strong> {c.content.substring(0, 50)}...
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

