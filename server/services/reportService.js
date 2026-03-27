import { hasDatabase, query } from "../db/pool.js";
import { addReport, addNotification, getMemoryStore } from "../data/store.js";
import { randomUUID } from "node:crypto";

export async function createReport(payload) {
  if (hasDatabase()) {
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    await query(
      `
        INSERT INTO reports (
          id,
          project_id,
          user_id,
          title,
          description,
          category,
          status,
          latitude,
          longitude,
          attachment_url,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        payload.projectId,
        payload.userId,
        payload.title,
        payload.description,
        payload.category,
        payload.status,
        payload.latitude,
        payload.longitude,
        payload.attachmentUrl,
        createdAt,
        createdAt,
      ]
    );

    return {
      id,
      createdAt,
      updatedAt: createdAt,
      ...payload,
    };
  }

  const report = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...payload,
  };
  addReport(report);
  addNotification({
    id: randomUUID(),
    type: "report",
    message: `Report submitted for ${payload.projectId || "unknown project"}`,
    createdAt: report.createdAt,
  });
  return report;
}

export function listReports() {
  if (hasDatabase()) {
    return query("SELECT * FROM reports ORDER BY created_at DESC LIMIT 100").then((result) => result.rows);
  }

  return getMemoryStore().reports;
}
