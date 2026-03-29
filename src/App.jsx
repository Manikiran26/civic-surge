import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import MapCanvas from "./components/MapCanvas";
import TopNav from "./components/TopNav";
import FilterPanel from "./components/FilterPanel";
import DashboardPanel from "./components/DashboardPanel";
import ProjectInfoPanelV2 from "./components/ProjectInfoPanelV2";
import Project3DModal from "./components/Project3DModal";
import { NotificationSystem } from "./components/NotificationSystem";
import LoginPage from "./components/LoginPage";
import { getProjectById, getProjects, submitAdminProject } from "./services/api";
import useUserLocation from "./hooks/useUserLocation";
import { enrichProject, enrichProjects } from "./utils/projectEnrichment";
import { formatDistanceKm, haversineKm } from "./utils/geo";
import { getImpactScores, getProjectIntelligence, getProjectInterestTags } from "./utils/projectInsights";

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
const USER_SESSION_KEY = "civic:user-session";

function readStoredUser() {
  if (typeof window === "undefined") {
    return {
      isLoggedIn: false,
      name: "Guest",
      role: "viewer",
    };
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(USER_SESSION_KEY) || "null");
    if (parsed?.isLoggedIn) {
      return {
        isLoggedIn: true,
        name: parsed.name || "Citizen",
        role: parsed.role || "viewer",
        email: parsed.email || "",
      };
    }
  } catch {
    // ignore malformed stored session
  }

  return {
    isLoggedIn: false,
    name: "Guest",
    role: "viewer",
  };
}

