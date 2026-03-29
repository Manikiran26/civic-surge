import { useMemo, useState } from "react";
import { Bookmark, Box, LineChart, MapPin, MessageSquare, ShieldAlert, Star, X } from "lucide-react";
import { getCivicExplainer } from "../utils/projectInsights";
import ReportModal from "./ReportModal";
import ProjectMini3D from "./ProjectMini3D";

function getRegionalLanguage(current) {
  const city = String(current?.city || "").toLowerCase();
  const state = String(current?.state || "").toLowerCase();

  if (city.includes("bengaluru") || city.includes("bangalore") || state.includes("karnataka")) {
    return { code: "kn", label: "Kannada" };
  }
  if (
    city.includes("hyderabad") ||
    city.includes("srikakulam") ||
    state.includes("telangana") ||
    state.includes("andhra pradesh")
  ) {
    return { code: "te", label: "Telugu" };
  }
  if (state.includes("tamil nadu") || city.includes("chennai") || city.includes("coimbatore") || city.includes("madurai")) {
    return { code: "ta", label: "Tamil" };
  }
  if (city.includes("mumbai") || state.includes("maharashtra")) {
    return { code: "mr", label: "Marathi" };
  }
  if (city.includes("kolkata") || state.includes("west bengal")) {
    return { code: "bn", label: "Bangla" };
  }

  return { code: "hi", label: "Hindi" };
}

const SECTION_ITEMS = [
  { id: "overview", label: "Overview", icon: MapPin },
  { id: "intelligence", label: "Intelligence", icon: LineChart },
  { id: "models", label: "3D Library", icon: Box },
];

