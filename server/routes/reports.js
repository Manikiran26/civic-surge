import { Router } from "express";
import { z } from "zod";
import { createReportHandler, listReportsHandler } from "../controllers/reportController.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const reportSchema = z.object({
  projectId: z.string().min(1).optional().nullable(),
  userId: z.string().min(1).optional().nullable(),
  title: z.string().min(3).max(180),
  description: z.string().min(10).max(4000),
  category: z.string().min(2).max(80),
  status: z.string().min(2).max(40).default("open"),
  latitude: z.number().finite().optional().nullable(),
  longitude: z.number().finite().optional().nullable(),
  attachmentUrl: z.string().url().optional().nullable(),
});

router.get("/", listReportsHandler);
router.post("/", validate(reportSchema), createReportHandler);

export default router;
