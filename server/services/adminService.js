import { createProject } from "./projectService.js";

export async function createAdminProject(payload) {
  return createProject(payload);
}
