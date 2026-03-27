import { useState } from "react";
import { Bookmark, MapPin, X, MessageSquare, ShieldAlert, Star } from "lucide-react";
import { getCivicExplainer } from "../utils/projectInsights";
import ReportModal from "./ReportModal";

export default function ProjectInfoPanel({ project, onClose, onOpen3D, onToggleBookmark, isBookmarked }) {
  if (!project) return null;
  const [language, setLanguage] = useState("en");
  const [modalType, setModalType] = useState(null);
  const intelligence = project.intelligence || {};
  const impactScores = project.impactScores || {};
  const regional = getRegionalLanguage(project);
  const showRegional = regional.code !== "hi";

  function getRegionalLanguage(current) {
    const city = String(current?.city || "").toLowerCase();
    const state = String(current?.state || "").toLowerCase();
    if (city.includes("bengaluru") || city.includes("bangalore") || state.includes("karnataka")) {
      return { code: "kn", label: "ಕನ್ನಡ" };
    }
    if (
      city.includes("hyderabad") ||
      city.includes("srikakulam") ||
      state.includes("telangana") ||
      state.includes("andhra pradesh")
    ) {
      return { code: "te", label: "తెలుగు" };
    }
    if (state.includes("tamil nadu") || city.includes("chennai") || city.includes("coimbatore") || city.includes("madurai")) {
      return { code: "ta", label: "தமிழ்" };
    }
    if (city.includes("mumbai") || state.includes("maharashtra")) {
      return { code: "mr", label: "मराठी" };
    }
    if (city.includes("kolkata") || state.includes("west bengal")) {
      return { code: "bn", label: "বাংলা" };
    }
    return { code: "hi", label: "हिंदी" };
  }

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
            हिंदी
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
        <p>{getCivicExplainer(project, language)}</p>
      </div>

      <div className="project-panel__description">
        <span>Real-Time Intelligence</span>
        <div className="intel-grid">
          <div>
            <span>Live progress</span>
            <strong>{intelligence.liveProgress ?? project.completionPercent}%</strong>
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
                ? `₹${intelligence.budgetPlanned.toLocaleString("en-IN")} cr`
                : project.budgetDisplay}{" "}
              /{" "}
              {Number.isFinite(intelligence.budgetActual)
                ? `₹${intelligence.budgetActual.toLocaleString("en-IN")} cr`
                : "₹0 cr"}
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

      <div className="project-panel__description">
        <span>Citizen Feedback Loop</span>
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

      <div className="project-panel__footer">
        <button type="button" className="primary-button" onClick={onOpen3D}>
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
        project={project}
      />
    </aside>
  );
}
