import { Bookmark, Clock, LogIn, LogOut, Search, Settings, Shield } from "lucide-react";

export default function DashboardPanel({
  open,
  onClose,
  user,
  onToggleLogin,
  projects,
  search,
  onSearch,
  bookmarkedIds,
  recentIds,
  onToggleBookmark,
  onSelectProject,
  mapModes,
  mapMode,
  onMapModeChange,
  notificationsEnabled,
  onToggleNotifications,
  isAdmin,
  onAdminSubmit,
  adminState,
}) {
  const filteredProjects = projects.filter((project) =>
    `${project.name} ${project.city} ${project.state} ${project.typeLabel}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const bookmarkedProjects = projects.filter((project) => bookmarkedIds.includes(project.id));
  const recentProjects = recentIds
    .map((id) => projects.find((project) => project.id === id))
    .filter(Boolean);

  return (
    <div className={open ? "dashboard-shell is-open" : "dashboard-shell"}>
      <div className="dashboard-scrim" onClick={onClose} aria-hidden="true" />
      <aside className="dashboard-panel" role="dialog" aria-modal="true">
        <div className="dashboard-panel__header">
          <div>
            <div className="dashboard-title">Dashboard</div>
            <div className="dashboard-sub">Personalized civic workspace</div>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <section className="dashboard-section">
          <div className="section-title">
            <Settings size={14} />
            User Access
          </div>
          <div className="user-card">
            <div>
              <strong>{user.isLoggedIn ? user.name : "Guest access"}</strong>
              <span>{user.isLoggedIn ? user.role : "Sign in to sync"}</span>
            </div>
            <button type="button" className="primary-button" onClick={onToggleLogin}>
              {user.isLoggedIn ? (
                <>
                  <LogOut size={14} />
                  Logout
                </>
              ) : (
                <>
                  <LogIn size={14} />
                  Login
                </>
              )}
            </button>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-title">
            <Search size={14} />
            All Projects
          </div>
          <div className="search-input">
            <Search size={14} />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Find a project"
            />
          </div>
          <div className="dashboard-list">
            {filteredProjects.slice(0, 12).map((project) => (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                className="list-item"
                onClick={() => onSelectProject(project.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSelectProject(project.id);
                }}
              >
                <div>
                  <strong>{project.name}</strong>
                  <span>{project.locationLabel}</span>
                </div>
                <button
                  type="button"
                  className={bookmarkedIds.includes(project.id) ? "bookmark is-active" : "bookmark"}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleBookmark(project.id);
                  }}
                  aria-label="Bookmark project"
                >
                  <Bookmark size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-title">
            <Bookmark size={14} />
            Saved Projects
          </div>
          <div className="dashboard-list">
            {bookmarkedProjects.length === 0 && <div className="empty-row">No saved projects yet.</div>}
            {bookmarkedProjects.map((project) => (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                className="list-item"
                onClick={() => onSelectProject(project.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSelectProject(project.id);
                }}
              >
                <div>
                  <strong>{project.name}</strong>
                  <span>{project.typeLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-title">
            <Clock size={14} />
            Recently Viewed
          </div>
          <div className="dashboard-list">
            {recentProjects.length === 0 && <div className="empty-row">No recent views yet.</div>}
            {recentProjects.map((project) => (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                className="list-item"
                onClick={() => onSelectProject(project.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") onSelectProject(project.id);
                }}
              >
                <div>
                  <strong>{project.name}</strong>
                  <span>{project.locationLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="section-title">
            <Settings size={14} />
            Settings
          </div>
          <div className="settings-group">
            <div>
              <span>Map mode preference</span>
              <div className="map-mode-preference">
                {mapModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    className={mapMode === mode.id ? "pill is-active" : "pill"}
                    onClick={() => onMapModeChange(mode.id)}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="toggle-row">
              <span>Notifications</span>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(event) => onToggleNotifications(event.target.checked)}
              />
            </label>
          </div>
        </section>

        {isAdmin && (
          <section className="dashboard-section">
            <div className="section-title">
              <Shield size={14} />
              Admin Console
            </div>
            <form className="admin-form" onSubmit={onAdminSubmit}>
              <input name="name" placeholder="Project name" required />
              <div className="filter-row">
                <input name="type" placeholder="Type" required />
                <select name="status" defaultValue="ongoing">
                  <option value="ongoing">ongoing</option>
                  <option value="completed">completed</option>
                  <option value="delayed">delayed</option>
                </select>
              </div>
              <div className="filter-row">
                <input name="city" placeholder="City" required />
                <input name="state" placeholder="State" required />
              </div>
              <div className="filter-row">
                <input name="latitude" placeholder="Latitude" type="number" step="0.000001" />
                <input name="longitude" placeholder="Longitude" type="number" step="0.000001" />
              </div>
              <textarea name="impactSummary" placeholder="Impact summary" rows={3} required />
              <input name="sourceUrl" placeholder="Verified source URL" type="url" required />
              <button className="secondary-button" type="submit">
                Add project
              </button>
              {adminState?.message && (
                <p className={adminState.status === "success" ? "form-message is-success" : "form-message is-error"}>
                  {adminState.message}
                </p>
              )}
            </form>
          </section>
        )}
      </aside>
    </div>
  );
}
