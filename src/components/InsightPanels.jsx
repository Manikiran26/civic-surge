import { BarChart3, Compass, Gauge, Radar } from "lucide-react";

function formatBudget(projects) {
  const value = projects.reduce((sum, project) => {
    return sum + (typeof project.budgetInrCrore === "number" ? project.budgetInrCrore : 0);
  }, 0);

  return value ? `₹${value.toLocaleString("en-IN")} cr` : "Partial / unknown";
}

function groupByType(projects) {
  const grouped = {};

  projects.forEach((project) => {
    grouped[project.type] = (grouped[project.type] || 0) + 1;
  });

  return Object.entries(grouped)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);
}

export default function InsightPanels({ projects, nearbyProjects }) {
  const typeMix = groupByType(projects);

  return (
    <>
      <section className="panel-block">
        <div className="panel-block__header">
          <span className="eyebrow eyebrow--compact">
            <BarChart3 size={14} />
            Impact snapshot
          </span>
        </div>
        <div className="metric-grid metric-grid--compact">
          <div className="metric-card">
            <span>Portfolio budget</span>
            <strong>{formatBudget(projects)}</strong>
          </div>
          <div className="metric-card">
            <span>Near-user projects</span>
            <strong>{nearbyProjects.length}</strong>
          </div>
          <div className="metric-card">
            <span>Completed share</span>
            <strong>
              {projects.length
                ? `${Math.round((projects.filter((project) => project.status === "completed").length / projects.length) * 100)}%`
                : "0%"}
            </strong>
          </div>
          <div className="metric-card">
            <span>Geofence mode</span>
            <strong>3 km adaptive radius</strong>
          </div>
        </div>
      </section>

      <section className="panel-block">
        <div className="panel-block__header">
          <span className="eyebrow eyebrow--compact">
            <Gauge size={14} />
            Sector mix
          </span>
        </div>
        <div className="chart-stack">
          {typeMix.map(([type, count]) => (
            <div key={type} className="chart-row">
              <div className="chart-row__label">
                <span>{type}</span>
                <strong>{count}</strong>
              </div>
              <div className="chart-row__bar">
                <div
                  className="chart-row__fill"
                  style={{ width: `${Math.max(16, Math.round((count / projects.length) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-block">
        <div className="panel-block__header">
          <span className="eyebrow eyebrow--compact">
            <Radar size={14} />
            Geo-fence logic
          </span>
        </div>
        <ul className="checklist">
          <li>Uses live browser geolocation with a nearby-project API query.</li>
          <li>Shows notifications once per session using `sessionStorage` keys.</li>
          <li>Fallback behaviour keeps the map functional if live GPS is unavailable.</li>
        </ul>
      </section>

      <section className="panel-block">
        <div className="panel-block__header">
          <span className="eyebrow eyebrow--compact">
            <Compass size={14} />
            AR / 3D design path
          </span>
        </div>
        <p className="panel-summary">
          WebXR mode is designed as a next step: device camera feed, heading-locked project billboards, and distance-tagged
          overlays using the same project API and geofence engine.
        </p>
      </section>
    </>
  );
}
