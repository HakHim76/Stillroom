import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { authApi } from "./api/auth";
import RouteTransition from "./components/RouteTransition";

import LandingPage from "./pages/LandingPage";
import Today from "./pages/Today";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";

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
      <Route
        path="/"
        element={
          <RouteTransition>
            <LandingPage user={user} onLogout={handleLogout} />
          </RouteTransition>
        }
      />

      <Route
        path="/about"
        element={
          <RouteTransition>
            <About user={user} onLogout={handleLogout} />
          </RouteTransition>
        }
      />

      <Route
        path="/login"
        element={
          <RouteTransition>
            {user ? (
              <Navigate to="/today" replace />
            ) : (
              <Login onSuccess={handleAuth} />
            )}
          </RouteTransition>
        }
      />

      <Route
        path="/signup"
        element={
          <RouteTransition>
            {user ? (
              <Navigate to="/today" replace />
            ) : (
              <Signup onSuccess={handleAuth} />
            )}
          </RouteTransition>
        }
      />

      <Route
        path="/today"
        element={
          <RouteTransition>
            {user ? (
              <Today user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )}
          </RouteTransition>
        }
      />

      <Route
        path="*"
        element={
          <RouteTransition>
            <Navigate to="/" replace />
          </RouteTransition>
        }
      />
    </Routes>
  );
}
