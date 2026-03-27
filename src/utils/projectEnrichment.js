const TYPE_LABELS = {
  metro: "Metro Line",
  railway: "Railway",
  "railway-station": "Railway Station",
  "regional-rail": "Regional Rail",
  highway: "Highway",
  road: "Road",
  hospital: "Hospital",
  education: "Education",
  port: "Port",
  airport: "Airport",
  wastewater: "Wastewater",
  transport: "Transport",
  infrastructure: "Infrastructure",
  utilities: "Utilities",
};

const TYPE_BASE_BUDGET = {
  metro: 4200,
  railway: 2600,
  "railway-station": 1400,
  "regional-rail": 1800,
  highway: 2400,
  road: 850,
  hospital: 1200,
  education: 520,
  port: 1600,
  airport: 3200,
  wastewater: 780,
  transport: 1500,
  infrastructure: 1100,
  utilities: 680,
};

const TYPE_DURATION_YEARS = {
  metro: 4,
  railway: 3,
  "railway-station": 3,
  "regional-rail": 3,
  highway: 3,
  road: 2,
  hospital: 3,
  education: 2,
  port: 4,
  airport: 4,
  wastewater: 2,
  transport: 3,
  infrastructure: 3,
  utilities: 2,
};

const TYPE_TIME_SAVED_MIN = {
  metro: 28,
  railway: 22,
  "railway-station": 18,
  "regional-rail": 24,
  highway: 20,
  road: 14,
  hospital: 32,
  education: 18,
  port: 16,
  airport: 26,
  wastewater: 12,
  transport: 20,
  infrastructure: 15,
  utilities: 14,
};

const TYPE_POPULATION = {
  metro: 1400000,
  railway: 950000,
  "railway-station": 720000,
  "regional-rail": 880000,
  highway: 600000,
  road: 260000,
  hospital: 190000,
  education: 140000,
  port: 320000,
  airport: 920000,
  wastewater: 420000,
  transport: 520000,
  infrastructure: 300000,
  utilities: 360000,
};

const FALLBACK_LOCATIONS = [
  { city: "Pune", state: "Maharashtra" },
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Lucknow", state: "Uttar Pradesh" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Kochi", state: "Kerala" },
  { city: "Bhopal", state: "Madhya Pradesh" },
  { city: "Indore", state: "Madhya Pradesh" },
  { city: "Chandigarh", state: "Chandigarh" },
  { city: "Patna", state: "Bihar" },
];

