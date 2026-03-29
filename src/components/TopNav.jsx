import { BarChart3, Box, MoreVertical } from "lucide-react";
import { assetUrl } from "../utils/assets";

export default function TopNav({ onMenuClick, dashboardOpen, activeWorkspace, onWorkspaceChange }) {
  return (
    <header className="top-nav">
      <div className="brand">
        <span className="brand__mark">
          <img src={assetUrl("models/PHOTO-2026-03-28-00-40-54.jpg")} alt="CivicSurge logo" />
        </span>
        <div>
          <div className="brand__name">CivicSurge</div>
          <div className="brand__tag">Hyper-local command layer</div>
        </div>
      </div>
      <div className="top-nav__actions">
        <div className="top-nav__workspace">
          <button
            type="button"
            className={activeWorkspace === "intelligence" ? "top-nav__chip is-active" : "top-nav__chip"}
            onClick={() => onWorkspaceChange?.("intelligence")}
          >
            <BarChart3 size={15} />
            Project Intel
          </button>
          <button
            type="button"
            className={activeWorkspace === "models" ? "top-nav__chip is-active" : "top-nav__chip"}
            onClick={() => onWorkspaceChange?.("models")}
          >
            <Box size={15} />
            3D Library
          </button>
        </div>
        <button
          type="button"
          className={dashboardOpen ? "menu-button is-active" : "menu-button"}
          onClick={onMenuClick}
          aria-label="Open dashboard panel"
        >
          <MoreVertical size={18} />
        </button>
      </div>
    </header>
  );
}
