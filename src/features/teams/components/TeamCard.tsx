/**
 * Team Card Component
 * Display team information in a card format
 */

import type { Team } from '../types';
import { Card, CardContent } from '../../../shared/components/Card';
import { Avatar, AvatarGroup } from '../../../shared/components/Avatar';

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export function TeamCard({ team, onClick, selected = false, className = '' }: TeamCardProps) {
  // Create placeholder avatars based on member count
  const memberAvatars = Array.from({ length: Math.min(team.memberCount, 5) }, (_, i) => ({
    id: `member_${i}`,
    name: `Member ${i + 1}`,
    src: undefined,
  }));

  return (
    <Card
      hoverable
      clickable={!!onClick}
      selected={selected}
      onClick={onClick}
      className={`team-card ${className}`}
    >
      <CardContent>
        <div className="team-card-header">
          <Avatar
            name={team.name}
            src={team.avatarUrl}
            size="lg"
          />
          <div className="team-card-info">
            <h3 className="team-card-name">{team.name}</h3>
          </div>
        </div>

        {team.description && (
          <p className="team-card-description">{team.description}</p>
        )}

        <div className="team-card-footer">
          <div className="team-card-members">
            <AvatarGroup avatars={memberAvatars} max={4} size="sm" />
            <span className="team-card-member-count">
              {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="team-card-stats">
            <span className="team-card-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              {team.projectCount} projects
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TeamCardCompactProps {
  team: Team;
  onClick?: () => void;
  className?: string;
}

export function TeamCardCompact({ team, onClick, className = '' }: TeamCardCompactProps) {
  return (
    <div
      className={`team-card-compact ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Avatar name={team.name} src={team.avatarUrl} size="md" />
      <div className="team-card-compact-info">
        <span className="team-card-compact-name">{team.name}</span>
        <span className="team-card-compact-count">{team.memberCount} members</span>
      </div>
    </div>
  );
}
