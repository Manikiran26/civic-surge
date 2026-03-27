import { normalizedVerifiedProjects } from "../../shared/verifiedProjects.js";

function normalizeKey(project) {
  return `${project.name}`.trim().toLowerCase().replace(/\s+/g, " ") + `::${project.state}`.toLowerCase();
}

function isValidCoordinate(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

const seen = new Set();
const issues = [];

for (const project of normalizedVerifiedProjects) {
  const key = normalizeKey(project);
  if (seen.has(key)) {
    issues.push(`Duplicate project identity: ${project.name} (${project.state})`);
  }
  seen.add(key);

  if (!project.id || !project.name || !project.type || !project.status || !project.sourceUrl) {
    issues.push(`Missing required field set for project: ${project.id || project.name || "unknown"}`);
  }

  if (!isValidCoordinate(project.latitude, project.longitude)) {
    issues.push(`Invalid coordinates for ${project.name}: ${project.latitude}, ${project.longitude}`);
  }

  if (!project.locationLabel || !project.geoPrecision) {
    issues.push(`Missing geo metadata for ${project.name}`);
  }
}

if (issues.length) {
  console.error("Dataset validation failed:");
  issues.forEach((issue) => console.error(`- ${issue}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${normalizedVerifiedProjects.length} verified projects with no duplicate ids or coordinate failures.`);
}
