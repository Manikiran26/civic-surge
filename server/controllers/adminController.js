import { createAdminProject } from "../services/adminService.js";

export async function createAdminProjectHandler(req, res, next) {
  try {
    const project = await createAdminProject(req.validated.body);
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}
