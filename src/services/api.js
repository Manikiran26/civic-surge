import { normalizedVerifiedProjects } from "../../shared/verifiedProjects.js";

function resolveApiBase() {
  if (typeof import.meta === "undefined" || !import.meta.env) {
    return "/api";
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (import.meta.env.DEV) {
    const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
    return `http://${host}:4000/api`;
  }

  return "/api";
}

function isGitHubPagesHost() {
  if (typeof window === "undefined") {
    return false;
  }

  return /\.github\.io$/i.test(window.location.hostname);
}

const API_BASE =
  resolveApiBase();
const USE_LOCAL_DATA =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    String(import.meta.env.VITE_USE_LOCAL_DATA || "").toLowerCase() === "true") ||
  ((typeof import.meta !== "undefined" &&
    import.meta.env &&
    !import.meta.env.VITE_API_BASE_URL) &&
    isGitHubPagesHost());
const OFFLINE_REPORTS_KEY = "civic:offline:reports";
const OFFLINE_ADMIN_PROJECTS_KEY = "civic:offline:admin-projects";

function cloneProjects(projects) {
  return projects.map((project) => ({ ...project }));
}

function haversineDistanceMeters(lat1, lng1, lat2, lng2) {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

function localProjectFeed() {
  return cloneProjects(normalizedVerifiedProjects);
}

function localNearbyProjects({ lat, lng, radiusMeters = 3000 }) {
  return localProjectFeed()
    .map((project) => ({
      ...project,
      distanceMeters:
        Number.isFinite(project.latitude) && Number.isFinite(project.longitude)
          ? haversineDistanceMeters(lat, lng, project.latitude, project.longitude)
          : Number.POSITIVE_INFINITY,
    }))
    .filter((project) => project.distanceMeters <= radiusMeters)
    .sort((left, right) => left.distanceMeters - right.distanceMeters);
}

function readOfflineQueue(key) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeOfflineQueue(key, payload) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const current = readOfflineQueue(key);
    window.localStorage.setItem(key, JSON.stringify([...current, payload]));
  } catch {
    // Best effort only.
  }
}

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload.error || `Request failed with status ${response.status}`);
    }

    return payload;
  } catch (error) {
    const offlineError = new Error(error?.message || "Backend unavailable");
    offlineError.offline = true;
    throw offlineError;
  }
}

export function getProjects() {
  if (USE_LOCAL_DATA) {
    const projects = localProjectFeed();
    return Promise.resolve({
      projects,
      count: projects.length,
      meta: { source: "local-verified-cache", offline: true },
      source: "local",
    });
  }

  return request("/projects")
    .then((payload) => ({
      projects: payload.projects || payload.data || [],
      count: payload.count || payload.projects?.length || payload.data?.length || 0,
      meta: payload.meta || {},
      source: "api",
    }))
    .catch((error) => {
      if (!error.offline) {
        throw error;
      }

      const projects = localProjectFeed();
      return {
        projects,
        count: projects.length,
        meta: { source: "local-verified-cache", offline: true },
        source: "local",
      };
    });
}

export function getProjectById(projectId) {
  if (USE_LOCAL_DATA) {
    const project = localProjectFeed().find((item) => item.id === projectId) || null;
    return Promise.resolve({
      project,
      source: "local",
    });
  }

  return request(`/projects/${projectId}`)
    .then((payload) => ({
      project: payload.project || payload.data || null,
      source: "api",
    }))
    .catch((error) => {
      if (!error.offline) {
        throw error;
      }

      const project = localProjectFeed().find((item) => item.id === projectId) || null;
      return {
        project,
        source: "local",
      };
    });
}

export function getNearbyProjects({ lat, lng, radiusMeters = 3000 }) {
  if (USE_LOCAL_DATA) {
    const projects = localNearbyProjects({ lat, lng, radiusMeters });
    return Promise.resolve({
      projects,
      count: projects.length,
      source: "local",
    });
  }

  return request(`/projects/nearby?lat=${lat}&lng=${lng}&radius=${radiusMeters}`)
    .then((payload) => ({
      projects: payload.projects || payload.data || [],
      count: payload.count || payload.projects?.length || payload.data?.length || 0,
      source: "api",
    }))
    .catch((error) => {
      if (!error.offline) {
        throw error;
      }

      const projects = localNearbyProjects({ lat, lng, radiusMeters });
      return {
        projects,
        count: projects.length,
        source: "local",
      };
    });
}

export function submitReport(body) {
  if (USE_LOCAL_DATA) {
    const record = {
      ...body,
      createdAt: new Date().toISOString(),
      source: "local",
    };
    writeOfflineQueue(OFFLINE_REPORTS_KEY, record);
    return Promise.resolve({
      ok: true,
      source: "local",
      message: "Report stored locally while the backend is unavailable.",
      report: record,
    });
  }

  return request("/report", {
    method: "POST",
    body: JSON.stringify(body),
  }).catch((error) => {
    if (!error.offline) {
      throw error;
    }

    const record = {
      ...body,
      createdAt: new Date().toISOString(),
      source: "local",
    };
    writeOfflineQueue(OFFLINE_REPORTS_KEY, record);

    return {
      ok: true,
      source: "local",
      message: "Report stored locally while the backend is unavailable.",
      report: record,
    };
  });
}

export function submitAdminProject(body) {
  const payload = {
    externalId: null,
    name: body.name,
    description: body.impact_summary,
    type: body.type,
    status: body.status,
    budgetAmount: null,
    budgetCurrency: "INR",
    startDate: null,
    endDate: null,
    completionPercent: null,
    impact: body.impact_summary,
    sourceName: "manual_admin_submission",
    sourceUrl: body.source_url,
    city: body.city,
    state: body.state,
    locationLabel: `${body.city}, ${body.state}`,
    geoPrecision: "manual_point",
    budgetDisplay: "unknown",
    timelineDisplay: "unknown",
    geofenceRadiusM: 1500,
    location: {
      lat: body.latitude,
      lng: body.longitude,
    },
  };

  if (USE_LOCAL_DATA) {
    const record = {
      ...payload,
      createdAt: new Date().toISOString(),
      source: "local",
    };
    writeOfflineQueue(OFFLINE_ADMIN_PROJECTS_KEY, record);
    return Promise.resolve({
      ok: true,
      source: "local",
      message: "Project stored locally while the backend is unavailable.",
      project: record,
    });
  }

  return request("/admin/project", {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch((error) => {
    if (!error.offline) {
      throw error;
    }

    const record = {
      ...payload,
      createdAt: new Date().toISOString(),
      source: "local",
    };
    writeOfflineQueue(OFFLINE_ADMIN_PROJECTS_KEY, record);

    return {
      ok: true,
      source: "local",
      message: "Project stored locally while the backend is unavailable.",
      project: record,
    };
  });
}
