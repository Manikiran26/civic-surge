import { cacheStats } from "../config/cache.js";
import { dbHealthCheck, hasDatabase } from "../db/pool.js";

export async function healthHandler(_req, res, next) {
  try {
    const database = await dbHealthCheck().catch((error) => ({
      ok: false,
      message: error.message,
    }));

    res.json({
      ok: true,
      service: "civic-intelligence-backend",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      database,
      cache: cacheStats(),
      runtime: {
        node: process.version,
        hasDatabase: hasDatabase(),
      },
    });
  } catch (error) {
    next(error);
  }
}
