import { env } from "../config/env.js";
import { getMemoryStore } from "../data/store.js";

let mysqlModule = null;
try {
  mysqlModule = await import("mysql2/promise");
} catch (error) {
  if (error?.code !== "ERR_MODULE_NOT_FOUND") {
    throw error;
  }
}

const mysqlConfigured = Boolean(env.MYSQL_HOST && env.MYSQL_USER && env.MYSQL_DATABASE);

if (mysqlConfigured && !mysqlModule) {
  console.warn("MySQL settings are configured but mysql2 is not installed. Falling back to memory store.");
}

const pool =
  mysqlModule && mysqlConfigured
    ? mysqlModule.createPool({
        host: env.MYSQL_HOST,
        port: env.MYSQL_PORT,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: env.MYSQL_POOL_MAX,
        namedPlaceholders: false,
        ssl: env.MYSQL_SSL ? { rejectUnauthorized: false } : undefined,
      })
    : null;

export function hasDatabase() {
  return Boolean(pool);
}

export function getDatabaseMode() {
  if (pool) {
    return "mysql";
  }

  if (mysqlConfigured && !mysqlModule) {
    return "memory";
  }

  return "memory";
}

export async function query(text, params = []) {
  if (!pool) {
    throw new Error(
      mysqlConfigured
        ? "MySQL driver is not installed. Run npm install to install mysql2."
        : "MySQL connection is not configured"
    );
  }

  const [rows] = await pool.execute(text, params);
  return { rows };
}

export async function dbHealthCheck() {
  if (!pool) {
    return {
      ok: false,
      message: mysqlConfigured
        ? "MySQL driver not installed"
        : "MySQL configuration not configured",
    };
  }

  await pool.execute("SELECT 1 AS ok");
  return {
    ok: true,
    message: "database reachable",
  };
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
  }
}

export function getMemoryProjects() {
  return getMemoryStore().projects;
}