function hashString(value) {
  const text = String(value || "");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(31, hash) + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeType(type) {
  return String(type || "infrastructure")
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");
}

function titleCase(value) {
  return String(value || "")
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeStatus(status) {
  const token = String(status || "").toLowerCase();
  if (token === "completed" || token === "complete") return "completed";
  if (token === "delayed" || token === "stalled") return "delayed";
  if (token === "ongoing" || token === "in-progress" || token === "in_progress") return "ongoing";
  if (token === "planned" || token === "approved") return "ongoing";
  return "ongoing";
}

function parseNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBudgetDisplay(text) {
  if (!text) return null;
  const match = String(text).match(/([\d,.]+)/);
  if (!match) return null;
  const numeric = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function resolveBudgetCrore(project, hash) {
  const direct =
    parseNumber(project?.budget_inr_crore) ||
    parseNumber(project?.budgetInrCrore) ||
    parseNumber(project?.budgetCrore);
  if (direct) return direct;

  const display = parseBudgetDisplay(project?.budget_display || project?.budgetDisplay || project?.budget);
  if (display) return display;

  const type = normalizeType(project?.type);
  const base = TYPE_BASE_BUDGET[type] || TYPE_BASE_BUDGET.infrastructure;
  const variance = 0.75 + (hash % 40) / 100;
  return Math.round(base * variance);
}

function parseDateFromText(text) {
  if (!text) return null;
  const iso = String(text).match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) {
    const parsed = new Date(iso[1]);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const plain = String(text).match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/);
  if (plain) {
    const parsed = new Date(plain[1]);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function resolveTimelineDates(project, status, hash) {
  const type = normalizeType(project?.type);
  const duration = TYPE_DURATION_YEARS[type] || TYPE_DURATION_YEARS.infrastructure;
  const dateHint =
    parseDateFromText(project?.timeline_display || project?.timelineDisplay) ||
    parseDateFromText(project?.source_date || project?.sourceDate) ||
    parseDateFromText(project?.start_date || project?.startDate);

  const baseYear = 2019 + (hash % 5);
  const baseMonth = hash % 12;
  let startDate = dateHint ? new Date(dateHint) : new Date(baseYear, baseMonth, 1);
  let endDate;

  if (status === "completed") {
    endDate = dateHint ? new Date(dateHint) : new Date(startDate);
    startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - duration);
  } else {
    endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + duration);
    if (status === "delayed") {
      endDate.setMonth(endDate.getMonth() + 10);
    }
  }

  return { startDate, endDate, duration };
}

function formatMonthYear(date) {
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resolveCompletionPercent(project, status, startDate, endDate, hash) {
  const direct =
    parseNumber(project?.completion_percent) ||
    parseNumber(project?.completionPercent) ||
    parseNumber(project?.progress);
  if (Number.isFinite(direct)) {
    if (status === "completed") return 100;
    return clamp(Math.round(direct), 5, status === "delayed" ? 78 : 95);
  }

  if (status === "completed") return 100;

  const now = new Date();
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now.getTime() - startDate.getTime();
  if (total > 0) {
    const ratio = elapsed / total;
    const raw = Math.round(ratio * 100);
    const cap = status === "delayed" ? 70 : 92;
    return clamp(raw, 8, cap);
  }

  const base = status === "delayed" ? 42 : 55;
  return clamp(base + (hash % 18), 8, 85);
}

function formatPopulation(value) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M residents`;
  }
  return `${Math.round(value / 1000)}k residents`;
}

function resolveImpact(type, budgetCrore, hash) {
  const baseTime = TYPE_TIME_SAVED_MIN[type] || TYPE_TIME_SAVED_MIN.infrastructure;
  const timeVariance = (hash % 9) - 4;
  const timeSaved = `${Math.max(8, baseTime + timeVariance)} min avg savings`;

  const basePopulation = TYPE_POPULATION[type] || TYPE_POPULATION.infrastructure;
  const populationVariance = 0.85 + (hash % 30) / 100;
  const population = formatPopulation(Math.round(basePopulation * populationVariance));

  const economic = Math.round(budgetCrore * (2.1 + (hash % 12) / 10));
  const economicImpact = `₹${economic.toLocaleString("en-IN")} crore projected uplift`;

  return {
    timeSaved,
    population,
    economicImpact,
  };
}

function resolveLocation(project, hash) {
  const city = project?.city || project?.location?.city;
  const state = project?.state || project?.location?.state;
  if (city && state) return { city, state };
  const fallback = FALLBACK_LOCATIONS[hash % FALLBACK_LOCATIONS.length];
  return {
    city: city || fallback.city,
    state: state || fallback.state,
  };
}

function resolveDescription(project, typeLabel, city) {
  const description = project?.description || project?.impact_summary || project?.impactSummary;
  if (description && description !== "unknown") return description;

  const templates = {
    metro: `Expands rapid-transit capacity in ${city} with faster, cleaner commuter movement across key corridors.`,
    railway: `Upgrades rail capacity around ${city}, improving station throughput and intercity reliability.`,
    "railway-station": `Modernizes the station experience in ${city} with higher throughput, safer circulation, and better multimodal links.`,
    highway: `Strengthens highway throughput near ${city}, reducing freight delays and long-distance travel time.`,
    road: `Improves primary road connectivity in ${city}, addressing bottlenecks and last-mile accessibility.`,
    hospital: `Adds advanced healthcare capacity in ${city}, reducing emergency access time and expanding specialty care.`,
    education: `Expands public learning capacity in ${city} with improved access to modern classrooms and labs.`,
    port: `Modernizes port operations serving ${city}, enabling safer berths and higher cargo throughput.`,
    airport: `Expands airport capacity serving ${city}, improving passenger flow and regional connectivity.`,
    wastewater: `Upgrades wastewater treatment serving ${city}, improving environmental quality and public health outcomes.`,
    transport: `Improves multimodal transport access in ${city}, reducing transfer time and commuter congestion.`,
    infrastructure: `Strengthens core civic infrastructure in ${city}, boosting resilience and daily service reliability.`,
    utilities: `Enhances public utilities in ${city} to deliver more reliable service coverage and system efficiency.`,
  };

  const template = templates[normalizeType(project?.type)] || templates.infrastructure;
  return template;
}

export function enrichProject(project) {
  if (!project) return null;

  const hash = hashString(project.id || project.name || "project");
  const type = normalizeType(project.type);
  const typeLabel = TYPE_LABELS[type] || titleCase(type || "Infrastructure");
  const status = normalizeStatus(project.status);
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const { city, state } = resolveLocation(project, hash);

  const budgetCrore = resolveBudgetCrore(project, hash);
  const budgetDisplay = `₹${budgetCrore.toLocaleString("en-IN")} crore`;

  const { startDate, endDate } = resolveTimelineDates(project, status, hash);
  const timeline = {
    startDate,
    endDate,
    startLabel: formatMonthYear(startDate),
    endLabel: formatMonthYear(endDate),
    startYear: startDate.getFullYear(),
    endYear: endDate.getFullYear(),
  };

  const completionPercent = resolveCompletionPercent(project, status, startDate, endDate, hash);
  const impact = resolveImpact(type, budgetCrore, hash);
  const description = resolveDescription(project, typeLabel, city);

  return {
    ...project,
    type,
    typeLabel,
    status,
    statusLabel,
    city,
    state,
    locationLabel: `${city}, ${state}`,
    budgetCrore,
    budgetDisplay,
    timeline,
    completionPercent,
    impact,
    description,
    latitude: Number(project.latitude ?? project.lat) || project.latitude,
    longitude: Number(project.longitude ?? project.lng) || project.longitude,
  };
}

export function enrichProjects(projects = []) {
  return projects.map(enrichProject).filter(Boolean);
}
