import { randomUUID } from "node:crypto";
import { getCache, setCache, clearCache } from "../config/cache.js";
import { env } from "../config/env.js";
import { getMemoryStore, addProject } from "../data/store.js";
import { hasDatabase, query } from "../db/pool.js";
import { buildNearbyProjectsSql, haversineKm, isValidCoordinate, projectRowToDto } from "../utils/geo.js";

function cacheKeyForList() {
  return "projects:list:v2";
}

function cacheKeyForNearby(lat, lng, radiusMeters, limit) {
  return `projects:nearby:${lat}:${lng}:${radiusMeters}:${limit}`;
}

function sortProjects(projects) {
  return [...projects].sort((left, right) => {
    return `${left.state}:${left.city}:${left.name}`.localeCompare(`${right.state}:${right.city}:${right.name}`);
  });
}

function fallbackProjects() {
  return sortProjects(getMemoryStore().projects);
}

export async function listProjects() {
  const cached = getCache(cacheKeyForList());
  if (cached) {
    return cached;
  }

  if (hasDatabase()) {
    const { rows } = await query(
      `
        SELECT
          id,
          external_id,
          name,
          city,
          state,
          location_label,
          geo_precision,
          description,
          project_type,
          status,
          budget_amount,
          budget_display,
          timeline_display,
          completion_percent,
          impact,
          source_name,
          source_url,
          source_date,
          latitude,
          longitude,
          geofence_radius_m
        FROM projects
        ORDER BY state ASC, city ASC, name ASC
      `
    );

    const result = rows.map(projectRowToDto);
    setCache(cacheKeyForList(), result, env.CACHE_TTL_SECONDS);
    return result;
  }

  const result = fallbackProjects();
  setCache(cacheKeyForList(), result, env.CACHE_TTL_SECONDS);
  return result;
}

export async function getProjectById(id) {
  if (hasDatabase()) {
    const { rows } = await query(
      `
        SELECT
          id,
          external_id,
          name,
          city,
          state,
          location_label,
          geo_precision,
          description,
          project_type,
          status,
          budget_amount,
          budget_display,
          timeline_display,
          completion_percent,
          impact,
          source_name,
          source_url,
          source_date,
          latitude,
          longitude,
          geofence_radius_m
        FROM projects
        WHERE id = ? OR external_id = ?
        LIMIT 1
      `,
      [id, id]
    );

    return rows[0] ? projectRowToDto(rows[0]) : null;
  }

  return fallbackProjects().find((project) => project.id === id || project.externalId === id) ?? null;
}

export async function getNearbyProjects({ lat, lng, radiusMeters, limit }) {
  const key = cacheKeyForNearby(lat, lng, radiusMeters, limit);
  const cached = getCache(key);
  if (cached) {
    return cached;
  }

  if (hasDatabase()) {
    const { rows } = await query(buildNearbyProjectsSql(), [lng, lat, lng, lat, radiusMeters, limit]);
    const result = rows.map(projectRowToDto);
    setCache(key, result, env.CACHE_TTL_SECONDS);
    return result;
  }

  const result = fallbackProjects()
    .filter((project) => isValidCoordinate(project.latitude, project.longitude))
    .map((project) => ({
      ...project,
      distanceMeters: haversineKm([lat, lng], [project.latitude, project.longitude]) * 1000,
    }))
    .filter((project) => project.distanceMeters <= radiusMeters)
    .sort((left, right) => left.distanceMeters - right.distanceMeters)
    .slice(0, limit);

  setCache(key, result, env.CACHE_TTL_SECONDS);
  return result;
}

export async function createProject(payload) {
  if (hasDatabase()) {
    const id = randomUUID();
    await query(
      `
        INSERT INTO projects (
          id,
          external_id,
          name,
          city,
          state,
          location_label,
          geo_precision,
          description,
          project_type,
          status,
          budget_amount,
          budget_display,
          timeline_display,
          completion_percent,
          impact,
          source_name,
          source_url,
          latitude,
          longitude,
          geofence_radius_m,
          location
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, POINT(?, ?)
        )
        ON DUPLICATE KEY UPDATE
          external_id = VALUES(external_id),
          name = VALUES(name),
          city = VALUES(city),
          state = VALUES(state),
          location_label = VALUES(location_label),
          geo_precision = VALUES(geo_precision),
          description = VALUES(description),
          project_type = VALUES(project_type),
          status = VALUES(status),
          budget_amount = VALUES(budget_amount),
          budget_display = VALUES(budget_display),
          timeline_display = VALUES(timeline_display),
          completion_percent = VALUES(completion_percent),
          impact = VALUES(impact),
          source_name = VALUES(source_name),
          source_url = VALUES(source_url),
          latitude = VALUES(latitude),
          longitude = VALUES(longitude),
          geofence_radius_m = VALUES(geofence_radius_m),
          location = VALUES(location),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        id,
        payload.externalId,
        payload.name,
        payload.city,
        payload.state,
        payload.locationLabel,
        payload.geoPrecision,
        payload.description,
        payload.type,
        payload.status,
        payload.budgetAmount,
        payload.budgetDisplay,
        payload.timelineDisplay,
        payload.completionPercent,
        payload.impact,
        payload.sourceName,
        payload.sourceUrl,
        payload.location.lat,
        payload.location.lng,
        payload.geofenceRadiusM,
        payload.location.lat,
        payload.location.lng,
      ]
    );

    clearCache((cacheKey) => cacheKey.startsWith("projects:"));
    return (await getProjectById(payload.externalId || id)) ?? projectRowToDto({
      id,
      external_id: payload.externalId,
      name: payload.name,
      city: payload.city,
      state: payload.state,
      location_label: payload.locationLabel,
      geo_precision: payload.geoPrecision,
      description: payload.description,
      project_type: payload.type,
      status: payload.status,
      budget_amount: payload.budgetAmount,
      budget_display: payload.budgetDisplay,
      timeline_display: payload.timelineDisplay,
      completion_percent: payload.completionPercent,
      impact: payload.impact,
      source_name: payload.sourceName,
      source_url: payload.sourceUrl,
      latitude: payload.location.lat,
      longitude: payload.location.lng,
      geofence_radius_m: payload.geofenceRadiusM,
    });
  }

  const project = {
    id: payload.externalId || `admin-${randomUUID()}`,
    externalId: payload.externalId || null,
    name: payload.name,
    city: payload.city,
    state: payload.state,
    locationLabel: payload.locationLabel,
    geoPrecision: payload.geoPrecision,
    description: payload.description,
    type: payload.type,
    status: payload.status,
    budgetInrCrore: payload.budgetAmount,
    budgetDisplay: payload.budgetDisplay,
    timelineDisplay: payload.timelineDisplay,
    completionPercent: payload.completionPercent,
    impactSummary: payload.impact,
    sourceName: payload.sourceName,
    sourceUrl: payload.sourceUrl,
    latitude: payload.location.lat,
    longitude: payload.location.lng,
    geofenceRadiusM: payload.geofenceRadiusM,
  };

  addProject(project);
  clearCache((cacheKey) => cacheKey.startsWith("projects:"));
  return project;
}
