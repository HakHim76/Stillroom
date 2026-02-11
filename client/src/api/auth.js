import { api } from "./http";

export const authApi = {
  me: () => api("/api/auth/me", { method: "GET" }),

  signup: (username, email, password) =>
    api("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  login: (email, password) =>
    api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  logout: () => api("/api/auth/logout", { method: "POST" }),
};
