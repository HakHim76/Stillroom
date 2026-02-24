import { api } from "./http";

const BASE = import.meta.env.VITE_API_BASE || "";

export const tasksApi = {
  list: () => api(`${BASE}/api/tasks`, { method: "GET" }),
  create: (title) =>
    api(`${BASE}/api/tasks`, {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  patch: (id, updates) =>
    api(`${BASE}/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    }),
  remove: (id) => api(`${BASE}/api/tasks/${id}`, { method: "DELETE" }),
};
