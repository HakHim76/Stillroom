import { api } from "./http";

export const authApi = {
  me: () => api("/api/auth/me", { method: "GET" }),
  signup: (email, password) =>
    api("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email, password) =>
    api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => api("/api/auth/logout", { method: "POST" }),
};
