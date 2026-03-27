import { MoreVertical } from "lucide-react";

export default function TopNav({ onMenuClick, dashboardOpen }) {
  return (
    <header className="top-nav">
      <div className="brand">
        <span className="brand__mark">
          <img src="/models/PHOTO-2026-03-28-00-40-54.jpg" alt="CivicSurge logo" />
        </span>
        <div>
          <div className="brand__name">CivicSurge</div>
          <div className="brand__tag">Hyper-local command layer</div>
        </div>
      </div>
      <button
        type="button"
        className={dashboardOpen ? "menu-button is-active" : "menu-button"}
        onClick={onMenuClick}
        aria-label="Open dashboard panel"
      >
        <MoreVertical size={18} />
      </button>
    </header>
  );
}
