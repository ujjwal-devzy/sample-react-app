import { useState } from "react";
import { formatDate } from "../utils/formatters";

// UserCard component displays user information
// Props: user object with id, name, email, createdAt
// Shows user details in a card format
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}

export function UserCard({ user }: UserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle expanded state
  // Switches between collapsed and expanded view
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="user-card">
      <div className="user-card-header">
        <h3>{user.name}</h3>
        <button onClick={handleToggle}>
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <div className="user-card-body">
        <p>Email: {user.email}</p>
        <p>ID: {user.id}</p>
        {isExpanded && (
          <div className="user-card-details">
            <p>Created: {formatDate(user.createdAt)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

