import { Bookmark, MapPin, X } from "lucide-react";

export default function ProjectInfoPanel({ project, onClose, onOpen3D, onToggleBookmark, isBookmarked }) {
  if (!project) return null;

  return (
    <aside className="project-panel">
      <div className="project-panel__header">
        <div>
          <div className={`status-chip status-${project.status}`}>{project.statusLabel}</div>
          <h2>{project.name}</h2>
          <div className="project-panel__meta">
            <span className="type-chip">{project.typeLabel}</span>
            <span className="location-chip">
              <MapPin size={14} />
              {project.locationLabel}
            </span>
          </div>
        </div>
        <div className="project-panel__actions">
          <button type="button" className="icon-button" onClick={onToggleBookmark}>
            <Bookmark size={16} className={isBookmarked ? "is-active" : ""} />
          </button>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="project-panel__grid">
        <div>
          <span>Budget</span>
          <strong>{project.budgetDisplay}</strong>
        </div>
        <div>
          <span>Timeline start</span>
          <strong>{project.timeline.startLabel}</strong>
        </div>
        <div>
          <span>Expected completion</span>
          <strong>{project.timeline.endLabel}</strong>
        </div>
        <div>
          <span>Completion</span>
          <strong>{project.completionPercent}%</strong>
        </div>
      </div>

      <div className="progress">
        <div className="progress__track">
          <div className="progress__fill" style={{ width: `${project.completionPercent}%` }} />
        </div>
      </div>

      <div className="impact-grid">
        <div>
          <span>Time saved</span>
          <strong>{project.impact.timeSaved}</strong>
        </div>
        <div>
          <span>Population benefited</span>
          <strong>{project.impact.population}</strong>
        </div>
        <div>
          <span>Economic impact</span>
          <strong>{project.impact.economicImpact}</strong>
        </div>
      </div>

      <div className="project-panel__description">
        <span>Description</span>
        <p>{project.description}</p>
      </div>

      <div className="project-panel__footer">
        <button type="button" className="primary-button" onClick={onOpen3D}>
          3D View
        </button>
        <button type="button" className="ghost-button" onClick={onClose}>
          Close
        </button>
      </div>
    </aside>
  );
}
