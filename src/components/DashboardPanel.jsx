import { BarChart3, Bell, MapPin, Shield, Target, Users } from "lucide-react";

export default function DashboardPanel({
  open,
  onClose,
  activeSection,
  onSelectSection,
  user,
}) {
  const sections = [
    {
      id: "map",
      title: "Map Dashboard (Core)",
      icon: MapPin,
      summary: "Live map with geo-fenced zones. Click any project to view details and activity.",
      cards: [
        { title: "Live Geo Map", desc: "Real-time site visibility" },
        { title: "Project Focus", desc: "Tap any marker for details" },
      ],
      content: [
        "Live basemap with geo-fenced overlays and active projects.",
        "One-click project detail with status, progress, and media.",
        "Quick jump to location search and map modes.",
      ],
    },
    {
      id: "projects",
      title: "Project Management",
      icon: Shield,
      summary: "Add/edit projects with location, status, and media assets.",
      cards: [
        { title: "Add / Edit Projects", desc: "Location, status, media" },
        { title: "3D + Media", desc: "Images, models, documents" },
      ],
      content: [
        "Create and manage project records.",
        "Attach images, 3D models, and verified documents.",
        "Track progress, status, and timelines.",
      ],
    },
    {
      id: "geofence",
      title: "Geo-Fencing & Targeting",
      icon: Target,
      summary: "Create zones and configure entry/time/user triggers.",
      cards: [
        { title: "Zone Builder", desc: "Radius + polygon zones" },
        { title: "Trigger Rules", desc: "Entry, time, user type" },
      ],
      content: [
        "Define zone shapes and site boundaries.",
        "Set triggers based on entry, dwell time, or schedules.",
        "Target based on user type and interest.",
      ],
    },
    {
      id: "campaigns",
      title: "Campaign / Notification Manager",
      icon: Bell,
      summary: "Create messages/ads and link them to geo-fences.",
      cards: [
        { title: "Create Messages", desc: "Ads, alerts, announcements" },
        { title: "Link to Zones", desc: "Deliver by location & time" },
      ],
      content: [
        "Compose civic alerts and announcements.",
        "Associate messages with zones and schedules.",
        "Preview what users see in the field.",
      ],
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: BarChart3,
      summary: "Footfall, engagement, and heatmaps.",
      cards: [
        { title: "Footfall", desc: "Counts, trends, peak hours" },
        { title: "Engagement", desc: "Clicks, feedback, shares" },
        { title: "Heatmaps", desc: "Traffic + dwell time" },
      ],
      content: [
        "Track engagement across zones and campaigns.",
        "View peak hours and visit distribution.",
        "Export reports for government stakeholders.",
      ],
    },
    {
      id: "users",
      title: "User & Role Management",
      icon: Users,
      summary: "Admin / Govt / Advertiser roles and permissions.",
      cards: [
        { title: "Admin / Govt / Advertiser", desc: "Role-based access control" },
        { title: "Permissions", desc: "Approval + audit trail" },
      ],
      content: [
        "Create roles and assign permissions.",
        "Approval workflows for data edits.",
        "Audit trails for accountability.",
      ],
    },
  ];

  const active = sections.find((item) => item.id === activeSection) || null;

  return (
    <div className={open ? "dashboard-shell is-open" : "dashboard-shell"}>
      <div className="dashboard-scrim" onClick={onClose} aria-hidden="true" />
      <aside className="dashboard-panel" role="dialog" aria-modal="true">
        <div className="dashboard-panel__header">
          <div>
            <div className="dashboard-title">Control Center</div>
            <div className="dashboard-sub">Geo-intelligence operations</div>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>
        {user && (
          <div className="dashboard-user">
            <div>
              <strong>{user.name}</strong>
              <span>{user.email || "verified user"}</span>
            </div>
            <div className="dashboard-role">{user.role}</div>
          </div>
        )}

        {active && (
          <section className="dashboard-section dashboard-detail">
            <div className="section-title">
              <active.icon size={14} />
              {active.title}
            </div>
            <p className="dashboard-copy">{active.summary}</p>
            <ul className="dashboard-detail-list">
              {active.content.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <button type="button" className="secondary-button" onClick={() => onSelectSection?.(null)}>
              Back to sections
            </button>
          </section>
        )}

        <section className="dashboard-section">
          <div className="section-title">
            <MapPin size={14} />
            Map Dashboard (Core)
          </div>
          <p className="dashboard-copy">
            Live map with geo-fenced zones. Click any project to view details and activity.
          </p>
          <div className="dashboard-card-grid">
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("map")}>
              <strong>Live Geo Map</strong>
              <span>Real-time site visibility</span>
            </button>
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("map")}>
              <strong>Project Focus</strong>
              <span>Tap any marker for details</span>
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-title">
            <Shield size={14} />
            Project Management
          </div>
          <div className="dashboard-card-grid">
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("projects")}>
              <strong>Add / Edit Projects</strong>
              <span>Location, status, media</span>
            </button>
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("projects")}>
              <strong>3D + Media</strong>
              <span>Images, models, documents</span>
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-title">
            <Target size={14} />
            Geo-Fencing & Targeting
          </div>
          <div className="dashboard-card-grid">
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("geofence")}>
              <strong>Zone Builder</strong>
              <span>Radius + polygon zones</span>
            </button>
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("geofence")}>
              <strong>Trigger Rules</strong>
              <span>Entry, time, user type</span>
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-title">
            <Bell size={14} />
            Campaign / Notification Manager
          </div>
          <div className="dashboard-card-grid">
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("campaigns")}>
              <strong>Create Messages</strong>
              <span>Ads, alerts, announcements</span>
            </button>
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("campaigns")}>
              <strong>Link to Zones</strong>
              <span>Deliver by location & time</span>
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-title">
            <BarChart3 size={14} />
            Analytics
          </div>
          <div className="dashboard-card-grid">
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("analytics")}>
              <strong>Footfall</strong>
              <span>Counts, trends, peak hours</span>
            </button>
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("analytics")}>
              <strong>Engagement</strong>
              <span>Clicks, feedback, shares</span>
            </button>
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("analytics")}>
              <strong>Heatmaps</strong>
              <span>Traffic + dwell time</span>
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-title">
            <Users size={14} />
            User & Role Management
          </div>
          <div className="dashboard-card-grid">
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("users")}>
              <strong>Admin / Govt / Advertiser</strong>
              <span>Role-based access control</span>
            </button>
            <button type="button" className="dashboard-card" onClick={() => onSelectSection?.("users")}>
              <strong>Permissions</strong>
              <span>Approval + audit trail</span>
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}
