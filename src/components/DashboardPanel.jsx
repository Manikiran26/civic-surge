import { Bell, LogOut, Shield, Target } from "lucide-react";

export default function DashboardPanel({
  open,
  onClose,
  activeSection,
  onSelectSection,
  user,
  onLogout,
}) {
  const sections = [
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

        <section className="dashboard-section">
          <div className="section-title">
            <LogOut size={14} />
            Session
          </div>
          <div className="dashboard-card-grid">
            <button
              type="button"
              className="dashboard-card"
              onClick={() => {
                onClose?.();
                onLogout?.();
              }}
            >
              <strong>Log out</strong>
              <span>End session and return to login</span>
            </button>
          </div>
        </section>

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

        {sections.map((section) => (
          <section key={section.id} className="dashboard-section">
            <div className="section-title">
              <section.icon size={14} />
              {section.title}
            </div>
            <div className="dashboard-card-grid">
              {section.cards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  className="dashboard-card"
                  onClick={() => onSelectSection?.(section.id)}
                >
                  <strong>{card.title}</strong>
                  <span>{card.desc}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </aside>
    </div>
  );
}
