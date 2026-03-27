import { Router } from "express";
import { z } from "zod";
import { createAdminProjectHandler } from "../controllers/adminController.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const adminProjectSchema = z.object({
  externalId: z.string().min(1).max(120).optional().nullable(),
  name: z.string().min(3).max(240),
  city: z.string().min(2).max(120),
  state: z.string().min(2).max(120),
  locationLabel: z.string().min(2).max(200).optional().nullable(),
  geoPrecision: z.string().min(2).max(120).default("manual_point"),
  description: z.string().min(10).max(6000).optional().nullable(),
  type: z.string().min(2).max(80),
  status: z.enum(["planned", "ongoing", "completed", "delayed", "unknown"]).default("unknown"),
  budgetAmount: z.number().finite().nonnegative().optional().nullable(),
  budgetCurrency: z.string().min(3).max(8).default("INR"),
  budgetDisplay: z.string().min(2).max(80).optional().nullable(),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  timelineDisplay: z.string().min(2).max(160).optional().nullable(),
  completionPercent: z.number().finite().min(0).max(100).optional().nullable(),
  impact: z.string().max(2000).optional().nullable(),
  sourceName: z.string().min(2).max(120),
  sourceUrl: z.string().url(),
  geofenceRadiusM: z.number().int().positive().max(100000).default(1500),
  location: z.object({
    lat: z.number().finite().min(-90).max(90),
    lng: z.number().finite().min(-180).max(180),
  }),
});

router.post("/project", validate(adminProjectSchema), createAdminProjectHandler);

export default router;
