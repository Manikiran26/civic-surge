import { ArrowUpRight, Camera, Clock3, LocateFixed, MapPinned, ShieldCheck, Sparkles } from "lucide-react";
import ProjectBlueprint2D from "./ProjectBlueprint2D";
import ProjectARView from "./ProjectARView";

function percentLabel(value) {
  if (typeof value !== "number") {
    return "unknown";
  }

  return `${value}%`;
}

export default function ProjectPanel({ project }) {
  if (!project) {
    return (
      <section className="panel-block panel-block--hero">
        <div className="empty-state empty-state--tall">
          <MapPinned size={22} />
          <span>Select a project marker to inspect civic impact, status, and source provenance.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-block panel-block--hero">
      <div className="eyebrow eyebrow--compact">
        <ShieldCheck size={14} />
        Verified project detail
      </div>
      <h2 className="panel-title">{project.name}</h2>
      <p className="panel-summary">{project.description}</p>

      <div className="metric-grid">
        <div className="metric-card">
          <span>Budget</span>
          <strong>{project.budgetDisplay}</strong>
        </div>
        <div className="metric-card">
          <span>Timeline</span>
          <strong>{project.timelineDisplay}</strong>
        </div>
        <div className="metric-card">
          <span>Completion</span>
          <strong>{percentLabel(project.completionPercent)}</strong>
        </div>
        <div className="metric-card">
          <span>Geo anchor</span>
          <strong>{project.geoPrecision}</strong>
        </div>
      </div>

      <div className="progress-shell">
        <div className="progress-shell__meta">
          <span>Completion confidence</span>
          <strong>{percentLabel(project.completionPercent)}</strong>
        </div>
        <div className="progress-track">
          <div
            className="progress-track__fill"
            style={{ width: `${typeof project.completionPercent === "number" ? project.completionPercent : 14}%` }}
          />
        </div>
      </div>

      <div className="callout">
        <LocateFixed size={16} />
        <div>
          <strong>Civic impact</strong>
          <p>{project.impactSummary}</p>
        </div>
      </div>

      <div className="detail-list">
        <div>
          <Clock3 size={14} />
          <span>{project.status}</span>
        </div>
        <div>
          <MapPinned size={14} />
          <span>
            {project.locationLabel}, {project.city}
          </span>
        </div>
      </div>

      <a className="primary-link" href={project.sourceUrl} target="_blank" rel="noreferrer">
        Open source release <ArrowUpRight size={14} />
      </a>

      <div className="mt-6 grid gap-5">
        <section className="grid gap-3">
          <div className="eyebrow eyebrow--compact">
            <Sparkles size={14} />
            2D blueprint
          </div>
          <ProjectBlueprint2D project={project} />
        </section>

        <section className="grid gap-3">
          <div className="eyebrow eyebrow--compact">
            <Camera size={14} />
            AR view
          </div>
          <ProjectARView project={project} />
        </section>
      </div>
    </section>
  );
}
