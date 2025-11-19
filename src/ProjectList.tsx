import { useMemo } from "react";

type Project = {
  id: number;
  name: string;
  status: "active" | "paused" | "completed";
};

type ProjectListProps = {
  projects: Project[];
};

// Very similar to UserList on purpose – small differences + a similar bug
export function ProjectList({ projects }: ProjectListProps) {
  const totalProjects = projects.length;

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status === "active").length,
    [projects]
  );

  const pausedProjects = useMemo(
    () => projects.filter((project) => project.status === "paused").length,
    [projects]
  );

  const completedProjects = useMemo(
    () => projects.filter((project) => project.status === "completed").length,
    [projects]
  );

  return (
    <section className="panel">
      <h2>Project Overview</h2>
      <p className="panel-description">
        This project summary intentionally mirrors the user overview component
        so that duplicate review feedback can be consolidated by your agent.
      </p>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-label">Total projects</div>
          <div className="stat-value">{totalProjects}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value">{activeProjects}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paused</div>
          <div className="stat-value">{pausedProjects}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completedProjects}</div>
        </div>
      </div>

      <ul className="entity-list">
        {projects.map((project) => (
          <li key={project.id} className="entity-row">
            <span className="entity-name">{project.name}</span>
            <span className="entity-meta">{project.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
