/**
 * Team List Component
 * Display list of teams
 */

import { useState, useEffect } from 'react';
import type { Team, TeamFilters, TeamSortBy } from '../types';
import { teamService } from '../services/teamService';
import { TeamCard } from './TeamCard';
import { SearchInput } from '../../../shared/components/SearchInput';
import { Button } from '../../../shared/components/Button';
import { EmptyState } from '../../../shared/components/EmptyState';
import { SkeletonCard } from '../../../shared/components/Loading';
import { Dropdown, DropdownItem } from '../../../shared/components/Dropdown';

interface TeamListProps {
  onTeamSelect?: (team: Team) => void;
  onCreateTeam?: () => void;
  className?: string;
}

export function TeamList({ onTeamSelect, onCreateTeam, className = '' }: TeamListProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TeamFilters>({});
  const [sortBy, setSortBy] = useState<TeamSortBy>('name');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    loadTeams();
  }, [filters, sortBy]);

  const loadTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await teamService.getTeams(filters, sortBy);
      setTeams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query || undefined }));
  };

  const handleTeamClick = (team: Team) => {
    setSelectedTeamId(team.id);
    onTeamSelect?.(team);
  };

  const sortOptions: { value: TeamSortBy; label: string }[] = [
    { value: 'name', label: 'Name' },
    { value: 'memberCount', label: 'Member Count' },
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
  ];

  if (isLoading) {
    return (
      <div className={`team-list ${className}`}>
        <div className="team-list-header">
        <SearchInput placeholder="Search teams..." disabled />
        </div>
        <div className="team-list-grid">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`team-list ${className}`}>
        <EmptyState
          title="Failed to load teams"
          description={error}
          action={{ label: 'Retry', onClick: loadTeams }}
        />
      </div>
    );
  }

  return (
    <div className={`team-list ${className}`}>
      <div className="team-list-header">
        <SearchInput
          placeholder="Search teams..."
          onSearch={handleSearch}
          debounceMs={300}
        />
        <div className="team-list-actions">
          <Dropdown
            trigger={
              <Button variant="secondary" size="sm">
                Sort: {sortOptions.find((o) => o.value === sortBy)?.label}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </Button>
            }
          >
            {sortOptions.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => setSortBy(option.value)}
              >
                {option.label}
              </DropdownItem>
            ))}
          </Dropdown>
          {onCreateTeam && (
            <Button onClick={onCreateTeam}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Create Team
            </Button>
          )}
        </div>
      </div>

      {teams.length === 0 ? (
        <EmptyState
          title="No teams found"
          description={filters.search ? 'Try a different search term' : 'Create your first team to get started'}
          action={onCreateTeam ? { label: 'Create Team', onClick: onCreateTeam } : undefined}
        />
      ) : (
        <div className="team-list-grid">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onClick={() => handleTeamClick(team)}
              selected={team.id === selectedTeamId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

