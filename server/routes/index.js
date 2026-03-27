import { Router } from "express";
import healthRoutes from "./health.js";
import projectRoutes from "./projects.js";
import reportRoutes from "./reports.js";
import adminRoutes from "./admin.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/projects", projectRoutes);
router.use("/report", reportRoutes);
router.use("/admin", adminRoutes);

router.get("/", (req, res) => {
  res.json({
    service: "civic-intelligence-backend",
    endpoints: [
      "GET /health",
      "GET /projects",
      "GET /projects/nearby?lat=&lng=&radius=",
      "GET /projects/:id",
      "POST /report",
      "POST /admin/project",
    ],
  });
});

export default router;
