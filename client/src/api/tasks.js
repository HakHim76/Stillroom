import { api } from "./http";

export const tasksApi = {
  list: () => api("/api/tasks", { method: "GET" }),
  create: (title) =>
    api("/api/tasks", { method: "POST", body: JSON.stringify({ title }) }),
  patch: (id, updates) =>
    api(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(updates) }),
  remove: (id) => api(`/api/tasks/${id}`, { method: "DELETE" }),
};
