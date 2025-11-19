import { useMemo } from "react";

type User = {
  id: number;
  name: string;
  role: "admin" | "editor" | "viewer";
};

type UserListProps = {
  users: User[];
};

// Intentionally a bit repetitive and slightly inconsistent to trigger duplicate comments
export function UserList({ users }: UserListProps) {
  const totalUsers = users.length;

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users]
  );

  // Bug: this is actually counting admins again instead of editors
  const editorCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users]
  );

  const viewerCount = useMemo(
    () => users.filter((user) => user.role === "viewer").length,
    [users]
  );

  return (
    <section className="panel">
      <h2>User Overview</h2>
      <p className="panel-description">
        Showing an overview of users in the system. This section intentionally
        uses repeated patterns so that a review agent can practice identifying
        and consolidating similar feedback.
      </p>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total users</div>
          <div className="stat-value">{totalUsers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Admins</div>
          <div className="stat-value">{adminCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Editors</div>
          <div className="stat-value">{editorCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Viewers</div>
          <div className="stat-value">{viewerCount}</div>
        </div>
      </div>

      <ul className="entity-list">
        {users.map((user) => (
          // Anti-pattern: index as key – repeated across multiple lists on purpose
          <li key={user.id} className="entity-row">
            <span className="entity-name">{user.name}</span>
            <span className="entity-meta">{user.role}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}


