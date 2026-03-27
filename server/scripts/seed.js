import { query, hasDatabase } from "../db/pool.js";
import { normalizedVerifiedProjects } from "../../shared/verifiedProjects.js";
import { randomUUID } from "node:crypto";

function toTimestamp(value) {
  if (!value || value === "unknown") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

async function main() {
  if (!hasDatabase()) {
    console.log("MySQL database is not configured or mysql2 is missing, skipping database seed");
    return;
  }

  if (!Array.isArray(normalizedVerifiedProjects) || normalizedVerifiedProjects.length === 0) {
    console.log("No verified projects found");
    return;
  }

  for (const project of normalizedVerifiedProjects) {
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
          budget_currency,
          budget_display,
          start_date,
          end_date,
          timeline_display,
          completion_percent,
          impact,
          source_name,
          source_url,
          source_date,
          latitude,
          longitude,
          geofence_radius_m,
          location
        )
        VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'INR', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, POINT(?, ?)
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
          start_date = VALUES(start_date),
          end_date = VALUES(end_date),
          timeline_display = VALUES(timeline_display),
          completion_percent = VALUES(completion_percent),
          impact = VALUES(impact),
          source_name = VALUES(source_name),
          source_url = VALUES(source_url),
          source_date = VALUES(source_date),
          latitude = VALUES(latitude),
          longitude = VALUES(longitude),
          geofence_radius_m = VALUES(geofence_radius_m),
          location = VALUES(location),
          updated_at = CURRENT_TIMESTAMP
      `,
      [
        id,
        project.id,
        project.name,
        project.city,
        project.state,
        project.locationLabel,
        project.geoPrecision,
        project.description ?? null,
        project.type,
        project.status,
        project.budgetInrCrore ?? null,
        project.budgetDisplay ?? "unknown",
        null,
        null,
        project.timelineDisplay ?? "unknown",
        project.completionPercent ?? null,
        project.impactSummary ?? "unknown",
        project.sourceName ?? "unknown",
        project.sourceUrl,
        project.sourceDate ? toTimestamp(project.sourceDate) : null,
        project.latitude,
        project.longitude,
        project.geofenceRadiusM ?? 1500,
        project.longitude,
        project.latitude,
      ]
    );
  }

  console.log(`Seeded ${normalizedVerifiedProjects.length} verified projects`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
