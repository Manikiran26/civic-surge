import { ArrowUpRight, FileText, Lightbulb, ShieldCheck, Target, X } from "lucide-react";
import ProjectBlueprint2D from "./ProjectBlueprint2D";
import ProjectMini3D from "./ProjectMini3D";

function percentLabel(value) {
  if (typeof value !== "number") {
    return "unknown";
  }

  return `${value}%`;
}

function buildProblemStatement(project) {
  if (project?.impactSummary) {
    return project.impactSummary;
  }

  if (project?.description) {
    return project.description;
  }

  if (project?.type && project?.city) {
    return `This ${project.type.toLowerCase()} project targets capacity and access gaps for ${project.city}.`;
  }

  return "This project addresses a critical local infrastructure gap and improves service access.";
}

function buildUseCase(project) {
  if (project?.citizens) {
    return `Designed for ${project.citizens}, with a focus on safe, reliable daily use.`;
  }

  if (project?.type) {
    return `Primary use: ${project.type.toLowerCase()} services for commuters, residents, and adjacent businesses.`;
  }

  return "Primary use: public infrastructure services for nearby residents and city systems.";
}

export default function ProjectDetailModal({ project, onClose }) {
  if (!project) {
    return null;
  }

  const locationLabel = project.locationLabel || `${project.city || "unknown"}, ${project.state || "unknown"}`;

  const handleScrimClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="project-modal__scrim" role="dialog" aria-modal="true" onClick={handleScrimClick}>
      <div className="project-modal">
        <header className="project-modal__header">
          <div>
            <div className="project-modal__eyebrow">
              <ShieldCheck size={14} />
              {project.status || "unknown"} • {project.type || "infrastructure"}
            </div>
            <h2 className="project-modal__title">{project.name}</h2>
            <p className="project-modal__subtitle">{locationLabel}</p>
          </div>
          <button type="button" className="project-modal__close" onClick={onClose} aria-label="Close project details">
            <X size={16} />
          </button>
        </header>

        <div className="project-modal__body">
          <section className="project-modal__info">
            <div className="project-modal__section">
              <div className="project-modal__section-title">
                <FileText size={14} />
                About project details
              </div>
              <p className="project-modal__section-text">{project.description || "No description provided yet."}</p>
              <div className="project-modal__metrics">
                <div>
                  <span>Budget</span>
                  <strong>{project.budgetDisplay || "unknown"}</strong>
                </div>
                <div>
                  <span>Timeline</span>
                  <strong>{project.timelineDisplay || "unknown"}</strong>
                </div>
                <div>
                  <span>Completion</span>
                  <strong>{percentLabel(project.completionPercent)}</strong>
                </div>
                <div>
                  <span>Geo anchor</span>
                  <strong>{project.geoPrecision || "unknown"}</strong>
                </div>
              </div>
            </div>

            <div className="project-modal__section">
              <div className="project-modal__section-title">
                <Target size={14} />
                What problem it is solving
              </div>
              <p className="project-modal__section-text">{buildProblemStatement(project)}</p>
            </div>

            <div className="project-modal__section">
              <div className="project-modal__section-title">
                <Lightbulb size={14} />
                Use of
              </div>
              <p className="project-modal__section-text">{buildUseCase(project)}</p>
            </div>

            {project.sourceUrl && project.sourceUrl !== "unknown" && (
              <a className="project-modal__link" href={project.sourceUrl} target="_blank" rel="noreferrer">
                Open source release <ArrowUpRight size={14} />
              </a>
            )}
          </section>

          <section className="project-modal__visuals">
            <div className="project-modal__visual-card">
              <div className="project-modal__visual-title">3D view</div>
              <div className="project-modal__visual-frame">
                <ProjectMini3D project={project} />
              </div>
            </div>
            <div className="project-modal__visual-card">
              <div className="project-modal__visual-title">2D blueprint</div>
              <ProjectBlueprint2D project={project} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
