import { useState } from "react";
import { authApi } from "../api/auth";
import { Link } from "react-router-dom";
import "../styles/Auth.css";
import useFlash from "../hooks/useFlash";

import LandingNav from "../components/LandingNav";
import FooterMinimal from "../components/FooterMinimal";
import { landingContent } from "../content/landingContent";

import logo from "../assets/stillroom-logo.svg";

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const flash = useFlash();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);

    try {
      await authApi.login(email, password);
      const me = await authApi.me();
      onSuccess?.(me.user);
      setErr("");
      flash.success(
        `Welcome back,${me.user.username}. Your stillroom is ready.`,
      );
    } catch (e2) {
      setErr(e2.message);
      flash.error(e2.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sr-page">
      <LandingNav brand={landingContent.brand} />

      <main className="auth-page">
        <div className="auth-card">
          <div className="auth-top">
            <Link to="/" className="sr-authBrand" aria-label="Home">
              <img src={logo} alt="Stillroom" className="sr-authLogo" />
            </Link>

            <div>
              <h2 className="auth-title">Enter Stillroom</h2>
              <p className="auth-sub">A quiet system for focused work.</p>
            </div>
          </div>

          {err && <div className="auth-error">{err}</div>}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <input
              type="text"
              name="prevent_autofill"
              autoComplete="off"
              style={{ display: "none" }}
            />

            <div className="auth-field">
              <label htmlFor="sr-login-email">Email</label>
              <input
                id="sr-login-email"
                name="sr_login_email"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field">
              <div className="auth-labelRow">
                <label htmlFor="sr-login-password">Password</label>
                <button
                  type="button"
                  className="auth-peek"
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>

              <input
                id="sr-login-password"
                name="sr_login_password"
                autoComplete="new-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button className="auth-btn" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>

            <div className="auth-foot">
              Don’t have an account? <Link to="/signup">Create one</Link>
            </div>
          </form>
        </div>
      </main>

      <FooterMinimal brand={landingContent.brand} />
    </div>
  );
}
