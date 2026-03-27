export function isValidCoordinate(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return Number.NaN;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function haversineKm([lat1, lng1], [lat2, lng2]) {
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function normalizeNearbyQuery(query = {}) {
  const lat = toNumber(query.lat);
  const lng = toNumber(query.lng);
  const radiusMeters = Number.isFinite(toNumber(query.radius))
    ? Math.min(Math.max(Math.trunc(toNumber(query.radius)), 100), 100000)
    : Number.isFinite(toNumber(query.radiusKm))
      ? Math.min(Math.max(toNumber(query.radiusKm) * 1000, 100), 100000)
      : 3000;
  const limit = Number.isFinite(toNumber(query.limit)) ? Math.min(Math.max(Math.trunc(toNumber(query.limit)), 1), 100) : 25;

  return { lat, lng, radiusMeters, limit };
}

export function buildNearbyProjectsSql() {
  return `
    SELECT
      p.id,
      p.external_id,
      p.name,
      p.city,
      p.state,
      p.location_label,
      p.geo_precision,
      p.description,
      p.project_type,
      p.status,
      p.budget_amount,
      p.budget_display,
      p.timeline_display,
      p.completion_percent,
      p.impact,
      p.source_name,
      p.source_url,
      p.source_date,
      p.latitude,
      p.longitude,
      p.geofence_radius_m,
      ST_Distance_Sphere(
        p.location,
        POINT(?, ?)
      ) AS distance_meters
    FROM projects p
    WHERE ST_Distance_Sphere(p.location, POINT(?, ?)) <= ?
    ORDER BY distance_meters ASC
    LIMIT ?
  `;
}

function formatBudgetDisplay(amount, explicitDisplay) {
  if (explicitDisplay && explicitDisplay !== "unknown") {
    return explicitDisplay;
  }

  if (typeof amount === "number" && Number.isFinite(amount)) {
    return `₹${amount.toLocaleString("en-IN")} crore`;
  }

  return "unknown";
}

export function projectRowToDto(row) {
  const budgetInrCrore =
    row.budget_amount === null || row.budget_amount === undefined ? null : Number(row.budget_amount);
  const completionPercent =
    row.completion_percent === null || row.completion_percent === undefined ? null : Number(row.completion_percent);
  const distanceMeters =
    row.distance_meters === null || row.distance_meters === undefined ? null : Number(row.distance_meters);

  return {
    id: row.external_id || row.id,
    externalId: row.external_id ?? null,
    name: row.name,
    city: row.city,
    state: row.state,
    locationLabel: row.location_label || `${row.city}, ${row.state}`,
    geoPrecision: row.geo_precision || "point",
    description: row.description || "",
    type: row.project_type,
    status: row.status || "unknown",
    budgetInrCrore,
    budgetDisplay: formatBudgetDisplay(budgetInrCrore, row.budget_display),
    timelineDisplay: row.timeline_display || "unknown",
    completionPercent,
    impactSummary: row.impact || "unknown",
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    sourceDate: row.source_date || null,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    geofenceRadiusM: row.geofence_radius_m || 1500,
    distanceMeters,
  };
}
