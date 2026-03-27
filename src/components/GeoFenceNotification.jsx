import { useEffect, useState } from "react";
import { BellRing, LocateFixed, X } from "lucide-react";

function buildMessage(project) {
  if (!project) {
    return "";
  }

  if (project.type === "road" || project.type === "highway" || project.type === "metro" || project.type === "regional-rail") {
    return "Mobility infrastructure nearby. Expect travel-time and connectivity benefits once this project is active.";
  }

  if (project.type === "hospital") {
    return "Health infrastructure nearby. This project expands access to advanced care capacity for surrounding residents.";
  }

  return project.impactSummary;
}

export default function GeoFenceNotification({ nearbyProjects, onSelectProject }) {
  const [dismissedProjectIds, setDismissedProjectIds] = useState([]);

  const activeProject =
    nearbyProjects.find((project) => {
      return !dismissedProjectIds.includes(project.id) && !window.sessionStorage.getItem(`geo-alert:${project.id}`);
    }) || null;

  useEffect(() => {
    if (!activeProject) {
      return undefined;
    }

    window.sessionStorage.setItem(`geo-alert:${activeProject.id}`, "seen");

    const timer = window.setTimeout(() => {
      setDismissedProjectIds((current) => [...current, activeProject.id]);
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [activeProject]);

  if (!activeProject) {
    return null;
  }

  return (
    <aside className="geo-toast">
      <div className="geo-toast__header">
      <div className="eyebrow eyebrow--compact">
          <BellRing size={14} />
          Geo-fence triggered
        </div>
        <button
          className="icon-button"
          onClick={() => setDismissedProjectIds((current) => [...current, activeProject.id])}
        >
          <X size={14} />
        </button>
      </div>
      <strong>{activeProject.name}</strong>
      <p>{buildMessage(activeProject)}</p>
      <div className="detail-list">
        <div>
          <LocateFixed size={14} />
          <span>{activeProject.locationLabel}</span>
        </div>
        <div>
          <span>{activeProject.status}</span>
        </div>
      </div>
      <button
        className="primary-button"
        onClick={() => {
          onSelectProject(activeProject.id);
          setDismissedProjectIds((current) => [...current, activeProject.id]);
        }}
      >
        Inspect project
      </button>
    </aside>
  );
}