export default function ProjectInfoPanelV2({
  project,
  projects = [],
  preferredLibraryProjectId = null,
  activeSection = "overview",
  onSectionChange,
  onClose,
  onOpen3D,
  onToggleBookmark,
  isBookmarked,
  bookmarkedIds = [],
  onSelectProject,
}) {
  const [language, setLanguage] = useState("en");
  const [modalType, setModalType] = useState(null);
  const [libraryProjectId, setLibraryProjectId] = useState(null);

  const libraryProject = useMemo(() => {
    const activeLibraryProjectId = libraryProjectId || project?.id || preferredLibraryProjectId || projects[0]?.id || null;
    return projects.find((item) => item.id === activeLibraryProjectId) || project || projects[0] || null;
  }, [libraryProjectId, preferredLibraryProjectId, project, projects]);

  if (!project) return null;

  const panelProject = activeSection === "models" && libraryProject ? libraryProject : project;
  const intelligence = panelProject.intelligence || {};
  const impactScores = panelProject.impactScores || {};
  const regional = getRegionalLanguage(panelProject);
  const showRegional = regional.code !== "hi";
  const panelIsBookmarked = bookmarkedIds.length
    ? bookmarkedIds.includes(panelProject.id)
    : isBookmarked;

  return (
    <aside className="project-panel">
      <div className="project-panel__header">
        <div>
          <div className={`status-chip status-${panelProject.status}`}>{panelProject.statusLabel}</div>
          <h2>{panelProject.name}</h2>
          <div className="project-panel__meta">
            <span className="type-chip">{panelProject.typeLabel}</span>
            <span className="location-chip">
              <MapPin size={14} />
              {panelProject.locationLabel}
            </span>
          </div>
        </div>
        <div className="project-panel__actions">
          <button type="button" className="icon-button" onClick={() => onToggleBookmark?.(panelProject.id)}>
            <Bookmark size={16} className={panelIsBookmarked ? "is-active" : ""} />
          </button>
          <button type="button" className="icon-button" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="project-panel__section-tabs">
        {SECTION_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeSection === item.id ? "project-panel__section-tab is-active" : "project-panel__section-tab"}
            onClick={() => {
              if (item.id !== "models") {
                setLibraryProjectId(null);
              }
              onSectionChange?.(item.id);
            }}
          >
            <item.icon size={14} />
            {item.label}
          </button>
        ))}
      </div>

      {activeSection === "overview" && (
        <>
          <div className="project-panel__grid">
            <div>
              <span>Budget</span>
              <strong>{panelProject.budgetDisplay}</strong>
            </div>
            <div>
              <span>Timeline start</span>
              <strong>{panelProject.timeline.startLabel}</strong>
            </div>
            <div>
              <span>Expected completion</span>
              <strong>{panelProject.timeline.endLabel}</strong>
            </div>
            <div>
              <span>Completion</span>
              <strong>{panelProject.completionPercent}%</strong>
            </div>
          </div>

          <div className="progress">
            <div className="progress__track">
              <div className="progress__fill" style={{ width: `${panelProject.completionPercent}%` }} />
            </div>
          </div>

          <div className="impact-grid">
            <div>
              <span>Time saved</span>
              <strong>{panelProject.impact.timeSaved}</strong>
            </div>
            <div>
              <span>Population benefited</span>
              <strong>{panelProject.impact.population}</strong>
            </div>
            <div>
              <span>Economic impact</span>
              <strong>{panelProject.impact.economicImpact}</strong>
            </div>
          </div>

          <div className="project-panel__description">
            <span>Description</span>
            <p>{panelProject.description}</p>
          </div>

          <div className="project-panel__description">
            <span>Citizen Actions</span>
            <div className="feedback-actions">
              <button type="button" className="ghost-button" onClick={() => setModalType("report")}>
                <ShieldAlert size={14} />
                Report issue
              </button>
              <button type="button" className="ghost-button" onClick={() => setModalType("progress")}>
                <MessageSquare size={14} />
                Progress feedback
              </button>
              <button type="button" className="ghost-button" onClick={() => setModalType("rate")}>
                <Star size={14} />
                Rate project
              </button>
              <button type="button" className="ghost-button" onClick={() => setModalType("feedback")}>
                <MessageSquare size={14} />
                General feedback
              </button>
            </div>
          </div>
        </>
      )}

      {activeSection === "intelligence" && (
        <>
          <div className="project-panel__description">
            <span>AI Civic Explainer</span>
            <div className="project-panel__lang">
              <button
                type="button"
                className={language === "en" ? "pill is-active" : "pill"}
                onClick={() => setLanguage("en")}
              >
                English
              </button>
              <button
                type="button"
                className={language === "hi" ? "pill is-active" : "pill"}
                onClick={() => setLanguage("hi")}
              >
                Hindi
              </button>
              {showRegional && (
                <button
                  type="button"
                  className={language === regional.code ? "pill is-active" : "pill"}
                  onClick={() => setLanguage(regional.code)}
                >
                  {regional.label}
                </button>
              )}
            </div>
            <p>{getCivicExplainer(panelProject, language)}</p>
          </div>

          <div className="project-panel__description">
            <span>Real-Time Intelligence</span>
            <div className="intel-grid">
              <div>
                <span>Live progress</span>
                <strong>{intelligence.liveProgress ?? panelProject.completionPercent}%</strong>
              </div>
              <div>
                <span>Timeline status</span>
                <strong className={`intel-${intelligence.timelineStatus || "on-track"}`}>
                  {intelligence.timelineStatus || "on-track"}
                </strong>
              </div>
              <div>
                <span>Deviation</span>
                <strong>
                  {typeof intelligence.deviation === "number"
                    ? `${intelligence.deviation > 0 ? "+" : ""}${intelligence.deviation}%`
                    : "0%"}
                </strong>
              </div>
              <div>
                <span>Budget vs actual</span>
                <strong>
                  {Number.isFinite(intelligence.budgetPlanned)
                    ? `Rs${intelligence.budgetPlanned.toLocaleString("en-IN")} cr`
                    : panelProject.budgetDisplay}{" "}
                  /{" "}
                  {Number.isFinite(intelligence.budgetActual)
                    ? `Rs${intelligence.budgetActual.toLocaleString("en-IN")} cr`
                    : "Rs0 cr"}
                </strong>
              </div>
              <div>
                <span>Contractor</span>
                <strong>{intelligence.contractor || "TBD"}</strong>
              </div>
              <div>
                <span>Agency</span>
                <strong>{intelligence.agency || "TBD"}</strong>
              </div>
            </div>
          </div>

          <div className="project-panel__description">
            <span>Impact Score Dashboard</span>
            <div className="impact-score-grid">
              <div>
                <span>Economic</span>
                <strong>{impactScores.economic ?? 0}</strong>
              </div>
              <div>
                <span>Traffic</span>
                <strong>{impactScores.traffic ?? 0}</strong>
              </div>
              <div>
                <span>Environment</span>
                <strong>{impactScores.environment ?? 0}</strong>
              </div>
              <div>
                <span>Jobs created</span>
                <strong>{impactScores.jobsCreated ?? 0}</strong>
              </div>
            </div>
          </div>
        </>
      )}

      {activeSection === "models" && libraryProject && (
        <div className="project-model-library">
          <div className="project-model-library__hero">
            <div className="project-model-library__viewer">
              <ProjectMini3D key={libraryProject.id} project={libraryProject} />
            </div>
            <div className="project-model-library__summary">
              <div className={`status-chip status-${libraryProject.status}`}>{libraryProject.statusLabel}</div>
              <strong>{libraryProject.name}</strong>
              <span>{libraryProject.locationLabel}</span>
              <p>{libraryProject.description}</p>
              <div className="project-model-library__actions">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => {
                    onSelectProject?.(libraryProject.id);
                    onOpen3D?.(libraryProject.id);
                  }}
                >
                  Open 3D Model
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => onSelectProject?.(libraryProject.id)}
                >
                  Focus project
                </button>
              </div>
            </div>
          </div>

          <div className="project-panel__description">
            <span>All Project Models</span>
          </div>

          <div className="project-model-library__list">
            {projects.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === libraryProject.id ? "project-model-card is-active" : "project-model-card"}
                onClick={() => {
                  setLibraryProjectId(item.id);
                  onSelectProject?.(item.id);
                }}
              >
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.locationLabel}</span>
                </div>
                <div className="project-model-card__meta">
                  <span>{item.typeLabel}</span>
                  <strong>{item.completionPercent}%</strong>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="project-panel__footer">
        <button type="button" className="primary-button" onClick={() => onOpen3D?.(panelProject.id)}>
          3D View
        </button>
        <button type="button" className="ghost-button" onClick={onClose}>
          Close
        </button>
      </div>

      <ReportModal
        isOpen={Boolean(modalType)}
        onClose={() => setModalType(null)}
        type={modalType || "report"}
        project={panelProject}
      />
    </aside>
  );
}
