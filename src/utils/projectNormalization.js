function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatBudget(project) {
  if (project.budget) return project.budget;
  if (Number.isFinite(Number(project.budgetAmount))) {
    return `${project.budgetCurrency || "INR"} ${Number(project.budgetAmount).toLocaleString("en-IN")}`;
  }
  return "unknown";
}

function formatTimeline(project) {
  if (project.timeline) return project.timeline;
  const start = project.start_date || project.startDate;
  const end = project.end_date || project.endDate;
  if (start && end) return `${start} to ${end}`;
  if (start) return `${start} onward`;
  return "unknown";
}

function formatProgress(project) {
  const candidates = [project.progress, project.completion_percent, project.completionPercent];
  const found = candidates.find((value) => Number.isFinite(Number(value)));
  return Number.isFinite(Number(found)) ? Number(found) : 0;
}

function formatCategory(project) {
  return (project.category || project.type || "infrastructure").toString().toLowerCase();
}

function formatAgency(project) {
  return project.agency || project.source_name || project.sourceName || "Government of India";
}

function formatCitizens(project) {
  return project.citizens || project.nearby_population_benefit || "unknown";
}

function formatImpact(project) {
  return project.impact || project.impact_metrics || "unknown";
}

function formatSource(project) {
  if (project.source?.name || project.source?.url) return project.source;
  const name = project.source_name || project.sourceName;
  const url = project.source_url || project.sourceUrl;
  if (name || url) {
    return {
      name: name || "unknown",
      url: url || "unknown",
    };
  }
  return {
    name: "unknown",
    url: "unknown",
  };
}

export function normalizeProject(project) {
  if (!project) return null;

  const lat = toNumber(project.lat ?? project.location?.lat);
  const lng = toNumber(project.lng ?? project.location?.lng);

  return {
    ...project,
    lat,
    lng,
    category: formatCategory(project),
    progress: formatProgress(project),
    budget: formatBudget(project),
    timeline: formatTimeline(project),
    agency: formatAgency(project),
    citizens: formatCitizens(project),
    impact: formatImpact(project),
    description: project.description || project.impact_metrics || "unknown",
    source: formatSource(project),
    status: project.status || "unknown",
  };
}

export function normalizeProjects(projects = []) {
  return projects.map(normalizeProject).filter(Boolean);
}
