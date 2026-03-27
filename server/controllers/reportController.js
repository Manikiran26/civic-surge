import { createReport, listReports } from "../services/reportService.js";

export async function createReportHandler(req, res, next) {
  try {
    const report = await createReport(req.validated.body);
    res.status(201).json({ report });
  } catch (error) {
    next(error);
  }
}

export async function listReportsHandler(req, res, next) {
  try {
    const reports = await listReports();
    res.json({ reports, count: reports.length });
  } catch (error) {
    next(error);
  }
}
