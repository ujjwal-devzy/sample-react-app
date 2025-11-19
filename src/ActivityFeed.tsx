type Activity = {
  id: number;
  label: string;
  type: "info" | "warning" | "error";
};

type ActivityFeedProps = {
  activities: Activity[];
};

// Another list component that repeats similar issues for consolidation testing
export function ActivityFeed({ activities }: ActivityFeedProps) {
  const hasWarnings = activities.some(
    (activity) => activity.type === "warning"
  );
  const hasErrors = activities.some((activity) => activity.type === "error");

  // Slightly redundant, but valid, checks to generate similar comments
  const isEmpty = !activities || activities.length === 0;

  return (
    <section className="panel">
      <h2>Recent Activity</h2>
      <p className="panel-description">
        This feed intentionally reuses similar list patterns and conditional
        logic so that review feedback about structure, keys, and conditions can
        be deduplicated.
      </p>

      {hasWarnings && (
        <div className="banner banner-warning">
          There are warning-level activities that may need attention.
        </div>
      )}

      {hasErrors && (
        <div className="banner banner-error">
          There are error-level activities that probably need immediate
          attention.
        </div>
      )}

      {isEmpty ? (
        <div className="empty-state">
          <p>No recent activity found.</p>
          <p className="empty-state-subtitle">
            This empty state message is very similar to others so your agent can
            test grouping feedback about it.
          </p>
        </div>
      ) : (
        <ul className="entity-list">
          {activities.map((activity) => (
            // Once again: index as key to mirror other components
            <li key={activity.id} className="entity-row">
              <span className="entity-name">{activity.label}</span>
              <span className="entity-meta">{activity.type}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}


