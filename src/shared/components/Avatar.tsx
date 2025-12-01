/**
 * Avatar Component
 * User avatar with fallback to initials
 */

import { useState } from 'react';
import { getInitials } from '../../core/utils/string';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
  onClick?: () => void;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'avatar-xs',
  sm: 'avatar-sm',
  md: 'avatar-md',
  lg: 'avatar-lg',
  xl: 'avatar-xl',
  '2xl': 'avatar-2xl',
};

const sizePx: Record<AvatarSize, number> = {
  xs: 20,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
  '2xl': 64,
};

export function Avatar({
  src,
  alt,
  name = '',
  size = 'md',
  className = '',
  onClick,
  showOnlineStatus = false,
  isOnline = false,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = getInitials(name || alt || 'U', 2);
  const showImage = src && !imageError;

  const handleClick = onClick
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick();
      }
    : undefined;

  return (
    <div
      className={`avatar ${sizeClasses[size]} ${onClick ? 'avatar-clickable' : ''} ${className}`}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          className="avatar-image"
          onError={() => setImageError(true)}
          width={sizePx[size]}
          height={sizePx[size]}
        />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
      {showOnlineStatus && (
        <span className={`avatar-status ${isOnline ? 'online' : 'offline'}`} />
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{
    src?: string | null;
    name: string;
    id?: string;
  }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = 'sm',
  className = '',
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={`avatar-group ${className}`}>
      {visible.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          src={avatar.src}
          name={avatar.name}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <div className={`avatar ${sizeClasses[size]} avatar-overflow`}>
          <span className="avatar-initials">+{remaining}</span>
        </div>
      )}
    </div>
  );
}

