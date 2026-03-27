import { normalizedVerifiedProjects } from "../../shared/verifiedProjects.js";

const store = {
  projects: [...normalizedVerifiedProjects],
  reports: [],
  notifications: [],
  users: [],
};

export function getMemoryStore() {
  return store;
}

export function replaceProjects(projects) {
  store.projects = Array.isArray(projects) ? [...projects] : [];
}

export function addProject(project) {
  store.projects.unshift(project);
  return project;
}

export function addReport(report) {
  store.reports.unshift(report);
  return report;
}

export function addNotification(notification) {
  store.notifications.unshift(notification);
  return notification;
}
