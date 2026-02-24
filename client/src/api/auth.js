import { api } from "./http";
const BASE = import.meta.env.VITE_API_BASE || "";

export const authApi = {
  me: () => api(`${BASE}/api/auth/me`, { method: "GET" }),

  signup: (username, email, password) =>
    api(`${BASE}/api/auth/signup`, {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email, password) =>
    api(`${BASE}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => api(`${BASE}/api/auth/logout`, { method: "POST" }),
};
