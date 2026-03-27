import { getNearbyProjects, getProjectById, listProjects } from "../services/projectService.js";
import { isValidCoordinate, normalizeNearbyQuery } from "../utils/geo.js";
import { getDatabaseMode } from "../db/pool.js";

export async function listProjectsHandler(req, res, next) {
  try {
    const projects = await listProjects();
    res.json({
      projects,
      count: projects.length,
      meta: {
        source: getDatabaseMode(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function nearbyProjectsHandler(req, res, next) {
  try {
    const { lat, lng, radiusMeters, limit } = normalizeNearbyQuery(req.query);

    if (!isValidCoordinate(lat, lng)) {
      return res.status(400).json({
        error: "lat and lng are required valid coordinates",
      });
    }

    const projects = await getNearbyProjects({ lat, lng, radiusMeters, limit });
    res.json({
      projects,
      count: projects.length,
      query: { lat, lng, radiusMeters, limit },
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectHandler(req, res, next) {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ project });
  } catch (error) {
    next(error);
  }
}
