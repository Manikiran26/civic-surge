import { normalizedVerifiedProjects } from "../../shared/verifiedProjects.js";

export const categoryColors = {
  metro: "#22d3ee",
  railway: "#38bdf8",
  "regional-rail": "#60a5fa",
  highway: "#f59e0b",
  road: "#f97316",
  hospital: "#fb7185",
  education: "#34d399",
  port: "#a78bfa",
  airport: "#facc15",
  wastewater: "#14b8a6",
  transport: "#38bdf8",
  infrastructure: "#94a3b8",
  utilities: "#c084fc",
};

function clampProgress(value) {
  if (!Number.isFinite(Number(value))) {
    return 0;
  }
  return Math.max(0, Math.min(100, Number(value)));
}

function humanizeType(type) {
  return String(type || "infrastructure").toLowerCase();
}

function normalizeForLegacy(project) {
  const category = humanizeType(project.type);
  const progress = clampProgress(project.completionPercent);

  return {
    id: project.id,
    name: project.name,
    category,
    type: category,
    status: project.status,
    agency: project.sourceName || "Government of India",
    impact: project.impactSummary || project.description || "unknown",
    citizens: project.nearby_population_benefit || project.citizens || "unknown",
    budget: project.budgetDisplay || "unknown",
    timeline: project.timelineDisplay || "unknown",
    completion: progress,
    progress,
    description: project.description || "unknown",
    source: {
      name: project.sourceName || "unknown",
      url: project.sourceUrl || "unknown",
    },
    sourceUrl: project.sourceUrl || "unknown",
    city: project.city,
    state: project.state,
    lat: project.latitude,
    lng: project.longitude,
    latitude: project.latitude,
    longitude: project.longitude,
    locationLabel: project.locationLabel || `${project.city}, ${project.state}`,
    geoPrecision: project.geoPrecision || "point",
    budgetDisplay: project.budgetDisplay || "unknown",
    timelineDisplay: project.timelineDisplay || "unknown",
    impactSummary: project.impactSummary || "unknown",
    geofenceRadiusM: project.geofenceRadiusM || 1500,
  };
}

export const projects = normalizedVerifiedProjects.map(normalizeForLegacy);

export function getProjectColor(project) {
  return categoryColors[String(project?.category || project?.type || "infrastructure").toLowerCase()] || "#06b6d4";
}
