import "./App.css";
import { ActivityFeed } from "./ActivityFeed";
import { ProjectList } from "./ProjectList";
import { UserList } from "./UserList";

const mockUsers = [
  { id: 1, name: "Alice Johnson", role: "admin" as const },
  { id: 2, name: "Bob Smith", role: "editor" as const },
  { id: 3, name: "Charlie Davis", role: "viewer" as const },
  { id: 4, name: "Dana Lee", role: "admin" as const },
];

const mockProjects = [
  { id: 1, name: "Design System Refresh", status: "active" as const },
  { id: 2, name: "Mobile App v2", status: "paused" as const },
  { id: 3, name: "Internal Tools", status: "completed" as const },
  { id: 4, name: "Landing Page Experiments", status: "active" as const },
];

const mockActivities = [
  { id: 1, label: "Alice created a new project", type: "info" as const },
  { id: 2, label: "Bob paused Mobile App v2", type: "warning" as const },
  { id: 3, label: "Build failed on main branch", type: "error" as const },
  { id: 4, label: "Dana updated project settings", type: "info" as const },
];

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Sample Dashboard</h1>
        <p className="app-subtitle">
          This dashboard intentionally contains repeated patterns and similar
          logic issues so your code review agent can test duplicate detection
          and comment consolidation.
        </p>
      </header>

      <main className="app-layout">
        <div className="app-main-column">
          <UserList users={mockUsers} />
          <ProjectList projects={mockProjects} />
        </div>
        <aside className="app-side-column">
          <ActivityFeed activities={mockActivities} />
        </aside>
      </main>
    </div>
  );
}

export default App;
