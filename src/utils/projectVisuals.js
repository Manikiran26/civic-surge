function hashString(input = "") {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pick(list, seed) {
  return list[seed % list.length];
}

function seededBlocks(seed, labels, layout = "grid") {
  return labels.map((label, index) => {
    const base = seed + index * 97;
    const width = 16 + (base % 12);
    const height = 12 + ((base >> 3) % 10);
    const x = layout === "linear"
      ? 8 + index * 14 + (base % 4)
      : 8 + ((base >> 1) % 70);
    const y = layout === "linear"
      ? 18 + ((base >> 2) % 24)
      : 14 + ((base >> 2) % 68);

    return { label, x, y, w: Math.min(width, 34), h: Math.min(height, 24) };
  });
}

function buildDomainSignature(type) {
  const domain = String(type || "infrastructure").toLowerCase();

  if (domain.includes("hospital") || domain.includes("health")) {
    return {
      theme: "clinical",
      colorShift: 6,
      labels: ["ER", "OPD", "ICU", "Wards", "Labs", "Pharmacy", "Admin"],
      layout: "grid",
    };
  }

  if (domain.includes("metro") || domain.includes("rail")) {
    return {
      theme: "transit",
      colorShift: 14,
      labels: ["Entry", "Concourse", "Platform", "Track", "OHE", "Depot", "Service"],
      layout: "linear",
    };
  }

  if (domain.includes("road") || domain.includes("highway")) {
    return {
      theme: "corridor",
      colorShift: 22,
      labels: ["Lane", "Shoulder", "Median", "Junction", "Drain", "Bridge", "Ramp"],
      layout: "linear",
    };
  }

  if (domain.includes("airport")) {
    return {
      theme: "terminal",
      colorShift: 11,
      labels: ["Arrivals", "Security", "Check-in", "Baggage", "Apron", "Gate", "Taxiway"],
      layout: "grid",
    };
  }

  if (domain.includes("port")) {
    return {
      theme: "harbour",
      colorShift: 18,
      labels: ["Berth", "Yard", "Stack", "Gate", "Crane", "Ware", "Road"],
      layout: "grid",
    };
  }

  if (domain.includes("education") || domain.includes("school")) {
    return {
      theme: "campus",
      colorShift: 9,
      labels: ["Class", "Labs", "Library", "Hall", "Admin", "Play", "Utilities"],
      layout: "grid",
    };
  }

  if (domain.includes("wastewater") || domain.includes("utility")) {
    return {
      theme: "utility",
      colorShift: 28,
      labels: ["Inlet", "Treatment", "Clarifier", "Storage", "Outfall", "Power", "Service"],
      layout: "grid",
    };
  }

  return {
    theme: "civic",
    colorShift: 4,
    labels: ["Core", "Support", "Public", "Access", "Service", "Systems", "Ops"],
    layout: "grid",
  };
}

export function getProjectVisualProfile(project) {
  const id = String(project?.id || "unknown");
  const seed = hashString(id);
  const domain = buildDomainSignature(project?.category || project?.type);
  const palette = [
    "#22d3ee",
    "#38bdf8",
    "#60a5fa",
    "#f59e0b",
    "#f97316",
    "#fb7185",
    "#34d399",
    "#a78bfa",
    "#facc15",
    "#14b8a6",
    "#c084fc",
    "#94a3b8",
  ];
  const accent = pick(palette, seed + domain.colorShift);
  const secondary = pick(palette, seed + domain.colorShift + 5);
  const titlePrefix = pick(
    ["Civic", "Urban", "Transit", "Regional", "Mission", "Gateway", "Corridor", "Public"],
    seed
  );
  const structurePattern = pick(
    ["grid", "linear", "hub", "stacked", "ring"],
    seed + domain.colorShift
  );
  const layoutVariant = pick(["compact", "expanded", "balanced", "minimal"], seed >> 2);
  const iconStyle = pick(["shield", "marker", "node", "arc", "badge"], seed >> 4);

  return {
    id,
    seed,
    title: `${titlePrefix} ${domain.theme} profile`,
    accent,
    secondary,
    theme: domain.theme,
    structurePattern,
    layoutVariant,
    iconStyle,
    blocks: seededBlocks(seed, domain.labels, domain.layout),
    scale: 0.8 + ((seed % 7) * 0.06),
    turnRate: 0.004 + ((seed % 5) * 0.0015),
    markerCount: 3 + (seed % 4),
    labelTag: pick(
      ["future-state", "delivery", "operations", "expansion", "transit", "health", "connectivity"],
      seed + 11
    ),
    caption: `${pick(["Civic", "Public", "Verified", "Live"], seed + 17)} ${pick(["overview", "blueprint", "ar", "simulation"], seed + 3)}`,
  };
}
