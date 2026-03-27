import { MoreVertical } from "lucide-react";

export default function TopNav({ onMenuClick, dashboardOpen }) {
  return (
    <header className="top-nav">
      <div className="brand">
        <span className="brand__mark" />
        <div>
          <div className="brand__name">Hyper-Local Civic Intelligence</div>
          <div className="brand__tag">Geospatial command layer</div>
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
