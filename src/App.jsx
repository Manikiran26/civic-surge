import { useEffect, useMemo, useState } from "react";
import "./App.css";
import MapCanvas from "./components/MapCanvas";
import TopNav from "./components/TopNav";
import FilterPanel from "./components/FilterPanel";
import DashboardPanel from "./components/DashboardPanel";
import ProjectInfoPanel from "./components/ProjectInfoPanel";
import Project3DModal from "./components/Project3DModal";
import { NotificationSystem } from "./components/NotificationSystem";
import { getProjectById, getProjects, submitAdminProject } from "./services/api";
import useUserLocation from "./hooks/useUserLocation";
import { enrichProject, enrichProjects } from "./utils/projectEnrichment";
import { formatDistanceKm, haversineKm } from "./utils/geo";

const MAP_MODES = [
  { id: "satellite", label: "Satellite" },
  { id: "minimal", label: "Minimal" },
  { id: "dark", label: "Dark Futuristic" },
  { id: "infra", label: "Infrastructure Highlight" },
];

const DEFAULT_FILTERS = {
  search: "",
  status: "all",
  type: "all",
  budgetMin: 0,
  budgetMax: 6000,
  timelineStart: 2020,
  timelineEnd: 2032,
};

export default function App() {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [mapMode, setMapMode] = useState("infra");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [filterBounds, setFilterBounds] = useState({
    budget: { min: 0, max: 6000 },
    years: [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030],
  });
  const [filterPanelOpen, setFilterPanelOpen] = useState(true);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [dashboardSearch, setDashboardSearch] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [recentIds, setRecentIds] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState({
    isLoggedIn: true,
    name: "Aarav Mehta",
    role: "admin",
  });
  const [adminState, setAdminState] = useState({ status: "idle", message: "" });
  const [show3D, setShow3D] = useState(false);
  const {
    location,
    permissionState,
    requestLocation,
    startTracking,
    stopTracking,
    error: locationError,
    isRequesting: isLocating,
    hasRequested: hasRequestedLocation,
    isTracking,
  } = useUserLocation(true);

  useEffect(() => {
    if (notificationsEnabled) return;
    setNotifications([]);
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!notificationsEnabled || !location || projects.length === 0) return;

    const constructionRadiusKm = 0.6;
    const hospitalRadiusKm = 1.2;

    const constructionCandidates = projects.filter(
      (project) =>
        Number.isFinite(project.latitude) &&
        Number.isFinite(project.longitude) &&
        (project.status === "ongoing" || project.status === "delayed")
    );

    const hospitalCandidates = projects.filter(
      (project) =>
        Number.isFinite(project.latitude) &&
        Number.isFinite(project.longitude) &&
        project.type === "hospital"
    );

    if (constructionCandidates.length === 0 || hospitalCandidates.length === 0) return;

    const nearestConstruction = constructionCandidates
      .map((project) => ({
        project,
        distance: haversineKm(
          location.lat,
          location.lng,
          project.latitude,
          project.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (!nearestConstruction || nearestConstruction.distance > constructionRadiusKm) return;

    const nearestHospital = hospitalCandidates
      .map((project) => ({
        project,
        distance: haversineKm(
          location.lat,
          location.lng,
          project.latitude,
          project.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    if (!nearestHospital || nearestHospital.distance > hospitalRadiusKm) return;

    const storageKey = `civic:nearby:${nearestConstruction.project.id}:${nearestHospital.project.id}`;
    if (window.sessionStorage.getItem(storageKey)) return;
    window.sessionStorage.setItem(storageKey, "seen");

    const message = `Construction nearby: ${nearestConstruction.project.name} (${formatDistanceKm(
      nearestConstruction.distance
    )}). Hospital close by: ${nearestHospital.project.name} (${formatDistanceKm(
      nearestHospital.distance
    )}).`;

    const notification = { id: storageKey, message };
    setNotifications((current) => [...current, notification].slice(-3));

    const timer = window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== storageKey));
    }, 8000);

    return () => window.clearTimeout(timer);
  }, [location, projects, notificationsEnabled]);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      setStatus({ loading: true, error: "" });
      try {
        const response = await getProjects();
        if (!active) return;
        const enriched = enrichProjects(response.projects || []);
        setProjects(enriched);
        setStatus({ loading: false, error: "" });
      } catch (error) {
        if (!active) return;
        setStatus({ loading: false, error: error.message || "Unable to load project feed." });
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!projects.length) return;

    const budgets = projects.map((project) => project.budgetCrore).filter(Number.isFinite);
    const minBudget = Math.min(...budgets);
    const maxBudget = Math.max(...budgets);

    const years = projects
      .flatMap((project) => [project.timeline.startYear, project.timeline.endYear])
      .filter(Boolean);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = [];
    for (let year = minYear; year <= maxYear; year += 1) {
      yearRange.push(year);
    }

    setFilterBounds({ budget: { min: minBudget, max: maxBudget }, years: yearRange });
    setFilters((current) => ({
      ...current,
      budgetMin: current.budgetMin === DEFAULT_FILTERS.budgetMin ? minBudget : current.budgetMin,
      budgetMax: current.budgetMax === DEFAULT_FILTERS.budgetMax ? maxBudget : current.budgetMax,
      timelineStart: current.timelineStart === DEFAULT_FILTERS.timelineStart ? minYear : current.timelineStart,
      timelineEnd: current.timelineEnd === DEFAULT_FILTERS.timelineEnd ? maxYear : current.timelineEnd,
    }));
  }, [projects]);

  useEffect(() => {
    if (!selectedProjectId) return;
    setRecentIds((current) => {
      const next = [selectedProjectId, ...current.filter((id) => id !== selectedProjectId)];
      return next.slice(0, 6);
    });
  }, [selectedProjectId]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        filters.search.trim().length === 0 ||
        `${project.name} ${project.city} ${project.state} ${project.typeLabel}`
          .toLowerCase()
          .includes(filters.search.toLowerCase());
      const matchesStatus = filters.status === "all" || project.status === filters.status;
      const matchesType = filters.type === "all" || project.typeLabel === filters.type;
      const matchesBudget =
        project.budgetCrore >= filters.budgetMin && project.budgetCrore <= filters.budgetMax;
      const matchesTimeline =
        project.timeline.startYear >= filters.timelineStart &&
        project.timeline.endYear <= filters.timelineEnd;
      return matchesSearch && matchesStatus && matchesType && matchesBudget && matchesTimeline;
    });
  }, [projects, filters]);

  const typeOptions = useMemo(() => {
    const set = new Set(projects.map((project) => project.typeLabel));
    return Array.from(set).sort();
  }, [projects]);

  const selectedProject =
    filteredProjects.find((project) => project.id === selectedProjectId) ||
    projects.find((project) => project.id === selectedProjectId) ||
    null;

  async function handleSelectProject(projectId) {
    if (!projectId) {
      setSelectedProjectId(null);
      return;
    }

    setSelectedProjectId(projectId);

    try {
      const response = await getProjectById(projectId);
      if (response.project) {
        const enriched = enrichProject(response.project);
        setProjects((current) =>
          current.map((project) => (project.id === projectId ? enriched : project))
        );
      }
    } catch {
      // Keep optimistic selection.
    }
  }

  function handleFilterChange(patch) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function toggleBookmark(projectId) {
    setBookmarkedIds((current) =>
      current.includes(projectId) ? current.filter((id) => id !== projectId) : [projectId, ...current]
    );
  }

  function handleLoginToggle() {
    setUser((current) => {
      if (current.isLoggedIn) {
        return { isLoggedIn: false, name: "Guest", role: "viewer" };
      }
      return { isLoggedIn: true, name: "Aarav Mehta", role: "admin" };
    });
  }

  async function handleAdminSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setAdminState({ status: "loading", message: "" });

      await submitAdminProject({
        name: formData.get("name"),
        type: formData.get("type"),
        status: formData.get("status"),
        city: formData.get("city"),
        state: formData.get("state"),
        latitude: Number(formData.get("latitude")),
        longitude: Number(formData.get("longitude")),
        impact_summary: formData.get("impactSummary"),
        source_url: formData.get("sourceUrl"),
      });

      event.currentTarget.reset();
      setAdminState({ status: "success", message: "Admin project request queued." });
    } catch (error) {
      setAdminState({
        status: "error",
        message: error.message || "Admin project submission failed.",
      });
    }
  }

  return (
    <div className="civic-app">
      <TopNav onMenuClick={() => setDashboardOpen((current) => !current)} dashboardOpen={dashboardOpen} />

      <main className="civic-main">
        <MapCanvas
          mapMode={mapMode}
          mapModes={MAP_MODES}
          projects={filteredProjects}
          userLocation={location}
          locationPermission={permissionState}
          onRequestLocation={requestLocation}
          onStartTracking={startTracking}
          onStopTracking={stopTracking}
          locationError={locationError}
          isLocating={isLocating}
          hasRequestedLocation={hasRequestedLocation}
          isTracking={isTracking}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
          onMapModeChange={setMapMode}
        />

        <FilterPanel
          open={filterPanelOpen}
          onToggle={() => setFilterPanelOpen((current) => !current)}
          filters={filters}
          typeOptions={typeOptions}
          budgetBounds={filterBounds.budget}
          timelineBounds={{ years: filterBounds.years }}
          onChange={handleFilterChange}
        />

        <ProjectInfoPanel
          project={selectedProject}
          onClose={() => setSelectedProjectId(null)}
          onOpen3D={() => setShow3D(true)}
          onToggleBookmark={() => selectedProject && toggleBookmark(selectedProject.id)}
          isBookmarked={selectedProject ? bookmarkedIds.includes(selectedProject.id) : false}
        />

        {status.error && <div className="system-alert">{status.error}</div>}
      </main>

      <DashboardPanel
        open={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        user={user}
        onToggleLogin={handleLoginToggle}
        projects={projects}
        search={dashboardSearch}
        onSearch={setDashboardSearch}
        bookmarkedIds={bookmarkedIds}
        recentIds={recentIds}
        onToggleBookmark={toggleBookmark}
        onSelectProject={(id) => {
          handleSelectProject(id);
          setDashboardOpen(false);
        }}
        mapModes={MAP_MODES}
        mapMode={mapMode}
        onMapModeChange={setMapMode}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={setNotificationsEnabled}
        isAdmin={user.isLoggedIn && user.role === "admin"}
        onAdminSubmit={handleAdminSubmit}
        adminState={adminState}
      />

      <NotificationSystem notifications={notifications} />

      <Project3DModal open={show3D} project={selectedProject} onClose={() => setShow3D(false)} />
    </div>
  );
}