export default function App() {
  const initialUser = readStoredUser();
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
  const [dashboardSection, setDashboardSection] = useState(null);
  const [projectPanelSection, setProjectPanelSection] = useState("overview");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResult, setLocationResult] = useState(null);
  const [locationSearchError, setLocationSearchError] = useState("");
  const [locationSearching, setLocationSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [recentIds, setRecentIds] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [announcementFeed, setAnnouncementFeed] = useState([]);
  const seenNotificationIdsRef = useRef(new Set());
  const notificationTimersRef = useRef(new Map());
  const [loginFocusToken, setLoginFocusToken] = useState(0);
  const [pendingLoginFocus, setPendingLoginFocus] = useState(() => initialUser.isLoggedIn);
  const [geoPreferences, setGeoPreferences] = useState({
    speedMode: "walking",
    timeMode: "any",
    interestMode: "all",
  });
  const [user, setUser] = useState(initialUser);
  const [adminState, setAdminState] = useState({ status: "idle", message: "" });
  const [show3D, setShow3D] = useState(false);
  const [active3DProjectId, setActive3DProjectId] = useState(null);
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

  const enrichedProjects = useMemo(() => {
    return projects.map((project) => ({
      ...project,
      intelligence: getProjectIntelligence(project),
      impactScores: getImpactScores(project),
      interestTags: getProjectInterestTags(project),
    }));
  }, [projects]);

  function queueNotification(notification, duration = 10000, limit = 4) {
    if (!notification?.id || seenNotificationIdsRef.current.has(notification.id)) {
      return false;
    }

    seenNotificationIdsRef.current.add(notification.id);
    setNotifications((current) => [...current, notification].slice(-limit));

    const existingTimer = notificationTimersRef.current.get(notification.id);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    const timer = window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== notification.id));
      notificationTimersRef.current.delete(notification.id);
    }, duration);

    notificationTimersRef.current.set(notification.id, timer);
    return true;
  }

  useEffect(() => {
    const timers = notificationTimersRef.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (notificationsEnabled) return;
    notificationTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    notificationTimersRef.current.clear();
    seenNotificationIdsRef.current.clear();
    setNotifications([]);
  }, [notificationsEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (user.isLoggedIn) {
      window.localStorage.setItem(
        USER_SESSION_KEY,
        JSON.stringify({
          isLoggedIn: true,
          name: user.name,
          role: user.role,
          email: user.email || "",
        })
      );
      return;
    }

    window.localStorage.removeItem(USER_SESSION_KEY);
  }, [user]);

  useEffect(() => {
    if (user.isLoggedIn) return;
    notificationTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    notificationTimersRef.current.clear();
    seenNotificationIdsRef.current.clear();
    setNotifications([]);
  }, [user.isLoggedIn]);

  useEffect(() => {
    if (!user.isLoggedIn || hasRequestedLocation || permissionState === "denied") return;

    if (permissionState === "granted") {
      startTracking();
      return;
    }

    requestLocation();
  }, [
    hasRequestedLocation,
    permissionState,
    requestLocation,
    startTracking,
    user.isLoggedIn,
  ]);

  useEffect(() => {
    if (!user.isLoggedIn || !location || isTracking || permissionState !== "granted") return;
    startTracking();
  }, [isTracking, location, permissionState, startTracking, user.isLoggedIn]);

  useEffect(() => {
    if (!user.isLoggedIn) {
      setPendingLoginFocus(false);
      return;
    }
    if (!pendingLoginFocus || !location || locationResult) return;

    setLoginFocusToken((current) => current + 1);
    setPendingLoginFocus(false);
  }, [location, locationResult, pendingLoginFocus, user.isLoggedIn]);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem("civic:admin:announcements") || "[]");
      setAnnouncementFeed(Array.isArray(stored) ? stored : []);
    } catch {
      setAnnouncementFeed([]);
    }
  }, []);

  useEffect(() => {
    if (!user.isLoggedIn || !notificationsEnabled || !location || enrichedProjects.length === 0) return;
    if (!isTimeRelevant(geoPreferences.timeMode)) return;

    const speedFactor = speedMultiplier(geoPreferences.speedMode);
    const constructionRadiusKm = 0.6 * speedFactor;
    const hospitalRadiusKm = 1.2 * speedFactor;

    const constructionCandidates = enrichedProjects.filter(
      (project) =>
        Number.isFinite(project.latitude) &&
        Number.isFinite(project.longitude) &&
        haversineKm(location.lat, location.lng, project.latitude, project.longitude) >
          ((Number(project.geofenceRadiusM) || 1500) / 1000) &&
        (project.status === "ongoing" || project.status === "delayed") &&
        interestMatches(project)
    );

    const hospitalCandidates = enrichedProjects.filter(
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

    const notificationId = `civic:nearby:${nearestConstruction.project.id}:${nearestHospital.project.id}`;

    const message = `Construction nearby: ${nearestConstruction.project.name} (${formatDistanceKm(
      nearestConstruction.distance
    )}). Hospital close by: ${nearestHospital.project.name} (${formatDistanceKm(
      nearestHospital.distance
    )}).`;

    queueNotification({ id: notificationId, message, type: "geo" }, 10000, 3);
  }, [location, enrichedProjects, notificationsEnabled, geoPreferences, user.isLoggedIn]);

  useEffect(() => {
    if (!user.isLoggedIn || !notificationsEnabled || !location || enrichedProjects.length === 0) return;
    if (!isTimeRelevant(geoPreferences.timeMode)) return;

    const speedFactor = speedMultiplier(geoPreferences.speedMode);
    const alertRadiusKm = 0.9 * speedFactor;

    const hazardProjects = enrichedProjects.filter(
      (project) =>
        Number.isFinite(project.latitude) &&
        Number.isFinite(project.longitude) &&
        (project.status === "ongoing" || project.status === "delayed") &&
        interestMatches(project)
    );

    for (const project of hazardProjects) {
      const geofenceRadiusKm = (Number(project.geofenceRadiusM) || 1500) / 1000;
      const distanceKm = haversineKm(
        location.lat,
        location.lng,
        project.latitude,
        project.longitude
      );
      if (distanceKm <= geofenceRadiusKm) continue;
      if (distanceKm > alertRadiusKm) continue;
      const notificationId = `civic:safety:${project.id}`;
      const message = `Safety alert near ${project.name}: expect construction activity and diversions.`;
      if (queueNotification({ id: notificationId, message, type: "safety" }, 10000, 4)) {
        return;
      }
    }
  }, [location, enrichedProjects, notificationsEnabled, geoPreferences, user.isLoggedIn]);

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
    let scoped = projects.filter((project) => {
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
    if (locationResult) {
      const radiusKm = locationResult.radiusKm || 60;
      scoped = scoped.filter(
        (project) =>
          Number.isFinite(project.latitude) &&
          Number.isFinite(project.longitude) &&
          haversineKm(
            locationResult.lat,
            locationResult.lng,
            project.latitude,
            project.longitude
          ) <= radiusKm
      );
    }
    return scoped;
  }, [projects, filters, locationResult]);

  const typeOptions = useMemo(() => {
    const set = new Set(projects.map((project) => project.typeLabel));
    return Array.from(set).sort();
  }, [projects]);

  const selectedProject =
    enrichedProjects.find((project) => project.id === selectedProjectId) ||
    null;

  const active3DProject =
    enrichedProjects.find((project) => project.id === active3DProjectId) ||
    selectedProject ||
    null;

  const nearbyGeoFenceProjects = useMemo(() => {
    if (!location || enrichedProjects.length === 0) {
      return [];
    }

    return enrichedProjects
      .filter(
        (project) =>
          Number.isFinite(project.latitude) &&
          Number.isFinite(project.longitude)
      )
      .map((project) => {
        const distanceKm = haversineKm(
          location.lat,
          location.lng,
          project.latitude,
          project.longitude
        );
        const radiusKm = (Number(project.geofenceRadiusM) || 1500) / 1000;
        return {
          ...project,
          distanceKm,
          radiusKm,
        };
      })
      .filter((project) => project.distanceKm <= project.radiusKm)
      .sort((left, right) => left.distanceKm - right.distanceKm);
  }, [location, enrichedProjects]);

  const nearestLiveProject = useMemo(() => {
    if (!location || enrichedProjects.length === 0) {
      return null;
    }

    return (
      enrichedProjects
        .filter(
          (project) =>
            Number.isFinite(project.latitude) &&
            Number.isFinite(project.longitude)
        )
        .map((project) => ({
          ...project,
          distanceKm: haversineKm(
            location.lat,
            location.lng,
            project.latitude,
            project.longitude
          ),
        }))
        .sort((left, right) => left.distanceKm - right.distanceKm)[0] || null
    );
  }, [location, enrichedProjects]);

  const activeGeoFenceProjectIds = useMemo(
    () => nearbyGeoFenceProjects.map((project) => project.id),
    [nearbyGeoFenceProjects]
  );

  async function handleSelectProject(projectId) {
    if (!projectId) {
      setSelectedProjectId(null);
      setProjectPanelSection("overview");
      return;
    }

    setSelectedProjectId(projectId);
    setProjectPanelSection((current) => (current === "models" ? "models" : "overview"));

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

  function handleOpen3D(targetProjectId = selectedProjectId) {
    if (!targetProjectId) return;
    setActive3DProjectId(targetProjectId);
    if (targetProjectId !== selectedProjectId) {
      setSelectedProjectId(targetProjectId);
    }
    setShow3D(true);
  }

  function handleWorkspaceChange(section) {
    if (!section) return;

    const fallbackProjectId =
      section === "models"
        ? nearestLiveProject?.id || selectedProjectId || enrichedProjects[0]?.id || null
        : selectedProjectId || nearestLiveProject?.id || enrichedProjects[0]?.id || null;
    if (!fallbackProjectId) return;

    if (fallbackProjectId !== selectedProjectId) {
      setSelectedProjectId(fallbackProjectId);
    }

    setProjectPanelSection(section === "models" ? "models" : "intelligence");
  }

  async function handleLocationSearch(event, overrideQuery) {
    event?.preventDefault?.();
    const query = (overrideQuery ?? locationQuery).trim();
    if (!query) return;
    setLocationSearching(true);
    setLocationSearchError("");
    try {
      const params = new URLSearchParams({
        q: query,
        format: "json",
        addressdetails: "1",
        limit: "1",
        countrycodes: "in",
      });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: {
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Unable to search location.");
      }
      const results = await response.json();
      const top = results?.[0];
      if (!top) {
        setLocationResult(null);
        setLocationSearchError("No matching location found.");
        return;
      }
      const lat = Number(top.lat);
      const lng = Number(top.lon);
      const display = top.display_name || query;
      const type = (top.type || "").toLowerCase();
      const radiusKm = type.includes("city") || type.includes("state") || type.includes("region") ? 70 : 35;
      const nextResult = {
        label: display,
        lat,
        lng,
        radiusKm,
      };
      setLocationResult(nextResult);
      setMapCenter({ lat, lng });
      setMapZoom(type.includes("city") ? 11.5 : 12.5);
    } catch (error) {
      setLocationSearchError(error.message || "Location search failed.");
    } finally {
      setLocationSearching(false);
    }
  }

  function handleLocationClear() {
    setLocationResult(null);
    setLocationSearchError("");
    setLocationQuery("");
    setMapCenter(null);
    setMapZoom(null);
  }

  function isTimeRelevant(mode) {
    if (mode === "any") return true;
    const hour = new Date().getHours();
    if (mode === "commute") return (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
    if (mode === "night") return hour >= 21 || hour <= 5;
    return true;
  }

  function speedMultiplier(mode) {
    if (mode === "driving") return 1.6;
    if (mode === "transit") return 1.3;
    return 1;
  }

  function interestMatches(project) {
    if (geoPreferences.interestMode === "all") return true;
    const tags = project.interestTags || getProjectInterestTags(project);
    return tags.includes(geoPreferences.interestMode);
  }

  useEffect(() => {
    if (!user.isLoggedIn || !notificationsEnabled || nearbyGeoFenceProjects.length === 0) return;
    nearbyGeoFenceProjects.slice(0, 2).forEach((project) => {
      const notificationId = `civic:geofence:${project.id}`;
      queueNotification(
        {
          id: notificationId,
          type: "geo-detail",
          title: "Geo-fence alert",
          message: project.name,
          locationLabel: project.locationLabel,
          status: project.statusLabel || project.status,
          distance: formatDistanceKm(project.distanceKm),
          completion: project.completionPercent,
          impact: project.impact?.timeSaved,
          citizens: project.impact?.population,
        },
        10000,
        4
      );
    });
  }, [nearbyGeoFenceProjects, notificationsEnabled, user.isLoggedIn]);

  function toggleBookmark(projectId) {
    setBookmarkedIds((current) =>
      current.includes(projectId) ? current.filter((id) => id !== projectId) : [projectId, ...current]
    );
  }

  function handleLogin(name, email) {
    notificationTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    notificationTimersRef.current.clear();
    seenNotificationIdsRef.current.clear();
    setNotifications([]);
    setMapCenter(null);
    setMapZoom(null);
    setPendingLoginFocus(true);
    setUser({ isLoggedIn: true, name: name || "Citizen", role: "viewer", email: email || "" });
  }

  function handleLogout() {
    notificationTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    notificationTimersRef.current.clear();
    seenNotificationIdsRef.current.clear();
    setNotifications([]);
    setDashboardOpen(false);
    setDashboardSection(null);
    setProjectPanelSection("overview");
    setSelectedProjectId(null);
    setShow3D(false);
    setActive3DProjectId(null);
    setMapCenter(null);
    setMapZoom(null);
    setPendingLoginFocus(false);
    stopTracking?.();
    setUser({ isLoggedIn: false, name: "Guest", role: "viewer" });
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

  function handleAdminAnnouncement(text) {
    if (!text.trim()) return;
    const entry = {
      id: `ann-${Date.now()}`,
      message: text.trim(),
      createdAt: new Date().toISOString(),
    };
    const next = [entry, ...announcementFeed].slice(0, 8);
    setAnnouncementFeed(next);
    try {
      window.localStorage.setItem("civic:admin:announcements", JSON.stringify(next));
    } catch {
      // ignore
    }
    queueNotification(
      { id: entry.id, message: `Admin update: ${entry.message}`, type: "admin" },
      10000,
      4
    );
  }

  function handleAdminStatusUpdate(projectId, status) {
    if (!projectId || !status) return;
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId ? enrichProject({ ...project, status }) : project
      )
    );
  }

  if (!user.isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="civic-app">
      <TopNav
        onMenuClick={() => setDashboardOpen((current) => !current)}
        dashboardOpen={dashboardOpen}
        activeWorkspace={projectPanelSection === "models" ? "models" : projectPanelSection === "intelligence" ? "intelligence" : null}
        onWorkspaceChange={handleWorkspaceChange}
      />

      <main className="civic-main">
        <MapCanvas
          mapMode={mapMode}
          mapModes={MAP_MODES}
          projects={filteredProjects}
          geoFenceProjects={enrichedProjects.map((project) => ({
            ...project,
            activeGeoFence: activeGeoFenceProjectIds.includes(project.id),
          }))}
          loginFocusToken={loginFocusToken}
          userLocation={location}
          locationPermission={permissionState}
          onRequestLocation={requestLocation}
          onStartTracking={startTracking}
          onStopTracking={stopTracking}
          locationError={locationError}
          isLocating={isLocating}
          hasRequestedLocation={hasRequestedLocation}
          isTracking={isTracking}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleSelectProject}
          onMapModeChange={setMapMode}
        />

        {user.isLoggedIn && (
          <FilterPanel
            open={filterPanelOpen}
            onToggle={() => setFilterPanelOpen((current) => !current)}
            filters={filters}
            typeOptions={typeOptions}
            budgetBounds={filterBounds.budget}
            timelineBounds={{ years: filterBounds.years }}
            onChange={handleFilterChange}
            locationQuery={locationQuery}
            onLocationQuery={setLocationQuery}
            onLocationSearch={handleLocationSearch}
            onLocationClear={handleLocationClear}
            locationResult={locationResult}
            locationError={locationSearchError}
            locationSearching={locationSearching}
          />
        )}

        {user.isLoggedIn && (
          <ProjectInfoPanelV2
            key={`${selectedProjectId || "none"}:${projectPanelSection}`}
            project={selectedProject}
            projects={enrichedProjects}
            preferredLibraryProjectId={selectedProjectId ? null : nearestLiveProject?.id || null}
            activeSection={projectPanelSection}
            onSectionChange={setProjectPanelSection}
            onSelectProject={handleSelectProject}
            onClose={() => {
              setSelectedProjectId(null);
              setProjectPanelSection("overview");
            }}
            onOpen3D={handleOpen3D}
            onToggleBookmark={(projectId) => projectId && toggleBookmark(projectId)}
            isBookmarked={selectedProject ? bookmarkedIds.includes(selectedProject.id) : false}
            bookmarkedIds={bookmarkedIds}
          />
        )}

        {status.error && <div className="system-alert">{status.error}</div>}
      </main>

      {user.isLoggedIn && (
        <DashboardPanel
          open={dashboardOpen}
          onClose={() => setDashboardOpen(false)}
          activeSection={dashboardSection}
          onSelectSection={setDashboardSection}
          user={user}
          onLogout={handleLogout}
        />
      )}

      {user.isLoggedIn && <NotificationSystem notifications={notifications} />}

      {user.isLoggedIn && (
        <Project3DModal
          key={active3DProject?.id || "empty-3d"}
          open={show3D}
          project={active3DProject}
          onClose={() => {
            setShow3D(false);
            setActive3DProjectId(null);
          }}
        />
      )}
    </div>
  );
}
