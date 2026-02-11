import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { authApi } from "./api/auth";

import LandingPage from "./pages/LandingPage";
import Today from "./pages/Today";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";

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
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/today" replace />
          ) : (
            <Login onSuccess={setUser} />
          )
        }
      />
      <Route
        path="/signup"
        element={
          user ? (
            <Navigate to="/today" replace />
          ) : (
            <Signup onSuccess={setUser} />
          )
        }
      />

      <Route
        path="/today"
        element={
          user ? (
            <Today user={user} onLogout={() => setUser(null)} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
