/**
 * Team Members Component
 * Manage team members
 */

import { useState } from 'react';
import type { TeamMemberWithUser, TeamRole } from '../types';
import { Avatar } from '../../../shared/components/Avatar';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { Dropdown, DropdownItem, DropdownDivider } from '../../../shared/components/Dropdown';
import { SearchInput } from '../../../shared/components/SearchInput';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';

interface TeamMembersProps {
  members: TeamMemberWithUser[];
  currentUserId: string;
  canManageMembers?: boolean;
  onUpdateRole?: (memberId: string, role: TeamRole) => void;
  onRemoveMember?: (memberId: string) => void;
  onInviteMember?: (email: string) => void;
  className?: string;
}

export function TeamMembers({
  members,
  currentUserId,
  canManageMembers = false,
  onUpdateRole,
  onRemoveMember,
  onInviteMember,
  className = '',
}: TeamMembersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const filteredMembers = members.filter((member) => {
    if (!searchQuery) return true;
    const name = member.user?.displayName?.toLowerCase() || '';
    const email = member.user?.email?.toLowerCase() || '';
    return name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  const roleOptions: { value: TeamRole; label: string }[] = [
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'member', label: 'Member' },
    { value: 'guest', label: 'Guest' },
  ];

  const roleBadgeVariant: Record<TeamRole, 'primary' | 'secondary' | 'default' | 'info'> = {
    owner: 'primary',
    admin: 'info',
    member: 'secondary',
    guest: 'default',
  };

  const handleInvite = () => {
    if (inviteEmail && onInviteMember) {
      onInviteMember(inviteEmail);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  return (
    <div className={`team-members ${className}`}>
      <div className="team-members-header">
        <SearchInput
          placeholder="Search members..."
          onSearch={setSearchQuery}
          size="sm"
        />
        {canManageMembers && onInviteMember && (
          <Button size="sm" onClick={() => setShowInviteModal(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Invite
          </Button>
        )}
      </div>

      <div className="team-members-list">
        {filteredMembers.map((member) => (
          <div key={member.userId} className="team-member-item">
            <div className="team-member-info">
              <Avatar
                name={member.user?.displayName}
                src={member.user?.avatarUrl}
                size="md"
              />
              <div className="team-member-details">
                <span className="team-member-name">
                  {member.user?.displayName || 'Unknown'}
                  {member.userId === currentUserId && (
                    <span className="team-member-you">(You)</span>
                  )}
                </span>
                <span className="team-member-email">{member.user?.email}</span>
              </div>
            </div>

            <div className="team-member-actions">
              <Badge variant={roleBadgeVariant[member.role]} size="sm">
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </Badge>

              {canManageMembers && member.userId !== currentUserId && member.role !== 'owner' && (
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </Button>
                  }
                  placement="bottom-end"
                >
                  {roleOptions.filter((r) => r.value !== 'owner').map((option) => (
                    <DropdownItem
                      key={option.value}
                      onClick={() => onUpdateRole?.(member.userId, option.value)}
                    >
                      Change to {option.label}
                    </DropdownItem>
                  ))}
                  <DropdownDivider />
                  <DropdownItem
                    danger
                    onClick={() => onRemoveMember?.(member.userId)}
                  >
                    Remove from team
                  </DropdownItem>
                </Dropdown>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite Team Member"
      >
        <div className="invite-member-form">
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <div className="invite-member-actions">
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail}>
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
