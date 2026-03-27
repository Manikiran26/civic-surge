import { Router } from "express";
import { listProjectsHandler, nearbyProjectsHandler, getProjectHandler } from "../controllers/projectsController.js";

const router = Router();

router.get("/", listProjectsHandler);
router.get("/nearby", nearbyProjectsHandler);
router.get("/:id", getProjectHandler);

export default router;
