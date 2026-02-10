import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { authApi } from "./api/auth";

import LandingPage from "./pages/LandingPage";
import Today from "./pages/Today";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function RequireAuth({ user, children }) {
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  function handleAuth(userFromServer) {
    setUser(userFromServer);
  }

  function handleLogout() {
    setUser(null);
  }

  if (checking) return <div style={{ padding: 16 }}>Loading…</div>;

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage user={user} />} />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/today" replace />
          ) : (
            <Login onAuth={handleAuth} />
          )
        }
      />

      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/today" replace />
          ) : (
            <Signup onAuth={handleAuth} />
          )
        }
      />

      {/* Protected */}
      <Route
        path="/today"
        element={
          <RequireAuth user={user}>
            <Today user={user} onLogout={handleLogout} />
          </RequireAuth>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
